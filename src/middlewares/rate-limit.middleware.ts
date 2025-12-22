import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";

export const rateLimitMiddleware = rateLimiter({
  // 기본 윈도우 (1분)
  windowMs: 60_000,

  // 경로별 동적 limit 지정
  limit: (c: Context) => {
    const path = c.req.path;
    console.log("🚦 Rate Limiting Path:", path);

    /** 1) 인증 관련 (로그인 / 회원가입) */
    if (
      path.startsWith("/api/admin/auth") ||
      path.startsWith("/api/service/auth")
    ) {
      return 10; // 1분 5회
    }

    // /** 2) 결제 요청 */
    // if (path.startsWith("/payment")) {
    //   return 10; // 1분 10회
    // }
    //
    // /** 3) 장바구니 / 좋아요 / 주문 */
    // if (
    //   path.startsWith("/cart") ||
    //   path.startsWith("/order") ||
    //   path.startsWith("/wishlist")
    // ) {
    //   return 100; // 1분 100회
    // }
    //
    // /** 4) 상품 목록/상세 조회 */
    // if (path.startsWith("/products") || path.startsWith("/items")) {
    //   return 500; // 1분 500회
    // }

    /** 5) 그 외 기본 */
    return 100; // 기본 100회
  },

  /**
   * IP 식별 (Cloudflare 포함)
   */
  keyGenerator: (c: Context) => {
    const info = getConnInfo(c);
    const clientIp = info.remote.address;

    if (!clientIp) {
      console.warn("⚠️ 클라이언트 IP를 확인할 수 없습니다.");
      return "unknown-ip";
    }

    // console.log("🌐 클라이언트 IP 확인:", {
    //   cfConnectingIp: c.req.header("CF-Connecting-IP"),
    //   xForwardedFor: c.req.header("x-forwarded-for"),
    //   clientIp,
    // });

    return (
      c.req.header("CF-Connecting-IP") ??
      c.req.header("x-forwarded-for") ??
      clientIp
    );
  },

  /**
   * 초과 시 응답
   */
  handler: (c: Context) => {
    return c.json(
      {
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      },
      429,
    );
  },
});
