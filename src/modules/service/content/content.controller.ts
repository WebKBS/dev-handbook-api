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

const respondIfNotModified = (
  c: Context,
  etag?: string,
  lastModified?: string,
) => {
  if (matchIfNoneMatch(c, etag)) return c.body(null, 304);
  if (matchIfModifiedSince(c, lastModified)) return c.body(null, 304);
  return null;
};

export const getRootManifestController: RouteHandler<
  typeof getRootManifestRoute
> = async (c) => {
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

export const getDomainsController: RouteHandler<
  typeof getDomainsRoute
> = async (c) => {
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
