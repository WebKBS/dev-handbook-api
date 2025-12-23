import type { RouteHandler } from "@hono/zod-openapi";
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

const attachMetaHeaders = (c: any, etag?: string, lastModified?: string) => {
  if (etag) c.header("ETag", etag);
  if (lastModified) c.header("Last-Modified", lastModified);
  // 서버 캐시는 안 하지만, 원하면 클라 캐시는 가능 (원치 않으면 이 줄 삭제)
  // c.header("Cache-Control", "public, max-age=60");
};

export const getRootManifestController: RouteHandler<
  typeof getRootManifestRoute
> = async (c) => {
  const data = await getRootManifestService();
  attachMetaHeaders(c, data.etag, data.lastModified);
  return c.json(data.value, 200);
};

export const getDomainsController: RouteHandler<
  typeof getDomainsRoute
> = async (c) => {
  const data = await getDomainsService();
  attachMetaHeaders(c, data.etag, data.lastModified);
  return c.json(data.value, 200);
};

export const getDomainManifestController: RouteHandler<
  typeof getDomainManifestRoute
> = async (c) => {
  const { domain } = c.req.valid("param");
  const data = await getDomainManifestService(domain);
  attachMetaHeaders(c, data.etag, data.lastModified);
  return c.json(data.value, 200);
};

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

  attachMetaHeaders(c, data.etag, data.lastModified);
  return c.json(data.value, 200);
};

export const getPostController: RouteHandler<typeof getPostRoute> = async (
  c,
) => {
  const { domain, slug } = c.req.valid("param");
  const data = await getPostDetailService(domain, slug);
  if (!data) return c.json({ message: "Not Found" }, 404);

  attachMetaHeaders(c, data.etag, data.lastModified);
  return c.json(data.value, 200);
};
