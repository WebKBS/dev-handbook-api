import { createEtagCache } from "@/lib/cache/etag-cache";
import type { Cached } from "@/lib/cache/etag-cache";
import { getR2Text, headR2 } from "@/lib/r2/r2.readers";

export const createContentRepository = () => {
  // manifest는 자주 읽힘 → 적당히 많이/짧게
  const jsonCache = createEtagCache<unknown>({ max: 300, ttlMs: 60_000 });

  // md는 조금 더 길게
  const textCache = createEtagCache<string>({ max: 2000, ttlMs: 5 * 60_000 });

  const getJson = async <T>(key: string): Promise<Cached<T>> => {
    return jsonCache.singleflight(key, async () => {
      const cached = jsonCache.get(key) as Cached<T> | undefined;
      const head = await headR2(key);

      // ✅ 같으면 GET 생략 (최적화 핵심)
      if (cached?.etag && head.etag && cached.etag === head.etag) {
        const refreshed = {
          ...cached,
          lastModified: head.lastModified ?? cached.lastModified,
          checkedAt: Date.now(),
        };
        jsonCache.set(key, refreshed);
        return refreshed;
      }

      const { text } = await getR2Text(key);
      const parsed = JSON.parse(text) as T;

      const next = {
        value: parsed,
        etag: head.etag,
        lastModified: head.lastModified,
        checkedAt: Date.now(),
      };
      jsonCache.set(key, next);
      return next;
    });
  };

  const getText = async (key: string) => {
    return textCache.singleflight(key, async () => {
      const cached = textCache.get(key);
      const head = await headR2(key);

      if (cached?.etag && head.etag && cached.etag === head.etag) {
        const refreshed = {
          ...cached,
          lastModified: head.lastModified ?? cached.lastModified,
          checkedAt: Date.now(),
        };
        textCache.set(key, refreshed);
        return refreshed;
      }

      const { text } = await getR2Text(key);
      const next = {
        value: text,
        etag: head.etag,
        lastModified: head.lastModified,
        checkedAt: Date.now(),
      };
      textCache.set(key, next);
      return next;
    });
  };

  return { getJson, getText };
};

export const contentRepository = createContentRepository();
