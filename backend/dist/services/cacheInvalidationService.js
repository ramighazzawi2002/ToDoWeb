import { CronCacheService } from "./cronCacheService.js";
/**
 * Middleware to invalidate cache after task operations
 * Call this after creating, updating, or deleting tasks
 */
export class CacheInvalidationService {
    /**
     * Invalidate cache after task creation
     */
    static async afterTaskCreate(taskData) {
        await CronCacheService.invalidateTasksCache();
        console.log("🔄 Cache invalidated after task creation");
    }
    /**
     * Invalidate cache after task update
     */
    static async afterTaskUpdate(taskId, updateData) {
        await CronCacheService.invalidateTasksCache();
        // If task is marked as completed, also clear its notification cache
        if (updateData.completed === true) {
            await CronCacheService.markAsNotified(taskId, "reminder");
            await CronCacheService.markAsNotified(taskId, "overdue");
        }
        console.log("🔄 Cache invalidated after task update");
    }
    /**
     * Invalidate cache after task deletion
     */
    static async afterTaskDelete(taskId) {
        await CronCacheService.invalidateTasksCache();
        console.log("🔄 Cache invalidated after task deletion");
    }
    /**
     * Invalidate cache after todo list operations
     */
    static async afterTodoListOperation() {
        await CronCacheService.invalidateTasksCache();
        console.log("🔄 Cache invalidated after todo list operation");
    }
}
