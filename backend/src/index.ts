import express from "express";
import { connectDB, connectRedis } from "./config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./Routes/UserRoutes.js";
import toDoListRouter from "./Routes/ToDoList.js";
import toDoItemRouter from "./Routes/ToDoItem.js";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { Server } from "socket.io";
import { initializeOptimizedCronJobs } from "./services/optimizedCronService.js";
// Import models to ensure they are registered with Mongoose
import "./Models/User.js";
import "./Models/ToDoList.js";
import "./Models/ToDoItem.js";
import dotenv from "dotenv";
const app = express();
dotenv.config();
const port = process.env.PORT;

// Initialize connections
connectDB();
connectRedis();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Update this to your frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/todo", toDoListRouter);
app.use("/api/todo/items", toDoItemRouter);

// Swagger Documentation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);

  // Choose between original or optimized cron jobs
  // Use the optimized version with Redis caching for better performance
  console.log("🚀 Starting optimized cron jobs with Redis caching...");
  initializeOptimizedCronJobs();

  // If you want to use the original version without caching, uncomment below:
  // initializeCronJobs();
});
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Update this to your frontend URL
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
