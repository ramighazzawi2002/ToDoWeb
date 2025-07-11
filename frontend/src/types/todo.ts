export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoList {
  id: string;
  title: string;
  description?: string;
  todos: Todo[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTodoInput = Omit<Todo, "id" | "createdAt" | "updatedAt">;
export type UpdateTodoInput = Partial<CreateTodoInput>;
export type CreateTodoListInput = Omit<
  TodoList,
  "id" | "todos" | "createdAt" | "updatedAt"
>;
export type UpdateTodoListInput = Partial<CreateTodoListInput>;
