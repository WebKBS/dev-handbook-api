import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";

export const getRootManifestRoute = createRoute({
  method: "get",
  path: "/manifest",
  tags: ["Content"],
  summary: "루트 manifest 조회",
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.any() } },
    },
  },
});

export const getDomainsRoute = createRoute({
  method: "get",
  path: "/domains",
  tags: ["Content"],
  summary: "도메인 목록/통계",
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.any() } },
    },
  },
});

export const getDomainManifestRoute = createRoute({
  method: "get",
  path: "/domains/{domain}/manifest",
  tags: ["Content"],
  summary: "도메인 manifest 조회",
  request: { params: z.object({ domain: z.string().min(1) }) },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.any() } },
    },
    404: { description: "Not Found" },
  },
});

export const listPostsRoute = createRoute({
  method: "get",
  path: "/posts",
  tags: ["Content"],
  summary: "게시글 리스트/검색",
  request: {
    query: z.object({
      domain: z.string().optional(),
      q: z.string().optional(),
      tags: z.string().optional(), // "html,markup"
      sort: z.enum(["updatedAt_desc", "order_asc"]).optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.any() } },
    },
  },
});

export const getPostRoute = createRoute({
  method: "get",
  path: "/posts/{domain}/{slug}",
  tags: ["Content"],
  summary: "게시글 상세(md 포함)",
  request: {
    params: z.object({ domain: z.string().min(1), slug: z.string().min(1) }),
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.any() } },
    },
    404: { description: "Not Found" },
  },
});
