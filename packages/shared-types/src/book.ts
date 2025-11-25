/**
 * Book interface shared between frontend and backend
 */
export interface Book {
  _id?: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Book input interface for creating/updating books
 */
export interface BookInput {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description?: string;
  available: boolean;
}

/**
 * Paginated book response
 */
export interface BookListResponse {
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Error codes for internationalization
 */
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TITLE_REQUIRED = 'TITLE_REQUIRED',
  TITLE_TOO_LONG = 'TITLE_TOO_LONG',
  AUTHOR_REQUIRED = 'AUTHOR_REQUIRED',
  AUTHOR_TOO_LONG = 'AUTHOR_TOO_LONG',
  ISBN_REQUIRED = 'ISBN_REQUIRED',
  ISBN_INVALID = 'ISBN_INVALID',
  YEAR_REQUIRED = 'YEAR_REQUIRED',
  YEAR_TOO_OLD = 'YEAR_TOO_OLD',
  YEAR_IN_FUTURE = 'YEAR_IN_FUTURE',
  GENRE_REQUIRED = 'GENRE_REQUIRED',
  GENRE_TOO_LONG = 'GENRE_TOO_LONG',
  DESCRIPTION_TOO_LONG = 'DESCRIPTION_TOO_LONG',

  // Resource errors
  BOOK_NOT_FOUND = 'BOOK_NOT_FOUND',
  BOOK_ALREADY_EXISTS = 'BOOK_ALREADY_EXISTS',

  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * Standardized error response
 */
export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Array<{
    path: string;
    message: string;
    code: ErrorCode;
  }>;
}
