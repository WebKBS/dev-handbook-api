import { envConfig } from "@/config/env.ts";
import { S3Client } from "@aws-sdk/client-s3";

/** R2 Client */
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${envConfig.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: envConfig.R2_ACCESS_KEY_ID,
    secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});
