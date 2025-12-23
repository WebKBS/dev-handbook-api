import { Context } from "hono";
import { ZodError } from "zod";

/**
 * Zod 검증 결과를 공통 포맷으로 반환하는 Hook
 * - 에러 발생 시 첫 번째 메시지만 클라이언트에 전달
 */
export const validateSchema = (result: any, c: Context) => {
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
export const validationErrorHook = (
  result: { success: boolean; error?: ZodError },
  c: Context,
) => validateSchema(result, c);
