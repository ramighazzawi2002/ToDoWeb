import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
export class RedisClient {
  private static instance: Redis | null = null;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const host = process.env.REDIS_HOST;
      const port = process.env.REDIS_PORT;
      const password = process.env.REDIS_PASSWORD;

      // Validate required environment variables
      if (!host || !port || !password) {
        throw new Error(
          "Missing required Redis environment variables: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD"
        );
      }

      // Convert port to number
      const portNumber = parseInt(port, 10);
      if (isNaN(portNumber)) {
        throw new Error(`Invalid REDIS_PORT: ${port}. Must be a valid number.`);
      }

      RedisClient.instance = new Redis({
        host,
        port: portNumber,
        username: "default",
        password,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });

      RedisClient.instance.on("connect", () => {
        console.log("✅ Redis connected successfully");
      });

      RedisClient.instance.on("error", (error) => {
        console.error("❌ Redis connection error:", error);
      });

      RedisClient.instance.on("ready", () => {
        console.log("🚀 Redis is ready to accept commands");
      });
    }

    return RedisClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
      console.log("🔌 Redis disconnected");
    }
  }
}

export const redis = RedisClient.getInstance();
