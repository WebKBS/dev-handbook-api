import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
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

app.use(
  secureHeaders({
    xFrameOptions: "DENY",
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default {
  port: envConfig.PORT || 8000,
  fetch: app.fetch,
};
