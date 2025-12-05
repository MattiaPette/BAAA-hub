import { describe, it, expect } from 'vitest';
import { validateImageFile, formatFileSize } from './ImageUpload.utils';

describe('ImageUpload.utils', () => {
  describe('validateImageFile', () => {
    it('should accept valid JPEG file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid WEBP file', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid HEIC file', () => {
      const file = new File(['test'], 'test.heic', { type: 'image/heic' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid HEIF file', () => {
      const file = new File(['test'], 'test.heif', { type: 'image/heif' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject unsupported file type (GIF)', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject unsupported file type (BMP)', () => {
      const file = new File(['test'], 'test.bmp', { type: 'image/bmp' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
    });

    it('should reject file that exceeds maximum size', () => {
      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', {
        type: 'image/jpeg',
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept file at exactly maximum size', () => {
      // Create a file exactly at 5MB
      const content = new Array(5 * 1024 * 1024).fill('a').join('');
      const file = new File([content], 'exact.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should handle case insensitive file types', () => {
      const file = new File(['test'], 'test.jpg', { type: 'IMAGE/JPEG' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
      expect(formatFileSize(5.5 * 1024 * 1024)).toBe('5.5 MB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });
});
