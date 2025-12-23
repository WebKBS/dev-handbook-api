import { envConfig } from "@/config/env";

const prefix = envConfig.R2_PREFIX;

/** R2 Keys
 *  - Key 생성 유틸리티
 */
export const r2Keys = {
  rootManifest: () => `${prefix}/manifest.json`,
  domainManifest: (domain: string) =>
    `${prefix}/domains/${domain}/manifest.json`,
  post: (domain: string, slug: string) =>
    `${prefix}/posts/${domain}/${slug}.md`,
  asset: (path: string) => `${prefix}/assets/${path.replace(/^\/+/, "")}`,
};
