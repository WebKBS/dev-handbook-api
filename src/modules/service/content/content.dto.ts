import { z } from "zod";

export const manifestItemSchema = z.object({
  id: z.string(),
  domain: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  updatedAt: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number(),
  level: z.number(),
});

export const rootManifestSchema = z.object({
  version: z.number(),
  generatedAt: z.string(),
  items: z.array(manifestItemSchema),
});

export const domainManifestSchema = z.object({
  version: z.number(),
  generatedAt: z.string(),
  domain: z.string(),
  items: z.array(manifestItemSchema),
});

export const domainStatsSchema = z.object({
  domain: z.string(),
  count: z.number(),
  latestUpdatedAt: z.string().optional(),
  image: z.string(),
});

export const domainsResponseSchema = z.object({
  items: z.array(domainStatsSchema),
});

export const listPostsQuerySchema = z.object({
  domain: z.string().optional(),
  q: z.string().optional(),
  tags: z.string().optional(), // "html,markup"
  sort: z.enum(["updatedAt_desc", "order_asc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listPostsResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  items: z.array(manifestItemSchema),
});

export const domainParamSchema = z.object({ domain: z.string().min(1) });

export const postParamsSchema = z.object({
  domain: z.string().min(1),
  slug: z.string().min(1),
});

export const postDetailSchema = z.object({
  meta: manifestItemSchema,
  content: z.string(),
});

export type ManifestItem = z.infer<typeof manifestItemSchema>;
export type RootManifest = z.infer<typeof rootManifestSchema>;
export type DomainManifest = z.infer<typeof domainManifestSchema>;
export type DomainsResponse = z.infer<typeof domainsResponseSchema>;
export type ListPostsResponse = z.infer<typeof listPostsResponseSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
