import mongoose from "mongoose";
import { RedisClient } from "./config/redis.js";
import dotenv from "dotenv";
dotenv.config();
export function connectDB() {
    const url = process.env.DATABASE_URL;
    try {
        mongoose.connect(url);
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database2 connected: ${url}`);
    });
    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });
    return;
}
export async function connectRedis() {
    try {
        const redis = RedisClient.getInstance();
        await redis.connect();
        console.log("Redis connected successfully");
    }
    catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
}
