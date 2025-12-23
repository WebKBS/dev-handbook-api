import contentRoute from "@/modules/service/content/content.router.ts";
import { OpenAPIHono } from "@hono/zod-openapi";

const serviceRoute = new OpenAPIHono().basePath("/api/service");

serviceRoute.route("/content", contentRoute);

// 인증 필요한 라우트
// serviceRoute.use(authMiddleware);

export default serviceRoute;
