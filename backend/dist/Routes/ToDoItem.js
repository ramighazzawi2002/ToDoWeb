import { deleteToDoItem, addToDoItem, updateToDoItem, } from "../Controllers/ToDoItem.js";
import express from "express";
import { authMiddleware } from "../middleware/Auth.js";
const router = express.Router();
// POST /api/todo/:id/items - Add a new ToDo Item to a ToDo List
router.post("/:id", authMiddleware, addToDoItem);
// PUT /api/todo/items/:id - Update a ToDo Item by ID
router.put("/:id", authMiddleware, updateToDoItem);
// DELETE /api/todo/items/:id - Delete a ToDo Item by ID
router.delete("/:id", authMiddleware, deleteToDoItem);
export default router;
