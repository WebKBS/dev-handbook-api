import { initSentry } from "@/config/sentry.ts";
import serviceRouter from "@/modules/service/service.router.ts";
import serviceRoute from "@/modules/service/service.router.ts";
import { AppError } from "@/utils/appError.ts";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import * as Sentry from "@sentry/bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import healthRoute from "src/common/routes/health.route";
import { z } from "zod";
import { envConfig } from "./config/env";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware";

initSentry();

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
        // envConfig.ADMIN_CORS_ORIGIN,
        envConfig.SERVICE_CORS_ORIGIN,
      ];
      return whitelist.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(
  secureHeaders({
    xFrameOptions: "DENY",
  }),
);

/** 라우터 등록 */
app.route("/health", healthRoute);
app.route("/", serviceRouter);

if (envConfig.NODE_ENV === "development") {
  /** Swagger OpenAPI - 분리된 인스턴스 사용 */
  const serviceApp = new OpenAPIHono();
  serviceApp.route("/", serviceRoute);

  serviceApp.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });
  app.get("/docs/service", swaggerUI({ url: "/openapi/service" }));

  app.get("/openapi/service", (c) => {
    const doc = serviceApp.getOpenAPIDocument({
      openapi: "3.1.0",
      info: {
        title: "Content Service API",
        version: "1.0.0",
        description: "R2 dev-content 기반 콘텐츠 API",
      },
      security: [{ Bearer: [] }],
    });
    return c.json(doc);
  });
}

app.notFound((c) => c.json({ message: "Not Found" }, 404));

app.onError((error, c) => {
  console.error("🔥 Error occurred:", error);

  /* Sentry 에러 로깅 */
  Sentry.captureException(error, {
    tags: {
      layer: "http",
      route: c.req.path, // Hono 4.x는 c.req.path 또는 c.req.url로
    },
    extra: {
      method: c.req.method,
      url: c.req.url,
    },
  });

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
  hostname: envConfig.HOST,
  fetch: app.fetch,
};
