import { Hono } from "hono";
import * as os from "node:os";

const healthRoute = new Hono();

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

healthRoute.get("/", async (c) => {
  const memoryUsage = process.memoryUsage();
  const totalMemory =
    process.platform === "linux"
      ? parseInt(
          (await import("fs"))
            .readFileSync("/proc/meminfo", "utf8")
            .match(/MemTotal:\s*(\d+)/)?.[1] || "0",
        ) * 1024
      : os.totalmem();

  const usedMemory = memoryUsage.heapUsed;
  const healthData: HealthStatus = {
    status: usedMemory < totalMemory * 0.9 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    memory: {
      used: usedMemory,
      total: totalMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100000) / 100000, // 소수점 5자리까지
    },
  };

  const response = {
    success: true,
    message:
      healthData.status === "healthy"
        ? "Service is healthy"
        : "Service is unhealthy",
    data: healthData,
    timestamp: new Date().toISOString(),
  };

  const statusCode = healthData.status === "healthy" ? 200 : 503;

  return c.json(response, statusCode);
});

export default healthRoute;
