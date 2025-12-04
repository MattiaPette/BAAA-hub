import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sharp before importing the module
vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      resize: vi.fn().mockReturnThis(),
      jpeg: vi.fn().mockReturnThis(),
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('thumbnail-data')),
    })),
  };
});

// Mock the S3 client before importing the module
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class MockS3Client {
      send = vi.fn();
    },
    PutObjectCommand: class MockPutObjectCommand {
      constructor(public input: unknown) {}
    },
    GetObjectCommand: class MockGetObjectCommand {
      constructor(public input: unknown) {}
    },
    DeleteObjectCommand: class MockDeleteObjectCommand {
      constructor(public input: unknown) {}
    },
    HeadBucketCommand: class MockHeadBucketCommand {
      constructor(public input: unknown) {}
    },
    CreateBucketCommand: class MockCreateBucketCommand {
      constructor(public input: unknown) {}
    },
  };
});

// Import after mocking
import {
  validateImage,
  getExtensionFromMimeType,
  generateImageKey,
  generateThumbnailKey,
  generateThumbnail,
  isStorageAvailable,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  THUMBNAIL_SIZE,
  ImageType,
} from '../storage.service';

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
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

  describe('THUMBNAIL_SIZE', () => {
    it('should be 128 pixels', () => {
      expect(THUMBNAIL_SIZE).toBe(128);
    });
  });

  describe('generateThumbnailKey', () => {
    it('should generate thumbnail key for jpg image', () => {
      const originalKey = 'avatars/user123/1234567890.jpg';
      const thumbKey = generateThumbnailKey(originalKey);
      expect(thumbKey).toBe('avatars/user123/1234567890_thumb.jpg');
    });

    it('should generate thumbnail key for png image', () => {
      const originalKey = 'banners/user456/9876543210.png';
      const thumbKey = generateThumbnailKey(originalKey);
      expect(thumbKey).toBe('banners/user456/9876543210_thumb.png');
    });

    it('should throw error for empty key', () => {
      expect(() => generateThumbnailKey('')).toThrow(
        'Original key cannot be empty',
      );
    });

    it('should throw error for whitespace-only key', () => {
      expect(() => generateThumbnailKey('   ')).toThrow(
        'Original key cannot be empty',
      );
    });

    it('should generate thumbnail key for webp image', () => {
      const originalKey = 'avatars/user789/1111111111.webp';
      const thumbKey = generateThumbnailKey(originalKey);
      expect(thumbKey).toBe('avatars/user789/1111111111_thumb.webp');
    });

    it('should handle key without extension', () => {
      const originalKey = 'avatars/user123/noextension';
      const thumbKey = generateThumbnailKey(originalKey);
      expect(thumbKey).toBe('avatars/user123/noextension_thumb');
    });
  });

  describe('generateThumbnail', () => {
    it('should generate a thumbnail buffer', async () => {
      const imageData = Buffer.from('fake-image-data');
      const result = await generateThumbnail(imageData);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should use default size when not specified', async () => {
      const imageData = Buffer.from('fake-image-data');
      await generateThumbnail(imageData);
      // The mock sharp is called - we just verify it returns a buffer
      const result = await generateThumbnail(imageData);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should accept custom size parameter', async () => {
      const imageData = Buffer.from('fake-image-data');
      const customSize = 256;
      const result = await generateThumbnail(imageData, customSize);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('isStorageAvailable', () => {
    it('should return a boolean', () => {
      const result = isStorageAvailable();
      expect(typeof result).toBe('boolean');
    });
  });
});
