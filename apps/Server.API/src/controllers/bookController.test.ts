import { describe, it, expect } from 'vitest';
import { createBookSchema, updateBookSchema } from '../types/book.schemas.js';

describe('Book Schemas', () => {
  describe('createBookSchema', () => {
    it('should validate a valid book', () => {
      const validBook = {
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        isbn: '978-0-395-19395-6',
        publishedYear: 1954,
        genre: 'Fantasy',
        description: 'Epic fantasy novel',
        available: true,
      };

      const result = createBookSchema.safeParse(validBook);
      expect(result.success).toBe(true);
    });

    it('should fail validation when title is missing', () => {
      const invalidBook = {
        author: 'J.R.R. Tolkien',
        isbn: '978-0-395-19395-6',
        publishedYear: 1954,
        genre: 'Fantasy',
      };

      const result = createBookSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });

    it('should fail validation when ISBN is invalid', () => {
      const invalidBook = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: 'invalid-isbn',
        publishedYear: 2023,
        genre: 'Fiction',
      };

      const result = createBookSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });

    it('should fail validation when year is in the future', () => {
      const invalidBook = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-395-19395-6',
        publishedYear: 3000,
        genre: 'Fiction',
      };

      const result = createBookSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });

    it('should set default value for available', () => {
      const book = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-395-19395-6',
        publishedYear: 2023,
        genre: 'Fiction',
      };

      const result = createBookSchema.parse(book);
      expect(result.available).toBe(true);
    });
  });

  describe('updateBookSchema', () => {
    it('should validate partial update', () => {
      const partialUpdate = {
        title: 'Updated Title',
      };

      const result = updateBookSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate empty update', () => {
      const emptyUpdate = {};

      const result = updateBookSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it('should fail validation with invalid ISBN', () => {
      const invalidUpdate = {
        isbn: 'invalid',
      };

      const result = updateBookSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});
