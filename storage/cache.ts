import { connect } from "https://deno.land/x/redis@v0.34.0/mod.ts";
import {
  brightGreen,
  brightRed,
  cyan,
  yellow,
} from "https://deno.land/std@0.203.0/fmt/colors.ts";

const redis = await connect({
  hostname: "127.0.0.1",
  port: 6379,
});

class Cache {
  private static instance: Cache;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new Cache();
      return this.instance;
    }

    return this.instance;
  }

  private log(message: string, level: "INFO" | "WARN" | "ERROR" = "INFO") {
    const now = new Date().toISOString();
    const levelColor =
      level === "INFO" ? brightGreen : level === "WARN" ? yellow : brightRed;
    console.log(`[${cyan(now)}] ${levelColor(level)}: ${message}`);
  }

  async add(key: string, data: any) {
    try {
      const res = await redis.set(key, JSON.stringify(data));
      this.log(`Cache write: key=${key} result=${res}`, "INFO");
    } catch (error) {
      this.log(`Error writing to cache: ${(error as any).message}`, "ERROR");
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const res = await redis.get(key);

      if (res) {
        this.log(`Cache hit: key=${key}`, "INFO");
        return JSON.parse(res);
      }

      this.log(`Cache miss: key=${key}`, "WARN");
      return null;
    } catch (error) {
      this.log(`Error reading from cache: ${(error as any).message}`, "ERROR");
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const res = await redis.del(key);

      if (res) {
        this.log(`Cache delete: key=${key}`, "INFO");
      } else {
        this.log(`Cache key not found for deletion: key=${key}`, "WARN");
      }
    } catch (error) {
      this.log(`Error deleting from cache: ${(error as any).message}`, "ERROR");
    }
  }
}

export default Cache;
