import type { Cached } from "@/lib/cache/etag-cache";
import { createEtagCache } from "@/lib/cache/etag-cache";
import { getR2Text, headR2 } from "@/lib/r2/r2.readers";

/**
 * frontmatter 제거
 * - 파일 맨 앞에 있을 때만 제거
 * - \n / \r\n 모두 대응
 * - "---" ... "---" 블록을 통째로 제거하고, 그 다음 줄바꿈까지 정리
 */
const stripFrontmatter = (md: string) => {
  // UTF-8 BOM 대응
  const text = md.charCodeAt(0) === 0xfeff ? md.slice(1) : md;

  // 시작에 frontmatter가 없으면 그대로
  if (!text.startsWith("---")) return text;

  // 맨 앞 frontmatter만 제거
  // 예: ---\n ... \n---\n (또는 \r\n)
  return text.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, "");
};

export const createContentRepository = () => {
  // manifest는 자주 읽힘 → 적당히 많이/짧게
  // 시간: 1분
  const jsonCache = createEtagCache<unknown>({ max: 300, ttlMs: 60_000 });

  // md는 조금 더 길게
  // 시간: 5분
  const textCache = createEtagCache<string>({ max: 2000, ttlMs: 5 * 60_000 });

  const getJson = async <T>(key: string): Promise<Cached<T>> => {
    return jsonCache.singleflight(key, async () => {
      const cached = jsonCache.get(key) as Cached<T> | undefined;
      const head = await headR2(key);

      // ✅ 같으면 GET 생략
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

  const getText = async (key: string): Promise<Cached<string>> => {
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

  /**
   * ✅ Markdown용 (기본: frontmatter 제거한 본문)
   * - raw가 필요하면 opts.raw = true
   */
  const getMarkdown = async (
    key: string,
    opts?: { raw?: boolean },
  ): Promise<Cached<string>> => {
    const md = await getText(key);

    if (opts?.raw) return md;

    // md.value만 가공해서 반환 (etag/lastModified/checkedAt 유지)
    return {
      ...md,
      value: stripFrontmatter(md.value),
    };
  };

  return { getJson, getText, getMarkdown };
};

export const contentRepository = createContentRepository();
