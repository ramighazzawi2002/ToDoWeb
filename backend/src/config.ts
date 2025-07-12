import { Error } from "mongoose";
import mongoose from "mongoose";
import { RedisClient } from "./config/redis.js";
import dotenv from "dotenv";

dotenv.config();

export function connectDB() {
  const url = process.env.DATABASE_URL;

  try {
    mongoose.connect(url as string);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_: any) => {
    console.log(`Database connected: ${url}`);
  });

  dbConnection.on("error", (err: Error) => {
    console.error(`connection error: ${err}`);
  });
  return;
}

export async function connectRedis() {
  try {
    const redis = RedisClient.getInstance();
    await redis.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}
