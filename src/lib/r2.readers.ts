import { envConfig } from "@/config/env";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2.client";

/** R2 Readers
 *  - R2에서 객체를 읽어오는 유틸리티
 */
export async function headR2(key: string) {
  const head = await r2.send(
    new HeadObjectCommand({ Bucket: envConfig.R2_BUCKET, Key: key }),
  );
  return {
    etag: head.ETag?.replaceAll('"', ""),
    lastModified: head.LastModified?.toISOString(),
    contentType: head.ContentType,
    contentLength: head.ContentLength,
  };
}

/** R2 Body를 텍스트로 변환 */
async function bodyToText(body: any): Promise<string> {
  // Bun 환경에서 종종 transformToString 지원
  if (typeof body?.transformToString === "function")
    return body.transformToString();
  if (body instanceof Uint8Array) return new TextDecoder().decode(body);

  // Node/Bun stream fallback
  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    body.on("data", (c: Buffer) => chunks.push(c));
    body.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    body.on("error", reject);
  });
}

/** R2에서 텍스트 객체를 가져오기 */
export async function getR2Text(key: string) {
  const obj = await r2.send(
    new GetObjectCommand({ Bucket: envConfig.R2_BUCKET, Key: key }),
  );
  const text = await bodyToText(obj.Body);
  return { text, contentType: obj.ContentType };
}
