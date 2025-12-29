import { Context } from "hono";
import { ZodError } from "zod";
import { SafeParseReturnType } from "zod/v3";

type ZodHookResult =
  | SafeParseReturnType<unknown, unknown>
  | { success: boolean; error?: ZodError };

export const validateSchema = (result: ZodHookResult, c: Context) => {
  if (!result.success) {
    const firstMessage =
      result.error?.issues?.[0]?.message ||
      result.error?.message ||
      "Validation failed";
    return c.json({ message: firstMessage }, 400);
  }
};

/**
 * OpenAPIHono defaultHook용 에러 핸들러
 * - zValidator와 동일하게 단일 메시지 반환
 */
export const validationErrorHook = (result: ZodHookResult, c: Context) =>
  validateSchema(result, c);
