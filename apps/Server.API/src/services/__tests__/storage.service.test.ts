import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the S3 client before importing the module
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class MockS3Client {
      send = vi.fn();
    },
    PutObjectCommand: class MockPutObjectCommand {},
    GetObjectCommand: class MockGetObjectCommand {},
    DeleteObjectCommand: class MockDeleteObjectCommand {},
    HeadBucketCommand: class MockHeadBucketCommand {},
    CreateBucketCommand: class MockCreateBucketCommand {},
  };
});

// Import after mocking
import {
  validateImage,
  getExtensionFromMimeType,
  generateImageKey,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  ImageType,
} from '../storage.service';

describe('Storage Service', () => {
  describe('validateImage', () => {
    it('should accept valid JPEG image', () => {
      expect(() => validateImage('image/jpeg', 1024)).not.toThrow();
    });

    it('should accept valid PNG image', () => {
      expect(() => validateImage('image/png', 1024)).not.toThrow();
    });

    it('should accept valid GIF image', () => {
      expect(() => validateImage('image/gif', 1024)).not.toThrow();
    });

    it('should accept valid WebP image', () => {
      expect(() => validateImage('image/webp', 1024)).not.toThrow();
    });

    it('should reject invalid content type', () => {
      expect(() => validateImage('text/plain', 1024)).toThrow(
        /Invalid image type/,
      );
    });

    it('should reject image exceeding max size', () => {
      const oversizedImage = MAX_IMAGE_SIZE + 1;
      expect(() => validateImage('image/jpeg', oversizedImage)).toThrow(
        /exceeds maximum/,
      );
    });

    it('should accept image at exact max size', () => {
      expect(() => validateImage('image/jpeg', MAX_IMAGE_SIZE)).not.toThrow();
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('should return jpg for image/jpeg', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
    });

    it('should return png for image/png', () => {
      expect(getExtensionFromMimeType('image/png')).toBe('png');
    });

    it('should return gif for image/gif', () => {
      expect(getExtensionFromMimeType('image/gif')).toBe('gif');
    });

    it('should return webp for image/webp', () => {
      expect(getExtensionFromMimeType('image/webp')).toBe('webp');
    });

    it('should return bin for unknown type', () => {
      expect(getExtensionFromMimeType('application/octet-stream')).toBe('bin');
    });
  });

  describe('generateImageKey', () => {
    it('should generate key for avatar', () => {
      const key = generateImageKey('user123', ImageType.AVATAR, 'jpg');
      expect(key).toMatch(/^avatars\/user123\/\d+\.jpg$/);
    });

    it('should generate key for banner', () => {
      const key = generateImageKey('user123', ImageType.BANNER, 'png');
      expect(key).toMatch(/^banners\/user123\/\d+\.png$/);
    });

    it('should sanitize user ID with special characters', () => {
      const key = generateImageKey('auth0|123456', ImageType.AVATAR, 'jpg');
      expect(key).toMatch(/^avatars\/auth0_123456\/\d+\.jpg$/);
    });

    it('should use unique timestamps', async () => {
      const key1 = generateImageKey('user123', ImageType.AVATAR, 'jpg');
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const key2 = generateImageKey('user123', ImageType.AVATAR, 'jpg');
      expect(key1).not.toBe(key2);
    });
  });

  describe('ALLOWED_IMAGE_TYPES', () => {
    it('should include all expected image types', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/gif');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
    });

    it('should have exactly 4 allowed types', () => {
      expect(ALLOWED_IMAGE_TYPES).toHaveLength(4);
    });
  });

  describe('MAX_IMAGE_SIZE', () => {
    it('should be 5MB', () => {
      expect(MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024);
    });
  });
});
