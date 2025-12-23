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
  if (!inm) return false;
  const normalize = (v: string) => v.replace(/^W\//, "").replace(/"/g, "");
  return normalize(inm) === normalize(etag);
};

export const matchIfModifiedSince = (c: Context, lastModified?: string) => {
  if (!lastModified) return false;
  const ims = c.req.header("if-modified-since");
  if (!ims) return false;
  const sinceMs = Date.parse(ims);
  const lastMs = Date.parse(lastModified);
  if (Number.isNaN(sinceMs) || Number.isNaN(lastMs)) return false;
  return lastMs <= sinceMs;
};
