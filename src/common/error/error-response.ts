import { z } from "@hono/zod-openapi";

/** 모든 라우트에서 공통으로 사용하는 에러 응답 스키마 */
export const errorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "에러 메시지" }),
  })
  .meta({ refId: "ErrorResponse" })
  .describe("공통 에러 응답 DTO")
  .openapi("ErrorResponse");

type ErrorResponsesOptions = {
  badRequestDescription?: string;
  unauthorizedDescription?: string;
  schema?: z.ZodTypeAny;
};

/** 400/401 공통 응답 객체를 생성해 Swagger 정의에서 재사용 */
export const createErrorResponses = ({
  badRequestDescription = "잘못된 요청",
  unauthorizedDescription = "인증 실패",
  schema = errorResponseSchema,
}: ErrorResponsesOptions = {}) => ({
  400: {
    content: { "application/json": { schema } },
    description: badRequestDescription,
  },
  401: {
    content: { "application/json": { schema } },
    description: unauthorizedDescription,
  },
});
