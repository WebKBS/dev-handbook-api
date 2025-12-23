import { createErrorResponses } from "@/common/error/error-response.ts";
import { validationErrorHook } from "@/lib/zod/validate.ts";
import { OpenAPIHono } from "@hono/zod-openapi";

const errorResponses = createErrorResponses();

export const contentRoute = new OpenAPIHono({
  defaultHook: validationErrorHook,
});

export default contentRoute;
