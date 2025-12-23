import { r2Keys } from "@/lib/r2/r2.keys";
import { getR2Json } from "@/lib/r2/r2.readers.ts";
import { contentRepository } from "@/modules/service/content/content.repository.ts";

export type ManifestItem = {
  id: string;
  domain: string;
  slug: string;
  title?: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
  coverImage?: string;
  order?: number;
};

export type RootManifest = {
  version: number;
  generatedAt: string;
  items: ManifestItem[];
};

export type DomainManifest = {
  version: number;
  generatedAt: string;
  domain: string;
  items: ManifestItem[];
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export const getRootManifestService = async () => {
  console.log("key: ", r2Keys.rootManifest());

  // return contentRepository.getJson<RootManifest>(r2Keys.rootManifest());
  return getR2Json<RootManifest>(r2Keys.rootManifest());
};

export const getDomainManifestService = async (domain: string) => {
  return contentRepository.getJson<DomainManifest>(
    r2Keys.domainManifest(domain),
  );
};

export const getDomainsService = async () => {
  const root = await getRootManifestService();
  const map = new Map<
    string,
    { domain: string; count: number; latestUpdatedAt?: string }
  >();

  for (const it of root.value.items) {
    const cur = map.get(it.domain) ?? {
      domain: it.domain,
      count: 0,
      latestUpdatedAt: undefined,
    };
    cur.count += 1;
    if (!cur.latestUpdatedAt || (it.updatedAt ?? "") > cur.latestUpdatedAt)
      cur.latestUpdatedAt = it.updatedAt;
    map.set(it.domain, cur);
  }

  return {
    etag: root.etag,
    lastModified: root.lastModified,
    value: {
      items: [...map.values()].sort((a, b) => a.domain.localeCompare(b.domain)),
    },
  };
};

export const listPostsService = async (params: {
  domain?: string;
  q?: string;
  tags?: string[];
  sort?: "updatedAt_desc" | "order_asc";
  page: number;
  pageSize: number;
}) => {
  const root = await getRootManifestService();
  const q = norm(params.q);
  const tagSet = new Set((params.tags ?? []).map(norm));
  let items = root.value.items;

  if (params.domain) items = items.filter((it) => it.domain === params.domain);

  if (tagSet.size > 0) {
    items = items.filter((it) =>
      (it.tags ?? []).some((t) => tagSet.has(norm(t))),
    );
  }

  if (q) {
    items = items.filter((it) => {
      const hay = [
        it.id,
        it.domain,
        it.slug,
        it.title ?? "",
        it.description ?? "",
        ...(it.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  const sort = params.sort ?? "order_asc";
  if (sort === "updatedAt_desc") {
    items = [...items].sort((a, b) =>
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
    );
  } else {
    items = [...items].sort(
      (a, b) => (a.order ?? 999999) - (b.order ?? 999999),
    );
  }

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = items.slice(start, start + params.pageSize);

  return {
    etag: root.etag,
    lastModified: root.lastModified,
    value: {
      total,
      page: params.page,
      pageSize: params.pageSize,
      items: paged,
    },
  };
};

export const getPostDetailService = async (domain: string, slug: string) => {
  const root = await getRootManifestService();
  const meta = root.value.items.find(
    (it) => it.domain === domain && it.slug === slug,
  );
  if (!meta) return null;

  const md = await contentRepository.getText(r2Keys.post(domain, slug));

  // 상세는 md의 ETag를 쓰는 게 가장 정확 (본문이 바뀌면 ETag 바뀜)
  return {
    etag: md.etag,
    lastModified: md.lastModified,
    value: { meta, content: md.value },
  };
};
