// src/config/sentry.ts
import * as Sentry from "@sentry/bun";

const SENTRY_DSN = process.env.SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not provided. Sentry disabled.");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1, // 성능 추적(트랜잭션) 샘플링 비율 (0~1)
    // profilesSampleRate: 0.0, // 필요하면 프로파일링도
    // release: process.env.SENTRY_RELEASE, // CI에서 세팅하면 좋음
  });
}

export { Sentry };
