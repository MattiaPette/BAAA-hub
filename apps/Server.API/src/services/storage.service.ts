import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import config from '../config/index.js';

/**
 * S3/MinIO client instance
 */
const s3Client = new S3Client({
  endpoint: `http${config.minio.useSSL ? 's' : ''}://${config.minio.endpoint}:${config.minio.port}`,
  region: config.minio.region,
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
  forcePathStyle: true, // Required for MinIO
});

/**
 * Allowed MIME types for image uploads
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Image type enum for storage paths
 */
export enum ImageType {
  AVATAR = 'avatars',
  BANNER = 'banners',
}

/**
 * Initialize the storage bucket if it doesn't exist
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: config.minio.bucket }));
    console.log(`✅ Storage bucket '${config.minio.bucket}' is accessible`);
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === 'NotFound' || err.name === 'NoSuchBucket') {
      console.log(`📦 Creating storage bucket '${config.minio.bucket}'...`);
      await s3Client.send(
        new CreateBucketCommand({ Bucket: config.minio.bucket }),
      );
      console.log(`✅ Storage bucket '${config.minio.bucket}' created`);
    } else {
      console.warn(
        `⚠️ Storage initialization warning: ${(error as Error).message}`,
      );
      // Don't throw - allow the app to start even if MinIO is not available
      // Image operations will fail gracefully
    }
  }
};

/**
 * Generate a unique object key for storing an image
 * @param userId - The user ID
 * @param imageType - The type of image (avatar or banner)
 * @param extension - File extension
 * @returns The object key
 */
export const generateImageKey = (
  userId: string,
  imageType: ImageType,
  extension: string,
): string => {
  const timestamp = Date.now();
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${imageType}/${sanitizedUserId}/${timestamp}.${extension}`;
};

/**
 * Upload an image to storage
 * @param key - The object key
 * @param data - The image data as Buffer
 * @param contentType - The MIME type of the image
 * @returns The object key on success
 */
export const uploadImage = async (
  key: string,
  data: Buffer,
  contentType: string,
): Promise<string> => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.minio.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    }),
  );
  return key;
};

/**
 * Get an image from storage
 * @param key - The object key
 * @returns Object containing the image stream and content type
 */
export const getImage = async (
  key: string,
): Promise<{ stream: Readable; contentType: string }> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: config.minio.bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error('Image not found');
  }

  return {
    stream: response.Body as Readable,
    contentType: response.ContentType || 'application/octet-stream',
  };
};

/**
 * Delete an image from storage
 * @param key - The object key
 */
export const deleteImage = async (key: string): Promise<void> => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.minio.bucket,
      Key: key,
    }),
  );
};

/**
 * Validate image file
 * @param contentType - The MIME type
 * @param size - The file size in bytes
 * @throws Error if validation fails
 */
export const validateImage = (contentType: string, size: number): void => {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(
      `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }
  if (size > MAX_IMAGE_SIZE) {
    throw new Error(
      `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    );
  }
};

/**
 * Get file extension from MIME type
 * @param contentType - The MIME type
 * @returns The file extension
 */
export const getExtensionFromMimeType = (contentType: string): string => {
  const mimeToExt: Readonly<Record<string, string>> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return mimeToExt[contentType] || 'bin';
};

export { s3Client };
