import { z } from 'zod';
import { ErrorCode } from '@baaa-hub/shared-types';

/**
 * Validation schema for creating a book
 */
export const createBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, ErrorCode.TITLE_REQUIRED)
    .max(200, ErrorCode.TITLE_TOO_LONG),
  author: z
    .string()
    .trim()
    .min(1, ErrorCode.AUTHOR_REQUIRED)
    .max(100, ErrorCode.AUTHOR_TOO_LONG),
  isbn: z
    .string()
    .trim()
    .regex(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
      ErrorCode.ISBN_INVALID,
    ),
  publishedYear: z
    .number()
    .int()
    .min(1000, ErrorCode.YEAR_TOO_OLD)
    .max(new Date().getFullYear(), ErrorCode.YEAR_IN_FUTURE),
  genre: z
    .string()
    .trim()
    .min(1, ErrorCode.GENRE_REQUIRED)
    .max(50, ErrorCode.GENRE_TOO_LONG),
  description: z
    .string()
    .trim()
    .max(1000, ErrorCode.DESCRIPTION_TOO_LONG)
    .optional(),
  available: z.boolean().optional().default(true),
});

/**
 * Validation schema for updating a book
 */
export const updateBookSchema = createBookSchema.partial();

/**
 * Type exports for TypeScript
 */
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
