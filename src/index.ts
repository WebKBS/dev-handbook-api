import { AppError } from "@/utils/appError.ts";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import healthRoute from "src/common/routes/health.route";
import { z } from "zod";
import { envConfig } from "./config/env";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware";

const app = new Hono();

app.use(
  logger((message: string, ...rest: string[]) => {
    console.log(message, ...rest);
  }),
);

app.use(secureHeaders());
app.use("*", rateLimitMiddleware);

app.use(
  cors({
    origin: (origin) => {
      const whitelist = [
        envConfig.ADMIN_CORS_ORIGIN,
        envConfig.SERVICE_CORS_ORIGIN,
      ];
      return whitelist.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

/** 라우터 등록 */
app.route("/health", healthRoute);

app.use(
  secureHeaders({
    xFrameOptions: "DENY",
  }),
);

app.notFound((c) => c.json({ message: "Not Found" }, 404));

app.onError((error, c) => {
  console.error("🔥 Error occurred:", error);

  if (error instanceof z.ZodError) {
    console.error(error);
    return c.json(
      { message: error.issues.map((issue) => issue.message).join(", ") },
      400,
    );
  }

  if (error instanceof AppError) {
    return c.json({ message: error.message }, { status: error.status });
  }

  if (error instanceof HTTPException) {
    return c.json({ message: error.message }, { status: error.status });
  }

  return c.json({ error: "Internal Server Error" }, 500);
});

export default {
  port: envConfig.PORT || 8000,
  fetch: app.fetch,
};
