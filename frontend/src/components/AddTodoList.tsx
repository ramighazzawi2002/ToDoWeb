import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateTodoListInput } from "@/types/todo";

interface AddTodoListProps {
  onAdd: (todoList: CreateTodoListInput) => void;
}

export function AddTodoList({ onAdd }: AddTodoListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setTitle("");
    setDescription("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 h-24"
        >
          <div className="text-center">
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <p className="text-lg font-medium">Create New Todo List</p>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-3">Create New Todo List</h3>
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title (e.g., 'Work Tasks', 'Shopping')"
          autoFocus
          required
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <div className="flex space-x-2 pt-2">
          <Button type="submit" disabled={!title.trim()}>
            Create List
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
