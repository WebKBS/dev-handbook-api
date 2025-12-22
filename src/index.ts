import { Hono } from "hono";
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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default {
  port: envConfig.PORT || 8000,
  fetch: app.fetch,
};
