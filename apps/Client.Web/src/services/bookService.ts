import axios from 'axios';
import type { Book, BookInput, BookListResponse } from '../types/book';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all books with optional filters and pagination
 */
export const getBooks = async (
  params?: Readonly<{
    page?: number;
    limit?: number;
    genre?: string;
    author?: string;
    available?: boolean;
  }>,
): Promise<BookListResponse> => {
  const response = await api.get<BookListResponse>('/api/books', { params });
  return response.data;
};

/**
 * Fetch a single book by ID
 */
export const getBookById = async (id: string): Promise<Book> => {
  const response = await api.get<{ data: Book }>(`/api/books/${id}`);
  return response.data.data;
};

/**
 * Create a new book
 */
export const createBook = async (book: Readonly<BookInput>): Promise<Book> => {
  const response = await api.post<{ data: Book; message: string }>(
    '/api/books',
    book,
  );
  return response.data.data;
};

/**
 * Update an existing book
 */
export const updateBook = async (
  id: string,
  book: Readonly<Partial<BookInput>>,
): Promise<Book> => {
  const response = await api.put<{ data: Book; message: string }>(
    `/api/books/${id}`,
    book,
  );
  return response.data.data;
};

/**
 * Delete a book
 */
export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/api/books/${id}`);
};
