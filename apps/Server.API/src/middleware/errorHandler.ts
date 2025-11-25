import type { Context, Next } from 'koa';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ErrorCode } from '@baaa-hub/shared-types';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      ctx.status = 400;
      ctx.body = {
        error: 'Validation Error',
        code: ErrorCode.VALIDATION_ERROR,
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.message as ErrorCode,
        })),
      };
      return;
    }

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      ctx.status = 400;
      ctx.body = {
        error: 'Validation Error',
        code: ErrorCode.VALIDATION_ERROR,
        details: Object.values(error.errors).map(err => ({
          path: err.path,
          message: err.message,
          code: ErrorCode.VALIDATION_ERROR,
        })),
      };
      return;
    }

    // Handle Mongoose duplicate key errors
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      ctx.status = 409;
      ctx.body = {
        error: 'A book with this ISBN already exists',
        code: ErrorCode.BOOK_ALREADY_EXISTS,
      };
      return;
    }

    // Handle custom API errors
    if (error instanceof ApiError) {
      ctx.status = error.statusCode;
      ctx.body = {
        error: error.message,
        code: error.code,
      };
      return;
    }

    // Handle generic errors
    console.error('Unhandled error:', error);
    ctx.status = 500;
    ctx.body = {
      error: 'Internal Server Error',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};
