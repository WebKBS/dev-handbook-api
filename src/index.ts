import { Hono } from "hono";
import { envConfig } from "./config/env";
import { logger } from "hono/logger";

const app = new Hono();

app.use(
  logger((message: string, ...rest: string[]) => {
    console.log(message, ...rest);
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default {
  port: envConfig.PORT || 8000,
  fetch: app.fetch,
};
