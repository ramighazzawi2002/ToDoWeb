import * as nodeCron from "node-cron";
import UserModel from "../Models/User";
import { sendNotificationToUser } from "../utils/Notification";
import { formatTimeRemaining, formatOverdueTime, getPriorityLevel, generateReminderMessage, } from "../utils/timeUtils";
import { CronCacheService } from "./cronCacheService";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Configure nodemailer transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.Email,
        clientId: process.env.ClientId,
        clientSecret: process.env.ClientSecret,
        refreshToken: process.env.refreshToken,
    },
});
// Helper function to send email notifications
const sendEmailNotification = async (userEmail, userName, subject, message, tasks) => {
    try {
        console.log(`📧 Starting email send process for ${userEmail}`);
        console.log(`📧 Email subject: ${subject}`);
        console.log(`📧 Number of tasks: ${tasks.length}`);
        const taskList = tasks
            .map((task, index) => `${index + 1}. ${task.taskTitle} - Due: ${new Date(task.dueDate).toLocaleString("ar-EG")}`)
            .join("\n");
        const emailContent = `
مرحباً ${userName},

${message}

تفاصيل المهام:
${taskList}

يمكنك تسجيل الدخول إلى تطبيق المهام لإدارة مهامك.

مع أطيب التحيات،
فريق تطبيق المهام
    `;
        const mailOptions = {
            from: '"تطبيق المهام" <rami.ghazzawiabed@gmail.com>',
            to: userEmail,
            subject: subject,
            text: emailContent,
            html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">مرحباً ${userName}</h2>
          <p style="font-size: 16px; line-height: 1.5;">${message}</p>
          
          <h3 style="color: #555;">تفاصيل المهام:</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${tasks
                .map((task) => `
              <li style="background: #f5f5f5; margin: 10px 0; padding: 15px; border-radius: 5px;">
                <strong>${task.taskTitle}</strong><br>
                <span style="color: #666;">تاريخ الاستحقاق: ${new Date(task.dueDate).toLocaleString("ar-EG")}</span><br>
                <span style="color: #666;">قائمة المهام: ${task.todoListTitle}</span>
              </li>
            `)
                .join("")}
          </ul>
          
          <p style="margin-top: 30px; color: #666;">
            يمكنك تسجيل الدخول إلى تطبيق المهام لإدارة مهامك.
          </p>
          
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">
            مع أطيب التحيات،<br>
            فريق تطبيق المهام
          </p>
        </div>
      `,
        };
        console.log(`📧 Attempting to send email via transporter...`);
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${userEmail}`, result.messageId);
    }
    catch (error) {
        console.error(`❌ Error sending email to ${userEmail}:`, error);
        if (error instanceof Error) {
            console.error(`❌ Error details:`, error.message);
        }
    }
};
export const startOptimizedTaskReminderCron = () => {
    console.log("🕒 Starting optimized task reminder cron job with Redis caching...");
    // Run every 5 minutes to check for tasks due within 30 minutes
    nodeCron.schedule("*/5 * * * *", async function () {
        console.log("🔍 Checking for tasks due within 30 minutes (with caching)...");
        try {
            const now = new Date();
            const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
            // Use cached query instead of direct database access
            const dueTasks = await CronCacheService.getDueTasks(thirtyMinutesFromNow, now);
            console.log(`📋 Found ${dueTasks.length} tasks due within 30 minutes`);
            // Group tasks by user to send consolidated notifications
            const tasksByUser = new Map();
            for (const task of dueTasks) {
                if (!task.toDoListId) {
                    console.log(`⚠️ Skipping task ${task._id} - no valid todo list found`);
                    continue;
                }
                const todoList = task.toDoListId;
                const userId = todoList.userId.toString();
                const taskId = task._id.toString();
                // Use Redis-based notification tracking instead of in-memory Map
                const wasNotified = await CronCacheService.wasRecentlyNotified(taskId, "reminder", 25 // 25 minutes cooldown
                );
                if (wasNotified) {
                    continue; // Skip if recently notified
                }
                // Group tasks by user
                if (!tasksByUser.has(userId)) {
                    tasksByUser.set(userId, []);
                }
                tasksByUser.get(userId).push({
                    task,
                    todoList,
                    timeRemainingMs: new Date(task.dueDate).getTime() - now.getTime(),
                });
            }
            // Send consolidated notifications for each user
            for (const [userId, userTasks] of tasksByUser) {
                // Sort tasks by due time (most urgent first)
                userTasks.sort((a, b) => a.timeRemainingMs - b.timeRemainingMs);
                // Prepare consolidated message
                let message;
                let priority;
                if (userTasks.length === 1) {
                    const taskInfo = userTasks[0];
                    const timeRemainingMinutes = Math.ceil(taskInfo.timeRemainingMs / (1000 * 60));
                    message = generateReminderMessage(taskInfo.task.title, timeRemainingMinutes);
                    priority = getPriorityLevel(timeRemainingMinutes);
                }
                else {
                    // Multiple tasks - create consolidated message
                    const taskTitles = userTasks
                        .slice(0, 3)
                        .map((taskInfo) => {
                        const timeRemainingMinutes = Math.ceil(taskInfo.timeRemainingMs / (1000 * 60));
                        return `"${taskInfo.task.title}" (${formatTimeRemaining(timeRemainingMinutes)})`;
                    })
                        .join("، ");
                    const totalTasks = userTasks.length;
                    const remainingTasks = totalTasks > 3 ? ` و ${totalTasks - 3} مهام أخرى` : "";
                    message = `🔔 لديك ${totalTasks} مهام مستحقة قريباً: ${taskTitles}${remainingTasks}`;
                    // Set priority based on most urgent task
                    const mostUrgentTime = Math.ceil(userTasks[0].timeRemainingMs / (1000 * 60));
                    priority = getPriorityLevel(mostUrgentTime);
                }
                // Prepare task details for notification payload
                const taskDetails = userTasks.map((taskInfo) => ({
                    taskId: taskInfo.task._id.toString(),
                    taskTitle: taskInfo.task.title,
                    dueDate: taskInfo.task.dueDate,
                    timeRemainingMinutes: Math.ceil(taskInfo.timeRemainingMs / (1000 * 60)),
                    todoListTitle: taskInfo.todoList.title,
                }));
                // Send consolidated notification
                await sendNotificationToUser(userId, "task-reminder", {
                    message,
                    totalTasks: userTasks.length,
                    tasks: taskDetails,
                    priority,
                });
                // Send email notification
                try {
                    console.log(`🔍 Attempting to send email for user ${userId}...`);
                    const user = await UserModel.findById(userId).select("email firstName lastName");
                    console.log(`👤 User found:`, user ? `${user.email}` : "No user found");
                    if (user && user.email) {
                        const userName = `${user.firstName} ${user.lastName}`;
                        const emailSubject = userTasks.length === 1
                            ? "🔔 تذكير: مهمة مستحقة قريباً"
                            : `🔔 تذكير: ${userTasks.length} مهام مستحقة قريباً`;
                        console.log(`📧 Sending email to ${user.email} with subject: ${emailSubject}`);
                        await sendEmailNotification(user.email, userName, emailSubject, message, taskDetails);
                    }
                    else {
                        console.log(`⚠️ No email found for user ${userId}`);
                    }
                }
                catch (emailError) {
                    console.error(`❌ Error sending email for user ${userId}:`, emailError);
                }
                // Mark each task as notified using Redis
                for (const taskInfo of userTasks) {
                    await CronCacheService.markAsNotified(taskInfo.task._id.toString(), "reminder");
                }
                console.log(`📧 Sent consolidated reminder to user ${userId} for ${userTasks.length} task(s)`);
            }
        }
        catch (error) {
            console.error("❌ Error in optimized task reminder cron job:", error);
        }
    });
    console.log("✅ Optimized task reminder cron job started successfully");
};
// Function to check overdue tasks with Redis caching
export const startOptimizedOverdueTaskCron = () => {
    console.log("🕒 Starting optimized overdue task checker cron job with Redis caching...");
    // Run every 2 minutes to check for overdue tasks
    nodeCron.schedule("*/2 * * * *", async function () {
        console.log("🔍 Checking for overdue tasks (with caching)...");
        try {
            const now = new Date();
            // Use cached query instead of direct database access
            const overdueTasks = await CronCacheService.getOverdueTasks(now);
            console.log(`📋 Found ${overdueTasks.length} overdue tasks`);
            // Group overdue tasks by user to send consolidated notifications
            const overdueTasksByUser = new Map();
            for (const task of overdueTasks) {
                if (!task.toDoListId) {
                    continue;
                }
                const todoList = task.toDoListId;
                const userId = todoList.userId.toString();
                const taskId = task._id.toString();
                // Use Redis-based notification tracking with 1 hour cooldown for overdue
                const wasNotified = await CronCacheService.wasRecentlyNotified(taskId, "overdue", 60 // 1 hour cooldown for overdue notifications
                );
                if (wasNotified) {
                    continue; // Skip if recently notified
                }
                // Group tasks by user
                if (!overdueTasksByUser.has(userId)) {
                    overdueTasksByUser.set(userId, []);
                }
                // Calculate how long overdue
                const overdueMs = now.getTime() - new Date(task.dueDate).getTime();
                const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
                const overdueMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
                overdueTasksByUser.get(userId).push({
                    task,
                    todoList,
                    overdueMs,
                    overdueHours,
                    overdueMinutes,
                });
            }
            // Send consolidated overdue notifications for each user
            for (const [userId, userTasks] of overdueTasksByUser) {
                // Sort tasks by how overdue they are (most overdue first)
                userTasks.sort((a, b) => b.overdueMs - a.overdueMs);
                // Prepare consolidated message
                let overdueMessage;
                if (userTasks.length === 1) {
                    const taskInfo = userTasks[0];
                    const overdueTimeString = formatOverdueTime(taskInfo.overdueHours, taskInfo.overdueMinutes);
                    overdueMessage = `🔴 مهمة متأخرة: "${taskInfo.task.title}" تأخرت ${overdueTimeString}`;
                }
                else {
                    // Multiple overdue tasks - create consolidated message
                    const taskTitles = userTasks
                        .slice(0, 3)
                        .map((taskInfo) => {
                        const overdueTimeString = formatOverdueTime(taskInfo.overdueHours, taskInfo.overdueMinutes);
                        return `"${taskInfo.task.title}" (تأخرت ${overdueTimeString})`;
                    })
                        .join("، ");
                    const totalTasks = userTasks.length;
                    const remainingTasks = totalTasks > 3 ? ` و ${totalTasks - 3} مهام أخرى` : "";
                    overdueMessage = `🔴 لديك ${totalTasks} مهام متأخرة: ${taskTitles}${remainingTasks}`;
                }
                // Prepare task details for notification payload
                const taskDetails = userTasks.map((taskInfo) => ({
                    taskId: taskInfo.task._id.toString(),
                    taskTitle: taskInfo.task.title,
                    dueDate: taskInfo.task.dueDate,
                    overdueHours: taskInfo.overdueHours,
                    overdueMinutes: taskInfo.overdueMinutes,
                    todoListTitle: taskInfo.todoList.title,
                }));
                // Send consolidated overdue notification
                await sendNotificationToUser(userId, "task-overdue", {
                    message: overdueMessage,
                    totalTasks: userTasks.length,
                    tasks: taskDetails,
                    priority: "critical",
                });
                // Send email notification for overdue tasks
                try {
                    console.log(`🔍 Attempting to send overdue email for user ${userId}...`);
                    const user = await UserModel.findById(userId).select("email firstName lastName");
                    console.log(`👤 User found:`, user ? `${user.email}` : "No user found");
                    if (user && user.email) {
                        const userName = `${user.firstName} ${user.lastName}`;
                        const emailSubject = userTasks.length === 1
                            ? "🔴 تنبيه: مهمة متأخرة"
                            : `🔴 تنبيه: ${userTasks.length} مهام متأخرة`;
                        console.log(`📧 Sending overdue email to ${user.email} with subject: ${emailSubject}`);
                        await sendEmailNotification(user.email, userName, emailSubject, overdueMessage, taskDetails);
                    }
                    else {
                        console.log(`⚠️ No email found for user ${userId}`);
                    }
                }
                catch (emailError) {
                    console.error(`❌ Error sending overdue email for user ${userId}:`, emailError);
                }
                // Mark each overdue task as notified using Redis
                for (const taskInfo of userTasks) {
                    await CronCacheService.markAsNotified(taskInfo.task._id.toString(), "overdue");
                }
                console.log(`📧 Sent consolidated overdue notification to user ${userId} for ${userTasks.length} task(s)`);
            }
        }
        catch (error) {
            console.error("❌ Error in optimized overdue task cron job:", error);
        }
    });
    console.log("✅ Optimized overdue task cron job started successfully");
};
// Cache cleanup job - runs every hour
export const startCacheCleanupCron = () => {
    console.log("🕒 Starting cache cleanup cron job...");
    nodeCron.schedule("0 * * * *", async function () {
        console.log("🧹 Running cache cleanup...");
        await CronCacheService.cleanupOldCache();
    });
    console.log("✅ Cache cleanup cron job started successfully");
};
// Export optimized functions
export const initializeOptimizedCronJobs = () => {
    startOptimizedTaskReminderCron();
    startOptimizedOverdueTaskCron();
    startCacheCleanupCron();
    console.log("🚀 All optimized cron jobs with Redis caching initialized");
};
