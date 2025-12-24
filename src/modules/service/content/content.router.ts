import { validationErrorHook } from "@/lib/zod/validate.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  getDomainManifestController,
  getDomainsController,
  getPostController,
  getRootManifestController,
  listPostsController,
} from "./content.controller";
import {
  getDomainManifestRoute,
  getDomainsRoute,
  getPostRoute,
  getRootManifestRoute,
  listPostsRoute,
} from "./content.openapi";

const contentRoute = new OpenAPIHono({
  defaultHook: validationErrorHook,
});
/** 루트 매니페스트 조회 */
contentRoute.openapi(getRootManifestRoute, getRootManifestController);

/** 도메인 목록 조회 */
contentRoute.openapi(getDomainsRoute, getDomainsController);

/** 도메인 매니페스트 조회 */
contentRoute.openapi(getDomainManifestRoute, getDomainManifestController);

/** 포스트 목록 조회 */
contentRoute.openapi(listPostsRoute, listPostsController);

/** 포스트 상세 조회 */
contentRoute.openapi(getPostRoute, getPostController);

export default contentRoute;
