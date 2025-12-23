import { createErrorResponses } from "@/common/error/error-response.ts";
import { createRoute } from "@hono/zod-openapi";
import {
  domainManifestSchema,
  domainParamSchema,
  domainsResponseSchema,
  listPostsQuerySchema,
  listPostsResponseSchema,
  postDetailSchema,
  postParamsSchema,
  rootManifestSchema,
} from "./content.dto.ts";

const errorResponses = createErrorResponses();

export const getRootManifestRoute = createRoute({
  method: "get",
  path: "/manifest",
  tags: ["Content"],
  summary: "루트 manifest 조회",
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: rootManifestSchema } },
    },
    304: { description: "Not Modified" },
  },
  ...errorResponses,
});

export const getDomainsRoute = createRoute({
  method: "get",
  path: "/domains",
  tags: ["Content"],
  summary: "도메인 목록/통계",
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: domainsResponseSchema } },
    },
    304: { description: "Not Modified" },
  },
  ...errorResponses,
});

export const getDomainManifestRoute = createRoute({
  method: "get",
  path: "/domains/{domain}/manifest",
  tags: ["Content"],
  summary: "도메인 manifest 조회",
  request: { params: domainParamSchema },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: domainManifestSchema } },
    },
    304: { description: "Not Modified" },
    404: { description: "Not Found" },
  },
  ...errorResponses,
});

export const listPostsRoute = createRoute({
  method: "get",
  path: "/posts",
  tags: ["Content"],
  summary: "게시글 리스트/검색",
  request: { query: listPostsQuerySchema },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: listPostsResponseSchema } },
    },
    304: { description: "Not Modified" },
  },
  ...errorResponses,
});

export const getPostRoute = createRoute({
  method: "get",
  path: "/posts/{domain}/{slug}",
  tags: ["Content"],
  summary: "게시글 상세(md 포함)",
  request: {
    params: postParamsSchema,
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: postDetailSchema } },
    },
    304: { description: "Not Modified" },
    404: { description: "Not Found" },
  },
  ...errorResponses,
});
