import type { Context } from "hono";

export const setHttpCache = (
  c: Context,
  opts: { etag?: string; lastModified?: string; cacheControl: string },
) => {
  if (opts.etag) c.header("ETag", opts.etag);
  if (opts.lastModified) c.header("Last-Modified", opts.lastModified);
  c.header("Cache-Control", opts.cacheControl);
};

export const matchIfNoneMatch = (c: Context, etag?: string) => {
  if (!etag) return false;
  const inm = c.req.header("if-none-match");
  return inm?.replaceAll('"', "") === etag;
};
