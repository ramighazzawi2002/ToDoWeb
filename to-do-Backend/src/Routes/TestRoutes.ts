import { Router } from "express";
import {
  testTaskReminders,
  testManualNotification,
} from "../Controllers/TestController";
import { authMiddleware } from "../middleware/Auth";

const router = Router();

// Test routes for notifications (protected by auth)
router.get("/task-reminders", authMiddleware, testTaskReminders);
router.post("/manual-notification", authMiddleware, testManualNotification);

export default router;
