import { Request, Response } from "express";
import ToDoItemModel from "../Models/ToDoItem";
import ToDoListModel from "../Models/ToDoList";
import { sendNotificationToUser } from "../utils/Notification";

// Test endpoint to manually trigger task reminder notifications
export const testTaskReminders = async (req: Request, res: Response) => {
  // #swagger.tags = ['Testing']
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

    const notifications = [];

    for (const task of dueTasks) {
      if (!task.toDoListId) continue;

      const todoList = task.toDoListId as any;
      const userId = todoList.userId.toString();
      const timeRemainingMs = task.dueDate.getTime() - now.getTime();
      const timeRemainingMinutes = Math.ceil(timeRemainingMs / (1000 * 60));

      let message = `📝 لديك مهمة "${task.title}" متبقي لها ${timeRemainingMinutes} دقيقة`;

      await sendNotificationToUser(userId, "task-reminder", {
        message,
        taskId: task._id.toString(),
        taskTitle: task.title,
        dueDate: task.dueDate,
        timeRemainingMinutes,
        todoListTitle: todoList.title,
        priority:
          timeRemainingMinutes <= 5
            ? "urgent"
            : timeRemainingMinutes <= 15
            ? "high"
            : "normal",
      });

      notifications.push({
        userId,
        taskTitle: task.title,
        timeRemainingMinutes,
        message,
      });
    }

    res.status(200).json({
      message: "Test notifications sent successfully",
      data: {
        totalNotifications: notifications.length,
        notifications,
      },
    });
  } catch (error) {
    console.error("Test task reminders error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Test endpoint to send a manual notification to a specific user
export const testManualNotification = async (req: Request, res: Response) => {
  // #swagger.tags = ['Testing']
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Manual notification test.',
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User ID to send notification to' },
                message: { type: 'string', description: 'Notification message' }
              },
              required: ['userId', 'message']
            }
    } */
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        message: "userId and message are required",
        errors: {
          userId: !userId ? ["User ID is required"] : [],
          message: !message ? ["Message is required"] : [],
        },
      });
    }

    await sendNotificationToUser(userId, "manual-test", {
      message,
      timestamp: new Date(),
      type: "manual-test",
    });

    res.status(200).json({
      message: "Manual notification sent successfully",
      data: {
        userId,
        message,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Manual notification error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
