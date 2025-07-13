import { LogOut, User, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TodoListComponent } from "@/components/TodoListComponent";
import { AddTodoList } from "@/components/AddTodoList";
import { useTodos } from "@/hooks/useTodos";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { API_URL, useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import io, { Socket } from "socket.io-client"; // Import the socket.io client library
import { useEffect, useState, useRef } from "react";

const Home = () => {
  const { user, logout: authLogout } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>("");
  const { showError, showInfo, showWarning, showTodoCreated } =
    useToastNotifications();

  useEffect(() => {
    console.log("Setting up socket connection...");

    // Create socket connection
    socketRef.current = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
      setSocketConnected(true);
      setSocketId(socket.id || "");
      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;
      console.log("User data:", userData);
      const userId = userData ? userData.data._id : "anonymous";
      console.log("Authenticating with userId:", userId);
      socket.emit("authenticate", userId);
    });

    socket.on("todo-item-created", (data: any) => {
      console.log("New todo item created:", data);
      showTodoCreated(data.message);
    });

    // 🔔 NEW: Task Reminder Notifications
    socket.on("task-reminder", (data: any) => {
      console.log("📝 Task reminder received:", data);

      // Show different toast types based on priority
      switch (data.priority) {
        case "urgent":
          showError("🚨 مهمة عاجلة!", data.message);
          // Optional: Play urgent sound
          // playNotificationSound("urgent");
          break;
        case "high":
          showWarning("⏰ تذكير مهم", data.message);
          // playNotificationSound("high");
          break;
        case "normal":
          showInfo("📝 تذكير", data.message);
          // playNotificationSound("normal");
          break;
        default:
          showInfo("📝 تذكير", data.message);
      }

      // // Optional: Browser notification for better visibility
      // showBrowserNotification("تذكير مهمة", data.message, data.priority);
    });

    // 🔴 NEW: Overdue Task Notifications
    socket.on("task-overdue", (data: any) => {
      console.log("🔴 Overdue task notification:", data);

      // Always show as error/warning for overdue tasks
      showError("🔴 مهمة متأخرة!", data.message);

      // Play urgent sound for overdue tasks
      // playNotificationSound("critical");

      // // Browser notification
      // showBrowserNotification("مهمة متأخرة", data.message, "critical");
    });

    socket.on("authenticated", (data: any) => {
      console.log("✅ Socket authenticated:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
      setSocketConnected(false);
      setSocketId("");
      showWarning("🔌 Connection Lost", "Trying to reconnect...");
    });

    socket.on("connect_error", (error: any) => {
      console.error("❌ Connection error:", error);
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up socket connection...");
      if (socket) {
        socket.off("connect");
        socket.off("todo-item-created");
        socket.off("task-reminder"); // Clean up new listeners
        socket.off("task-overdue");
        socket.off("authenticated");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.disconnect();
      }
    };
  }, [showTodoCreated, showWarning, showError, showInfo]); // Add new dependencies
  const navigate = useNavigate();
  const {
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
  } = useTodos();

  const totalTodos = todoLists.reduce(
    (acc, list) => acc + list.todos.length,
    0
  );
  const completedTodos = todoLists.reduce(
    (acc, list) => acc + list.todos.filter((todo) => todo.completed).length,
    0
  );

  // Responsive navbar state
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Todos</h1>
              {isLoading ? (
                <p className="text-sm text-gray-600">Loading...</p>
              ) : totalTodos > 0 ? (
                <p className="text-sm text-gray-600">
                  {completedTodos} of {totalTodos} tasks completed
                </p>
              ) : null}
            </div>
            {/* Hamburger for mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setNavOpen((v) => !v)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-label="Toggle navigation"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {navOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
            {/* Nav actions (desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTodoLists}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              {/* Socket Status Indicator */}
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {socketConnected
                    ? `Socket: ${socketId.slice(0, 8)}...`
                    : "Socket: Disconnected"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  Welcome back{user?.name ? `, ${user.name}` : ""}!
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await axios.post(
                      `${API_URL}/api/users/logout`,
                      {},
                      { withCredentials: true }
                    );
                    authLogout();
                    showInfo(
                      "👋 See you later!",
                      "You've been logged out successfully"
                    );
                    navigate("/login");
                  } catch (error) {
                    console.error("Logout failed:", error);
                    authLogout();
                    showError(
                      "❌ Logout Failed",
                      "There was an error logging you out, but you've been logged out locally"
                    );
                    navigate("/login");
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          {/* Mobile nav actions */}
          {navOpen && (
            <div className="md:hidden flex flex-col space-y-3 pb-4 animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fetchTodoLists();
                  setNavOpen(false);
                }}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-900 w-full justify-start"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""} mr-2`}
                />
                Refresh
              </Button>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {socketConnected
                    ? `Socket: ${socketId.slice(0, 8)}...`
                    : "Socket: Disconnected"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  Welcome back{user?.name ? `, ${user.name}` : ""}!
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await axios.post(
                      `${API_URL}/api/users/logout`,
                      {},
                      { withCredentials: true }
                    );
                    authLogout();
                    showInfo(
                      "👋 See you later!",
                      "You've been logged out successfully"
                    );
                    navigate("/login");
                  } catch (error) {
                    console.error("Logout failed:", error);
                    authLogout();
                    showError(
                      "❌ Logout Failed",
                      "There was an error logging you out, but you've been logged out locally"
                    );
                    navigate("/login");
                  }
                  setNavOpen(false);
                }}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your todo lists...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Todo Lists */}
        {!isLoading && (
          <>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {todoLists.map((todoList) => (
                <TodoListComponent
                  key={todoList.id}
                  todoList={todoList}
                  onUpdateList={updateTodoList}
                  onDeleteList={deleteTodoList}
                  onAddTodo={addTodo}
                  onUpdateTodo={updateTodo}
                  onDeleteTodo={deleteTodo}
                />
              ))}

              {/* Add New Todo List */}
              <AddTodoList onAdd={addTodoList} />
            </div>

            {todoLists.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to your Todo App!
                </h2>
                <p className="text-gray-600 mb-6">
                  Create your first todo list to get started organizing your
                  tasks.
                </p>
                <AddTodoList onAdd={addTodoList} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
