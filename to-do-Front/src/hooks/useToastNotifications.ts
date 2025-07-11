import { useToast } from "@/components/ui/toast";
import { useCallback } from "react";

export const useToastNotifications = () => {
  const { addToast } = useToast();

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      addToast({
        title,
        description,
        type: "success",
        duration: 4000,
      });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, description?: string) => {
      addToast({
        title,
        description,
        type: "error",
        duration: 6000,
      });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string) => {
      addToast({
        title,
        description,
        type: "info",
        duration: 5000,
      });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string) => {
      addToast({
        title,
        description,
        type: "warning",
        duration: 5000,
      });
    },
    [addToast]
  );

  // Creative todo-specific notifications
  const showTodoCreated = useCallback(
    (todoTitle?: string) => {
      addToast({
        title: "مهمة غير مكتملة",
        description: todoTitle,
        type: "warning",
        duration: 4000,
      });
    },
    [addToast]
  );

  const showTodoCompleted = useCallback(
    (todoTitle?: string) => {
      const titles = [
        "🎊 Task Completed!",
        "✅ Well Done!",
        "🏆 Achievement Unlocked!",
        "💪 Great Job!",
      ];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];

      addToast({
        title: randomTitle,
        description: todoTitle
          ? `"${todoTitle}" is complete!`
          : "Another task completed!",
        type: "success",
        duration: 3000,
      });
    },
    [addToast]
  );

  const showTodoDeleted = useCallback(
    (todoTitle?: string) => {
      addToast({
        title: "🗑️ Task Removed",
        description: todoTitle
          ? `"${todoTitle}" has been deleted`
          : "Task removed from your list",
        type: "info",
        duration: 3000,
      });
    },
    [addToast]
  );

  const showConnectionStatus = useCallback(
    (connected: boolean) => {
      if (connected) {
        addToast({
          title: "🌐 Connected!",
          description: "Real-time sync is active",
          type: "success",
          duration: 3000,
        });
      } else {
        addToast({
          title: "🔌 Disconnected",
          description: "Working offline",
          type: "warning",
          duration: 4000,
        });
      }
    },
    [addToast]
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showTodoCreated,
    showTodoCompleted,
    showTodoDeleted,
    showConnectionStatus,
  };
};
