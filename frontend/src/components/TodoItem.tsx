import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ""
  );
  const [editDueDate, setEditDueDate] = useState(
    new Date(todo.dueDate.getTime() - todo.dueDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  );

  const handleSave = async () => {
    if (!editTitle.trim() || !editDueDate) return;

    setIsUpdating(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle,
        description: editDescription,
        dueDate: new Date(editDueDate),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditDueDate(
      new Date(
        todo.dueDate.getTime() - todo.dueDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)
    );
    setIsEditing(false);
  };

  const toggleComplete = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 p-4 border rounded-lg bg-white">
        <div className="flex-1 space-y-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Todo title"
            className="font-medium"
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            className="text-sm"
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Due Date (optional)
            </label>
            <Input
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={!editTitle.trim() || isUpdating}
          >
            {isUpdating ? "Saving..." : <Check className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={toggleComplete}
        disabled={isUpdating || isDeleting}
        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
      />
      <div className="flex-1">
        <h3
          className={`font-medium ${
            todo.completed ? "line-through text-gray-500" : "text-gray-900"
          }`}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p
            className={`text-sm ${
              todo.completed ? "line-through text-gray-400" : "text-gray-600"
            }`}
          >
            {todo.description}
          </p>
        )}
        {todo.dueDate && (
          <p
            className={`text-xs ${
              todo.completed
                ? "line-through text-gray-400"
                : new Date(todo.dueDate) < new Date()
                ? "text-red-500 font-medium"
                : "text-gray-500"
            }`}
          >
            Due: {new Date(todo.dueDate).toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={isUpdating || isDeleting}
          className="text-gray-500 hover:text-gray-700"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isUpdating || isDeleting}
          className="text-red-500 hover:text-red-700"
        >
          {isDeleting ? "Deleting..." : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
