import { redis } from "../config/redis.js";
import ToDoItemModel from "../Models/ToDoItem.js";
import ToDoListModel from "../Models/ToDoList.js";

export class CronCacheService {
  private static readonly CACHE_KEYS = {
    DUE_TASKS: "cron:due_tasks",
    OVERDUE_TASKS: "cron:overdue_tasks",
    USER_TASKS_PREFIX: "cron:user_tasks:",
    LAST_NOTIFICATION_PREFIX: "cron:last_notif:",
  };

  private static readonly CACHE_TTL = {
    TASKS: 300, // 5 minutes
    NOTIFICATIONS: 7200, // 2 hours
  };

  /**
   * Get cached due tasks or fetch from database
   */
  static async getDueTasks(thirtyMinutesFromNow: Date, now: Date) {
    const cacheKey = `${
      this.CACHE_KEYS.DUE_TASKS
    }:${now.getTime()}:${thirtyMinutesFromNow.getTime()}`;

    try {
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("📋 Using cached due tasks");
        return JSON.parse(cached);
      }

      // If not in cache, fetch from database
      console.log("🔍 Fetching due tasks from database");
      const dueTasks = await ToDoItemModel.find({
        completed: false,
        isDeleted: false,
        dueDate: {
          $gte: now,
          $lte: thirtyMinutesFromNow,
        },
      })
        .populate({
          path: "toDoListId",
          model: "ToDoList",
          select: "userId title",
          match: { isDeleted: false },
        })
        .lean(); // Use lean() for better performance

      // Cache the result
      await redis.setex(
        cacheKey,
        this.CACHE_TTL.TASKS,
        JSON.stringify(dueTasks)
      );

      return dueTasks;
    } catch (error) {
      console.error("❌ Error in getDueTasks cache:", error);
      // Fallback to direct database query
      return await ToDoItemModel.find({
        completed: false,
        isDeleted: false,
        dueDate: {
          $gte: now,
          $lte: thirtyMinutesFromNow,
        },
      })
        .populate({
          path: "toDoListId",
          model: "ToDoList",
          select: "userId title",
          match: { isDeleted: false },
        })
        .lean();
    }
  }

  /**
   * Get cached overdue tasks or fetch from database
   */
  static async getOverdueTasks(now: Date) {
    const cacheKey = `${this.CACHE_KEYS.OVERDUE_TASKS}:${now.getTime()}`;

    try {
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("📋 Using cached overdue tasks");
        return JSON.parse(cached);
      }

      // If not in cache, fetch from database
      console.log("🔍 Fetching overdue tasks from database");
      const overdueTasks = await ToDoItemModel.find({
        completed: false,
        isDeleted: false,
        dueDate: { $lt: now },
      })
        .populate({
          path: "toDoListId",
          model: "ToDoList",
          select: "userId title",
          match: { isDeleted: false },
        })
        .lean(); // Use lean() for better performance

      // Cache the result
      await redis.setex(
        cacheKey,
        this.CACHE_TTL.TASKS,
        JSON.stringify(overdueTasks)
      );

      return overdueTasks;
    } catch (error) {
      console.error("❌ Error in getOverdueTasks cache:", error);
      // Fallback to direct database query
      return await ToDoItemModel.find({
        completed: false,
        isDeleted: false,
        dueDate: { $lt: now },
      })
        .populate({
          path: "toDoListId",
          model: "ToDoList",
          select: "userId title",
          match: { isDeleted: false },
        })
        .lean();
    }
  }

  /**
   * Check if notification was recently sent for a task
   */
  static async wasRecentlyNotified(
    taskId: string,
    notificationType: "reminder" | "overdue",
    cooldownMinutes: number = 25
  ): Promise<boolean> {
    const key = `${this.CACHE_KEYS.LAST_NOTIFICATION_PREFIX}${notificationType}:${taskId}`;

    try {
      const lastNotified = await redis.get(key);
      if (!lastNotified) return false;

      const lastNotifiedTime = parseInt(lastNotified);
      const now = Date.now();
      const cooldownMs = cooldownMinutes * 60 * 1000;

      return now - lastNotifiedTime < cooldownMs;
    } catch (error) {
      console.error("❌ Error checking notification cache:", error);
      return false; // If cache fails, allow notification
    }
  }

  /**
   * Mark a task as notified
   */
  static async markAsNotified(
    taskId: string,
    notificationType: "reminder" | "overdue"
  ): Promise<void> {
    const key = `${this.CACHE_KEYS.LAST_NOTIFICATION_PREFIX}${notificationType}:${taskId}`;
    const now = Date.now();

    try {
      await redis.setex(key, this.CACHE_TTL.NOTIFICATIONS, now.toString());
    } catch (error) {
      console.error("❌ Error marking notification in cache:", error);
    }
  }

  /**
   * Get user's cached task summary to avoid duplicate notifications
   */
  static async getUserTasksSummary(userId: string): Promise<string[]> {
    const key = `${this.CACHE_KEYS.USER_TASKS_PREFIX}${userId}`;

    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error("❌ Error getting user tasks summary:", error);
      return [];
    }
  }

  /**
   * Cache user's current task IDs to track changes
   */
  static async cacheUserTasksSummary(
    userId: string,
    taskIds: string[]
  ): Promise<void> {
    const key = `${this.CACHE_KEYS.USER_TASKS_PREFIX}${userId}`;

    try {
      await redis.setex(key, this.CACHE_TTL.TASKS, JSON.stringify(taskIds));
    } catch (error) {
      console.error("❌ Error caching user tasks summary:", error);
    }
  }

  /**
   * Clean up old cache entries
   */
  static async cleanupOldCache(): Promise<void> {
    try {
      const pattern = `${this.CACHE_KEYS.LAST_NOTIFICATION_PREFIX}*`;
      const keys = await redis.keys(pattern);

      if (keys.length === 0) return;

      // Check each key and remove if older than 2 hours
      const now = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;
      const keysToDelete: string[] = [];

      for (const key of keys) {
        try {
          const value = await redis.get(key);
          if (value) {
            const timestamp = parseInt(value);
            if (now - timestamp > twoHoursMs) {
              keysToDelete.push(key);
            }
          }
        } catch (error) {
          // If we can't parse the key, add it to deletion list
          keysToDelete.push(key);
        }
      }

      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
        console.log(`🧹 Cleaned up ${keysToDelete.length} old cache entries`);
      }
    } catch (error) {
      console.error("❌ Error cleaning up cache:", error);
    }
  }

  /**
   * Invalidate cache when tasks are updated
   */
  static async invalidateTasksCache(): Promise<void> {
    try {
      const patterns = [
        `${this.CACHE_KEYS.DUE_TASKS}*`,
        `${this.CACHE_KEYS.OVERDUE_TASKS}*`,
      ];

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }

      console.log("🧹 Invalidated tasks cache");
    } catch (error) {
      console.error("❌ Error invalidating tasks cache:", error);
    }
  }
}
