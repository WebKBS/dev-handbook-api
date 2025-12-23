import { LRUCache } from "lru-cache";

export type Cached<T> = {
  value: T;
  etag?: string;
  lastModified?: string;
  checkedAt: number;
};

export const createEtagCache = <T>(opts: { max: number; ttlMs: number }) => {
  const lru = new LRUCache<string, Cached<T>>({
    max: opts.max,
    ttl: opts.ttlMs,
  });
  const inflight = new Map<string, Promise<Cached<T>>>();

  const get = (key: string) => lru.get(key);
  const set = (key: string, val: Cached<T>) => lru.set(key, val);

  const singleflight = (key: string, fn: () => Promise<Cached<T>>) => {
    const cur = inflight.get(key);
    if (cur) return cur;
    const p = fn().finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  };

  return { get, set, singleflight };
};
