import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const resolveEnv = (key, fallbackKeys = []) => {
  if (process.env[key]) return process.env[key];
  for (const fk of fallbackKeys) {
    if (process.env[fk]) return process.env[fk];
  }
  return undefined;
};

const region =
  resolveEnv("AWS_REGION", ["REGION"]) || resolveEnv("AWS_DEFAULT_REGION");
const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
const accessKeyId = resolveEnv("AWS_ACCESS_KEY_ID", ["AWS_ACCESS_KEY"]);
const secretAccessKey =
  resolveEnv("AWS_SECRET_ACCESS_KEY", ["AWS_SECRET_KEY", "AWS_SECRET"]);

const assertConfig = () => {
  if (!bucket) {
    const err = new Error("S3_BUCKET_NOT_CONFIGURED");
    err.statusCode = 500;
    throw err;
  }
  if (!region) {
    const err = new Error("AWS_REGION_NOT_CONFIGURED");
    err.statusCode = 500;
    throw err;
  }
  if (!accessKeyId || !secretAccessKey) {
    const err = new Error("AWS_CREDENTIALS_NOT_CONFIGURED");
    err.statusCode = 500;
    throw err;
  }
};

const s3 = (() => {
  assertConfig();
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
})();

export const createPresignedUploadUrl = async ({
  keyPrefix,
  contentType,
  expiresIn = 300, // 5 minutes
}) => {
  assertConfig();
  const randomKey = crypto.randomBytes(8).toString("hex");
  const key = `${keyPrefix}/${Date.now()}_${randomKey}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { uploadUrl, key, url: publicUrl };
};

const extractKeyFromUrl = (targetUrl) => {
  try {
    const u = new URL(targetUrl);
    // Handles paths like /path/to/file
    const key = decodeURIComponent(u.pathname.replace(/^\/+/, ""));
    return key || null;
  } catch (_err) {
    return null;
  }
};

export const deleteObjectByUrl = async (targetUrl) => {
  assertConfig();
  if (!targetUrl) return;
  const key = extractKeyFromUrl(targetUrl);
  if (!key) return;
  try {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await s3.send(command);
  } catch (err) {
    console.error("S3 delete error:", err.message);
  }
};
