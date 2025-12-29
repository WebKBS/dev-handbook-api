import { envConfig } from "@/config/env.ts";
import {
  GetObjectCommand,
  type GetObjectCommandOutput,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { r2 } from "src/lib/r2/r2.client.ts";

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
async function bodyToText(
  body: GetObjectCommandOutput["Body"],
): Promise<string> {
  if (body == null) return "";

  const anyBody = body as any;

  // Bun 환경에서 종종 transformToString 지원
  if (typeof anyBody.transformToString === "function")
    return anyBody.transformToString();

  if (typeof anyBody === "string") return anyBody;
  if (body instanceof Uint8Array) return new TextDecoder().decode(body);

  // Blob-like (has arrayBuffer)
  if (typeof anyBody.arrayBuffer === "function") {
    const ab = await anyBody.arrayBuffer();
    return new TextDecoder().decode(new Uint8Array(ab));
  }

  // Web ReadableStream
  if (typeof anyBody.getReader === "function") {
    const reader = anyBody.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const total = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    return new TextDecoder().decode(merged);
  }

  // Node.js Readable stream
  if (typeof anyBody.on === "function") {
    return await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      anyBody.on("data", (c: Buffer) => chunks.push(Buffer.from(c)));
      anyBody.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      anyBody.on("error", reject);
    });
  }

  return "";
}
/** R2에서 텍스트 객체를 가져오기 */
export async function getR2Text(key: string) {
  const obj = await r2.send(
    new GetObjectCommand({ Bucket: envConfig.R2_BUCKET, Key: key }),
  );

  // console.log("Fetched R2 object:", obj);

  const text = await bodyToText(obj.Body);

  return {
    text,
    etag: obj.ETag?.replaceAll('"', ""),
    lastModified: obj.LastModified?.toISOString(),
    contentType: obj.ContentType,
  };
}

/** R2에서 JSON 객체를 가져오기 */
export const getR2Json = async <T>(key: string) => {
  const { text, etag, lastModified, contentType } = await getR2Text(key);

  return {
    value: JSON.parse(text) as T,
    etag,
    lastModified,
    contentType,
  };
};
