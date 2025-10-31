import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Konfiguration für externen Storage (Cloudflare R2 oder Backblaze B2)
const EXTERNAL_STORAGE_ENABLED = process.env.EXTERNAL_STORAGE_ENABLED === "true";
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "cloudflare"; // "cloudflare" oder "backblaze"

// Cloudflare R2 Konfiguration
const R2_CONFIG = {
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  region: "auto",
};

// Backblaze B2 Konfiguration
const B2_CONFIG = {
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID || "",
    secretAccessKey: process.env.B2_APPLICATION_KEY || "",
  },
  region: "us-west-004",
};

// S3 Client initialisieren
const s3Client = EXTERNAL_STORAGE_ENABLED
  ? new S3Client(STORAGE_PROVIDER === "cloudflare" ? R2_CONFIG : B2_CONFIG)
  : null;

const BUCKET_NAME = STORAGE_PROVIDER === "cloudflare"
  ? process.env.R2_BUCKET_NAME || "deimudda-images"
  : process.env.B2_BUCKET_NAME || "deimudda-images";

const PUBLIC_URL = STORAGE_PROVIDER === "cloudflare"
  ? process.env.R2_PUBLIC_URL || ""
  : process.env.B2_PUBLIC_URL || "";

/**
 * Upload zu externem Storage (Cloudflare R2 oder Backblaze B2)
 */
export async function externalStoragePut(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  if (!EXTERNAL_STORAGE_ENABLED || !s3Client) {
    throw new Error("External storage not enabled");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: contentType,
    ACL: "public-read", // Öffentlich lesbar
  });

  await s3Client.send(command);

  // Generiere öffentliche URL
  const url = `${PUBLIC_URL}/${key}`;

  return { key, url };
}

/**
 * Lösche Datei aus externem Storage
 */
export async function externalStorageDelete(key: string): Promise<void> {
  if (!EXTERNAL_STORAGE_ENABLED || !s3Client) {
    throw new Error("External storage not enabled");
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Prüfe, ob externer Storage aktiviert ist
 */
export function isExternalStorageEnabled(): boolean {
  return EXTERNAL_STORAGE_ENABLED;
}

/**
 * Hole aktuellen Storage-Provider
 */
export function getStorageProvider(): string {
  return EXTERNAL_STORAGE_ENABLED ? STORAGE_PROVIDER : "manus";
}

