import {
  createToDoList,
  updateToDoList,
  deleteToDoList,
  getToDoLists,
} from "../Controllers/ToDoList";
import { Router } from "express";
import { authMiddleware } from "../middleware/Auth";

const router = Router();

// POST /api/todo - Create a new ToDo List
router.post("/", authMiddleware, createToDoList);
// GET /api/todo - Get all ToDo Lists for the authenticated user
router.get("/", authMiddleware, getToDoLists);
// PUT /api/todo/:id - Update a ToDo List by ID
router.put("/:id", authMiddleware, updateToDoList);

// DELETE /api/todo/:id - Delete a ToDo List by ID
router.delete("/:id", authMiddleware, deleteToDoList);

export default router;
