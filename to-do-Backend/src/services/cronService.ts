import * as nodeCron from "node-cron";
import ToDoItemModel from "../Models/ToDoItem";
import ToDoListModel from "../Models/ToDoList";
import { sendNotificationToUser } from "../utils/Notification";
import {
  formatTimeRemaining,
  formatOverdueTime,
  getPriorityLevel,
  generateReminderMessage,
} from "../utils/timeUtils";

interface TaskNotification {
  userId: string;
  taskId: string;
  title: string;
  dueDate: Date;
  timeRemaining: number; // in minutes
}

// Track sent notifications to avoid spam
const sentNotifications = new Set<string>();

export const startTaskReminderCron = () => {
  console.log("🕒 Starting task reminder cron job...");

  // Run every 5 minutes to check for tasks due within 30 minutes
  nodeCron.schedule("*/1 * * * *", async function () {
    console.log("🔍 Checking for tasks due within 30 minutes...");

    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      // Find all incomplete tasks that are due within the next 30 minutes
      const dueTasks = await ToDoItemModel.find({
        completed: false,
        isDeleted: false,
        dueDate: {
          $gte: now,
          $lte: thirtyMinutesFromNow,
        },
      }).populate({
        path: "toDoListId",
        model: "ToDoList",
        select: "userId title",
        match: { isDeleted: false },
      });

      console.log(`📋 Found ${dueTasks.length} tasks due within 30 minutes`);

      // Group tasks by user to send consolidated notifications
      const tasksByUser = new Map<string, any[]>();

      for (const task of dueTasks) {
        if (!task.toDoListId) {
          console.log(
            `⚠️ Skipping task ${task._id} - no valid todo list found`
          );
          continue;
        }

        const todoList = task.toDoListId as any;
        const userId = todoList.userId.toString();
        const taskId = task._id.toString();
        const notificationKey = `reminder-${userId}`;

        // Skip if we already sent a reminder notification for this user in this cycle
        if (sentNotifications.has(notificationKey)) {
          continue;
        }

        // Group tasks by user
        if (!tasksByUser.has(userId)) {
          tasksByUser.set(userId, []);
        }
        tasksByUser.get(userId)!.push({
          task,
          todoList,
          timeRemainingMs: task.dueDate.getTime() - now.getTime(),
        });
      }

      // Send consolidated notifications for each user
      for (const [userId, userTasks] of tasksByUser) {
        const notificationKey = `reminder-${userId}`;

        // Skip if already notified
        if (sentNotifications.has(notificationKey)) {
          continue;
        }

        // Sort tasks by due time (most urgent first)
        userTasks.sort((a, b) => a.timeRemainingMs - b.timeRemainingMs);

        // Prepare consolidated message
        let message: string;
        let priority: string;

        if (userTasks.length === 1) {
          const taskInfo = userTasks[0];
          const timeRemainingMinutes = Math.ceil(
            taskInfo.timeRemainingMs / (1000 * 60)
          );
          message = generateReminderMessage(
            taskInfo.task.title,
            timeRemainingMinutes
          );
          priority = getPriorityLevel(timeRemainingMinutes);
        } else {
          // Multiple tasks - create consolidated message
          const taskTitles = userTasks
            .slice(0, 3)
            .map((taskInfo) => {
              const timeRemainingMinutes = Math.ceil(
                taskInfo.timeRemainingMs / (1000 * 60)
              );
              return `"${taskInfo.task.title}" (${formatTimeRemaining(
                timeRemainingMinutes
              )})`;
            })
            .join("، ");

          const totalTasks = userTasks.length;
          const remainingTasks =
            totalTasks > 3 ? ` و ${totalTasks - 3} مهام أخرى` : "";

          message = `🔔 لديك ${totalTasks} مهام مستحقة قريباً: ${taskTitles}${remainingTasks}`;

          // Set priority based on most urgent task
          const mostUrgentTime = Math.ceil(
            userTasks[0].timeRemainingMs / (1000 * 60)
          );
          priority = getPriorityLevel(mostUrgentTime);
        }

        // Prepare task details for notification payload
        const taskDetails = userTasks.map((taskInfo) => ({
          taskId: taskInfo.task._id.toString(),
          taskTitle: taskInfo.task.title,
          dueDate: taskInfo.task.dueDate,
          timeRemainingMinutes: Math.ceil(
            taskInfo.timeRemainingMs / (1000 * 60)
          ),
          todoListTitle: taskInfo.todoList.title,
        }));

        // Send consolidated notification
        await sendNotificationToUser(userId, "task-reminder", {
          message,
          totalTasks: userTasks.length,
          tasks: taskDetails,
          priority,
        });

        // Mark user as notified for this cycle
        sentNotifications.add(notificationKey);

        console.log(
          `📧 Sent consolidated reminder to user ${userId} for ${userTasks.length} task(s)`
        );
      }
    } catch (error) {
      console.error("❌ Error in task reminder cron job:", error);
    }
  });

  // Clean up sent notifications every hour to allow re-notifications for recurring tasks
  nodeCron.schedule("0 * * * *", function () {
    console.log("🧹 Cleaning up sent notifications cache...");
    sentNotifications.clear();
  });

  console.log("✅ Task reminder cron job started successfully");
};

// Function to check overdue tasks (tasks that have passed their due date)
export const startOverdueTaskCron = () => {
  console.log("🕒 Starting overdue task checker cron job...");

  // Run every 10 minutes to check for overdue tasks
  nodeCron.schedule("*/10 * * * *", async function () {
    console.log("🔍 Checking for overdue tasks...");

    try {
      const now = new Date();

      // Find all incomplete tasks that are overdue
      const overdueTasks = await ToDoItemModel.find({
        completed: false,
        isDeleted: false,
        dueDate: { $lt: now },
      }).populate({
        path: "toDoListId",
        model: "ToDoList",
        select: "userId title",
        match: { isDeleted: false },
      });

      console.log(`📋 Found ${overdueTasks.length} overdue tasks`);

      // Group overdue tasks by user to send consolidated notifications
      const overdueTasksByUser = new Map<string, any[]>();

      for (const task of overdueTasks) {
        if (!task.toDoListId) {
          continue;
        }

        const todoList = task.toDoListId as any;
        const userId = todoList.userId.toString();
        const overdueKey = `overdue-${userId}`;

        // Skip if we already sent an overdue notification for this user in this cycle
        if (sentNotifications.has(overdueKey)) {
          continue;
        }

        // Group tasks by user
        if (!overdueTasksByUser.has(userId)) {
          overdueTasksByUser.set(userId, []);
        }

        // Calculate how long overdue
        const overdueMs = now.getTime() - task.dueDate.getTime();
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
        const overdueMinutes = Math.floor(
          (overdueMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        overdueTasksByUser.get(userId)!.push({
          task,
          todoList,
          overdueMs,
          overdueHours,
          overdueMinutes,
        });
      }

      // Send consolidated overdue notifications for each user
      for (const [userId, userTasks] of overdueTasksByUser) {
        const overdueKey = `overdue-${userId}`;

        // Skip if already notified
        if (sentNotifications.has(overdueKey)) {
          continue;
        }

        // Sort tasks by how overdue they are (most overdue first)
        userTasks.sort((a, b) => b.overdueMs - a.overdueMs);

        // Prepare consolidated message
        let overdueMessage: string;

        if (userTasks.length === 1) {
          const taskInfo = userTasks[0];
          const overdueTimeString = formatOverdueTime(
            taskInfo.overdueHours,
            taskInfo.overdueMinutes
          );
          overdueMessage = `🔴 مهمة متأخرة: "${taskInfo.task.title}" تأخرت ${overdueTimeString}`;
        } else {
          // Multiple overdue tasks - create consolidated message
          const taskTitles = userTasks
            .slice(0, 3)
            .map((taskInfo) => {
              const overdueTimeString = formatOverdueTime(
                taskInfo.overdueHours,
                taskInfo.overdueMinutes
              );
              return `"${taskInfo.task.title}" (تأخرت ${overdueTimeString})`;
            })
            .join("، ");

          const totalTasks = userTasks.length;
          const remainingTasks =
            totalTasks > 3 ? ` و ${totalTasks - 3} مهام أخرى` : "";

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

        // Mark user as notified for this cycle
        sentNotifications.add(overdueKey);

        console.log(
          `📧 Sent consolidated overdue notification to user ${userId} for ${userTasks.length} task(s)`
        );
      }
    } catch (error) {
      console.error("❌ Error in overdue task cron job:", error);
    }
  });

  console.log("✅ Overdue task cron job started successfully");
};

// Export both functions
export const initializeCronJobs = () => {
  startTaskReminderCron();
  startOverdueTaskCron();
  console.log("🚀 All cron jobs initialized");
};
