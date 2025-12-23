/** R2 Keys
 *  - Key 생성 유틸리티
 */
export const r2Keys = {
  rootManifest: () => `/manifest.json`,
  domainManifest: (domain: string) => `/domains/${domain}/manifest.json`,
  post: (domain: string, slug: string) => `/posts/${domain}/${slug}.md`,
  asset: (path: string) => `/assets/${path.replace(/^\/+/, "")}`,
};
