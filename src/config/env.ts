import { z } from "zod";

const envConfigSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8000),

  // CORS
  ADMIN_CORS_ORIGIN: z.string().default(""),
  SERVICE_CORS_ORIGIN: z.string().default(""),

  // R2
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),

  // optional
  CDN_BASE_URL: z.url().optional(),
});

const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.issues);
  process.exit(1); // 잘못된 경우 서버 실행 중단
}

export const envConfig = parsed.data;
