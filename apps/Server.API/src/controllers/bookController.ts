import type { Context } from 'koa';
import { Book } from '../models/Book.js';
import { ApiError } from '../middleware/errorHandler.js';
import type {
  CreateBookInput,
  UpdateBookInput,
} from '../types/book.schemas.js';
import { ErrorCode } from '@baaa-hub/shared-types';

/**
 * Get all books
 */
export const getAllBooks = async (ctx: Context): Promise<void> => {
  const { page = 1, limit = 10, genre, author, available } = ctx.query;

  const query: Record<string, unknown> = {};

  // Sanitize and validate inputs to prevent NoSQL injection
  if (genre && typeof genre === 'string') {
    query.genre = genre.replace(/[^\w\s-]/g, ''); // Only allow alphanumeric, spaces, and hyphens
  }

  if (author && typeof author === 'string') {
    // Escape special regex characters and only allow safe characters
    const sanitizedAuthor = author.replace(/[^\w\s-]/g, '');
    query.author = { $regex: sanitizedAuthor, $options: 'i' };
  }

  if (available !== undefined) {
    query.available = available === 'true';
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [books, total] = await Promise.all([
    Book.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Book.countDocuments(query),
  ]);

  ctx.body = {
    data: books,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a book by ID
 */
export const getBookById = async (ctx: Context): Promise<void> => {
  const { id } = ctx.params;

  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(404, 'Book not found', ErrorCode.BOOK_NOT_FOUND);
  }

  ctx.body = {
    data: book,
  };
};

/**
 * Create a new book
 */
export const createBook = async (ctx: Context): Promise<void> => {
  const bookData = ctx.request.body as CreateBookInput;

  const book = new Book(bookData);
  await book.save();

  ctx.status = 201;
  ctx.body = {
    data: book,
    message: 'Book created successfully',
  };
};

/**
 * Update a book
 */
export const updateBook = async (ctx: Context): Promise<void> => {
  const { id } = ctx.params;
  const bookData = ctx.request.body as UpdateBookInput;

  const book = await Book.findByIdAndUpdate(id, bookData, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    throw new ApiError(404, 'Book not found', ErrorCode.BOOK_NOT_FOUND);
  }

  ctx.body = {
    data: book,
    message: 'Book updated successfully',
  };
};

/**
 * Delete a book
 */
export const deleteBook = async (ctx: Context): Promise<void> => {
  const { id } = ctx.params;

  const book = await Book.findByIdAndDelete(id);

  if (!book) {
    throw new ApiError(404, 'Book not found', ErrorCode.BOOK_NOT_FOUND);
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Book deleted successfully',
  };
};
