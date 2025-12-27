import {
  matchIfModifiedSince,
  matchIfNoneMatch,
  setHttpCache,
} from "@/lib/http/http-cache.ts";
import type { RouteHandler } from "@hono/zod-openapi";
import type { Context } from "hono";
import {
  getDomainManifestRoute,
  getDomainsRoute,
  getPostRoute,
  getRootManifestRoute,
  listPostsRoute,
} from "./content.openapi";
import {
  getDomainManifestService,
  getDomainsService,
  getPostDetailService,
  getRootManifestService,
  listPostsService,
} from "./content.service";

/** 클라이언트 캐시와 비교하여 수정되지 않았으면 304 응답 반환 */
const respondIfNotModified = (
  c: Context,
  etag?: string,
  lastModified?: string,
) => {
  if (matchIfNoneMatch(c, etag)) return c.body(null, 304);
  if (matchIfModifiedSince(c, lastModified)) return c.body(null, 304);
  return null;
};

/** 루트 매니페스트 조회 */
export const getRootManifestController: RouteHandler<
  typeof getRootManifestRoute
> = async (c) => {
  // await new Promise((resolve) => setTimeout(resolve, 10000)); // 인위적 지연 추가
  // throw new Error("Method not implemented.");

  const data = await getRootManifestService();
  setHttpCache(c, {
    etag: data.etag,
    lastModified: data.lastModified,
    cacheControl: "public, max-age=60",
  });
  const notModified = respondIfNotModified(c, data.etag, data.lastModified);
  if (notModified) return notModified;
  return c.json(data.value, 200);
};

/** 도메인 목록 조회 */
export const getDomainsController: RouteHandler<
  typeof getDomainsRoute
> = async (c) => {
  // await new Promise((resolve) => setTimeout(resolve, 4000)); // 인위적 지연 추가
  // throw new Error("Method not implemented.");
  const data = await getDomainsService();

  setHttpCache(c, {
    etag: data.etag,
    lastModified: data.lastModified,
    cacheControl: "public, max-age=60",
  });
  const notModified = respondIfNotModified(c, data.etag, data.lastModified);
  if (notModified) return notModified;
  return c.json(data.value, 200);
};

/** 도메인 매니페스트 조회 */
export const getDomainManifestController: RouteHandler<
  typeof getDomainManifestRoute
> = async (c) => {
  const { domain } = c.req.valid("param");
  const data = await getDomainManifestService(domain);
  setHttpCache(c, {
    etag: data.etag,
    lastModified: data.lastModified,
    cacheControl: "public, max-age=60",
  });
  const notModified = respondIfNotModified(c, data.etag, data.lastModified);
  if (notModified) return notModified;
  return c.json(data.value, 200);
};

/** 게시글 리스트/검색 */
export const listPostsController: RouteHandler<typeof listPostsRoute> = async (
  c,
) => {
  const q = c.req.valid("query");
  const tags = (q.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const data = await listPostsService({
    domain: q.domain,
    q: q.q,
    tags,
    sort: q.sort,
    page: q.page,
    pageSize: q.pageSize,
  });

  setHttpCache(c, {
    etag: data.etag,
    lastModified: data.lastModified,
    cacheControl: "public, max-age=60",
  });
  const notModified = respondIfNotModified(c, data.etag, data.lastModified);
  if (notModified) return notModified;
  return c.json(data.value, 200);
};

/** 게시글 상세 조회 */
export const getPostController: RouteHandler<typeof getPostRoute> = async (
  c,
) => {
  const { domain, slug } = c.req.valid("param");
  const data = await getPostDetailService(domain, slug);
  if (!data) return c.json({ message: "Not Found" }, 404);

  setHttpCache(c, {
    etag: data.etag,
    lastModified: data.lastModified,
    cacheControl: "public, max-age=300",
  });
  const notModified = respondIfNotModified(c, data.etag, data.lastModified);
  if (notModified) return notModified;
  return c.json(data.value, 200);
};
