import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TodoItem } from "./TodoItem";
import { AddTodo } from "./AddTodo";
import type { TodoList, Todo, CreateTodoInput } from "@/types/todo";

interface TodoListComponentProps {
  todoList: TodoList;
  onUpdateList: (id: string, updates: Partial<TodoList>) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  onAddTodo: (listId: string, todo: CreateTodoInput) => Promise<void>;
  onUpdateTodo: (
    listId: string,
    todoId: string,
    updates: Partial<Todo>
  ) => Promise<void>;
  onDeleteTodo: (listId: string, todoId: string) => Promise<void>;
}

export function TodoListComponent({
  todoList,
  onUpdateList,
  onDeleteList,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
}: TodoListComponentProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState(todoList.title);
  const [editDescription, setEditDescription] = useState(
    todoList.description || ""
  );

  const handleSaveName = async () => {
    if (!editName.trim()) return;

    setIsUpdating(true);
    setError(null);
    try {
      await onUpdateList(todoList.id, {
        title: editName,
        description: editDescription,
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update todo list:", error);
      setError("Failed to update todo list. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this todo list? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      setError(null);
      try {
        await onDeleteList(todoList.id);
      } catch (error) {
        console.error("Failed to delete todo list:", error);
        setError("Failed to delete todo list. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditName(todoList.title);
    setEditDescription(todoList.description || "");
    setIsEditingName(false);
  };

  const completedTodos = todoList.todos.filter((todo) => todo.completed);
  const incompleteTodos = todoList.todos.filter((todo) => !todo.completed);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        {isEditingName ? (
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="List name"
              className="text-xl font-bold"
            />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleSaveName}
                disabled={!editName.trim() || isUpdating}
              >
                {isUpdating ? "Saving..." : <Check className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {todoList.title}
              </h2>
              {todoList.description && (
                <p className="text-gray-600 mt-1">{todoList.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {completedTodos.length} of {todoList.todos.length} completed
              </p>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isDeleting}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {todoList.todos.length > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (completedTodos.length / todoList.todos.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Add Todo */}
      <div className="mb-6">
        <AddTodo onAdd={(todo) => onAddTodo(todoList.id, todo)} />
      </div>

      {/* Todo Items */}
      <div className="space-y-3">
        {/* Incomplete Todos */}
        {incompleteTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={(todoId, updates) =>
              onUpdateTodo(todoList.id, todoId, updates)
            }
            onDelete={(todoId) => onDeleteTodo(todoList.id, todoId)}
          />
        ))}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <>
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Completed ({completedTodos.length})
              </h3>
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={(todoId, updates) =>
                    onUpdateTodo(todoList.id, todoId, updates)
                  }
                  onDelete={(todoId) => onDeleteTodo(todoList.id, todoId)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {todoList.todos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No todos yet. Add one above to get started!</p>
        </div>
      )}
    </div>
  );
}
