import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import type {
  TodoList,
  Todo,
  CreateTodoInput,
  CreateTodoListInput,
} from "@/types/todo";

// Generate a simple ID for demo purposes
const generateId = () => Math.random().toString(36).substr(2, 9);

// Transform API response to match our local data structure
const transformApiTodoList = (apiList: any): TodoList => ({
  id: apiList._id,
  title: apiList.title,
  description: apiList.description,
  todos: (apiList.toDoItems || [])
    .filter((todo: any) => !todo.isDeleted)
    .map((todo: any) => ({
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : new Date(),
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
    })),
  createdAt: new Date(apiList.createdAt),
  updatedAt: new Date(apiList.updatedAt),
});

export function useTodos() {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todo lists from API
  const fetchTodoLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:3000/api/todo/", {
        withCredentials: true,
      });

      console.log("API Response:", response.data); // Debug log

      // Transform API response to match our data structure
      // The API returns { message: "...", data: [...] }
      const apiData = response.data.data || response.data;
      const transformedLists = apiData
        .filter((list: any) => !list.isDeleted)
        .map(transformApiTodoList);

      console.log("Transformed Lists:", transformedLists); // Debug log
      setTodoLists(transformedLists);
    } catch (error: any) {
      if (error.status !== 404) {
        console.error("Failed to fetch todo lists:", error);
        console.error("Error response:", error.response?.data); // Debug log
        setError(
          error.response?.data?.message ||
            "Failed to load todo lists. Please try again."
        );
        if (error.status === 401) {
          // Handle unauthorized access, e.g., redirect to login
          axios.post(
            "http://localhost:3000/api/users/refresh-token",
            {},
            { withCredentials: true }
          );
          window.location.reload(); // Reload to refresh auth state
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load todo lists on component mount
  useEffect(() => {
    fetchTodoLists();
  }, [fetchTodoLists]);

  const addTodoList = useCallback(async (input: CreateTodoListInput) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/todo/",
        {
          title: input.title,
          description: input.description,
        },
        { withCredentials: true }
      );

      // Transform API response and add to state
      // Handle both direct data and nested data structures
      const apiData = response.data.data || response.data;
      const newList = transformApiTodoList(apiData);
      setTodoLists((prev) => [...prev, newList]);
    } catch (error) {
      console.error("Failed to create todo list:", error);
      // Fallback to local creation if API fails
      const newList: TodoList = {
        id: generateId(),
        title: input.title,
        description: input.description,
        todos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTodoLists((prev) => [...prev, newList]);
    }
  }, []);

  const updateTodoList = useCallback(
    async (id: string, updates: Partial<TodoList>) => {
      // Optimistic update
      const previousLists = [...todoLists];
      setTodoLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, ...updates, updatedAt: new Date() } : list
        )
      );

      try {
        await axios.put(
          `http://localhost:3000/api/todo/${id}`,
          {
            title: updates.title,
            description: updates.description,
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Failed to update todo list:", error);
        // Revert optimistic update on failure
        setTodoLists(previousLists);
        throw error; // Re-throw to let component handle error display
      }
    },
    [todoLists]
  );

  const deleteTodoList = useCallback(
    async (id: string) => {
      // Optimistic update
      const previousLists = [...todoLists];
      setTodoLists((prev) => prev.filter((list) => list.id !== id));

      try {
        await axios.delete(`http://localhost:3000/api/todo/${id}`, {
          withCredentials: true,
        });
      } catch (error) {
        console.error("Failed to delete todo list:", error);
        // Revert optimistic update on failure
        setTodoLists(previousLists);
        throw error; // Re-throw to let component handle error display
      }
    },
    [todoLists]
  );

  const addTodo = useCallback(
    async (listId: string, input: CreateTodoInput) => {
      try {
        const response = await axios.post(
          `http://localhost:3000/api/todo/items/${listId}`,
          {
            title: input.title,
            description: input.description,
            completed: input.completed || false,
            dueDate: input.dueDate.toISOString(),
          },
          { withCredentials: true }
        );

        // Transform API response and add to state
        const apiData = response.data.data || response.data;
        const newTodo: Todo = {
          id: apiData._id,
          title: apiData.title,
          description: apiData.description,
          completed: apiData.completed,
          dueDate: apiData.dueDate ? new Date(apiData.dueDate) : new Date(),
          createdAt: new Date(apiData.createdAt),
          updatedAt: new Date(apiData.updatedAt),
        };

        setTodoLists((prev) =>
          prev.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  todos: [...list.todos, newTodo],
                  updatedAt: new Date(),
                }
              : list
          )
        );
      } catch (error) {
        console.error("Failed to create todo:", error);
        // Fallback to local creation if API fails
        const newTodo: Todo = {
          id: generateId(),
          title: input.title,
          description: input.description,
          completed: input.completed || false,
          dueDate: input.dueDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setTodoLists((prev) =>
          prev.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  todos: [...list.todos, newTodo],
                  updatedAt: new Date(),
                }
              : list
          )
        );
      }
    },
    []
  );

  const updateTodo = useCallback(
    async (listId: string, todoId: string, updates: Partial<Todo>) => {
      // Optimistic update
      const previousLists = [...todoLists];
      setTodoLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                todos: list.todos.map((todo) =>
                  todo.id === todoId
                    ? { ...todo, ...updates, updatedAt: new Date() }
                    : todo
                ),
                updatedAt: new Date(),
              }
            : list
        )
      );

      try {
        await axios.put(
          `http://localhost:3000/api/todo/items/${todoId}`,
          {
            title: updates.title,
            description: updates.description,
            completed: updates.completed,
            dueDate: updates.dueDate
              ? updates.dueDate.toISOString()
              : undefined,
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Failed to update todo:", error);
        // Revert optimistic update on failure
        setTodoLists(previousLists);
        throw error; // Re-throw to let component handle error display
      }
    },
    [todoLists]
  );

  const deleteTodo = useCallback(
    async (listId: string, todoId: string) => {
      // Optimistic update
      const previousLists = [...todoLists];
      setTodoLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                todos: list.todos.filter((todo) => todo.id !== todoId),
                updatedAt: new Date(),
              }
            : list
        )
      );

      try {
        await axios.delete(`http://localhost:3000/api/todo/items/${todoId}`, {
          withCredentials: true,
        });
      } catch (error) {
        console.error("Failed to delete todo:", error);
        // Revert optimistic update on failure
        setTodoLists(previousLists);
        throw error; // Re-throw to let component handle error display
      }
    },
    [todoLists]
  );

  return {
    todoLists,
    isLoading,
    error,
    fetchTodoLists,
    addTodoList,
    updateTodoList,
    deleteTodoList,
    addTodo,
    updateTodo,
    deleteTodo,
  };
}
