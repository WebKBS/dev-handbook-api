import { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  status: ContentfulStatusCode;

  constructor(message: string, status: ContentfulStatusCode) {
    super(message);
    this.status = status;
  }
}
