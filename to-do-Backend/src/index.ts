import express from "express";
import { connectDB } from "./config";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./Routes/UserRoutes";
import toDoListRouter from "./Routes/ToDoList";
import toDoItemRouter from "./Routes/ToDoItem";
import testRoutes from "./Routes/TestRoutes";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" assert { type: "json" };
import { Server } from "socket.io";
import { initializeCronJobs } from "./services/cronService";

// Import models to ensure they are registered with Mongoose
import "./Models/User";
import "./Models/ToDoList";
import "./Models/ToDoItem";
const app = express();
const port = 3000;
connectDB();
app.use(
  cors({
    origin: "http://localhost:5173", // Update this to your frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/todo", toDoListRouter);
app.use("/api/todo/items", toDoItemRouter);
app.use("/api/test", testRoutes); // Register test routes

// Swagger Documentation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);

  // Initialize cron jobs after server starts
  initializeCronJobs();
});
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Store user socket mappings
const userSockets = new Map<string, string>(); // userId -> socketId
const socketUsers = new Map<string, string>(); // socketId -> userId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user authentication/identification
  socket.on("authenticate", (userId: string) => {
    // Store user-socket mapping
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user:${userId}`);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);

    // Send confirmation back to client
    socket.emit("authenticated", { userId, socketId: socket.id });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      console.log(`User ${userId} disconnected`);
    }
  });
});

// Export io instance for use in other files
export { io, userSockets };
