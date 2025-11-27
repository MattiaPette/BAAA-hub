import { describe, it, expect, vi } from 'vitest';
import type { Context, Next } from 'koa';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ErrorCode } from '@baaa-hub/shared-types';
import { errorHandler, ApiError } from '../errorHandler';

const createMockContext = (): Context => {
  return {
    status: 200,
    body: undefined,
  } as unknown as Context;
};

describe('errorHandler middleware', () => {
  describe('successful request', () => {
    it('should pass through when no error is thrown', async () => {
      const ctx = createMockContext();
      const next: Next = vi.fn();

      await errorHandler(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.status).toBe(200);
    });
  });

  describe('ZodError handling', () => {
    it('should handle Zod validation errors with 400 status', async () => {
      const ctx = createMockContext();
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['name'],
          message: 'Required',
        },
      ]);

      const next: Next = vi.fn(() => {
        throw zodError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Validation Error',
        code: ErrorCode.VALIDATION_ERROR,
        details: [
          {
            path: 'name',
            message: 'Required',
            code: 'Required',
          },
        ],
      });
    });

    it('should handle Zod errors with nested paths', async () => {
      const ctx = createMockContext();
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['user', 'profile', 'name'],
          message: 'Required',
        },
      ]);

      const next: Next = vi.fn(() => {
        throw zodError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Validation Error',
        code: ErrorCode.VALIDATION_ERROR,
        details: [
          {
            path: 'user.profile.name',
            message: 'Required',
            code: 'Required',
          },
        ],
      });
    });
  });

  describe('Mongoose ValidationError handling', () => {
    it('should handle Mongoose validation errors with 400 status', async () => {
      const ctx = createMockContext();

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors.name = new mongoose.Error.ValidatorError({
        message: 'Name is required',
        path: 'name',
        type: 'required',
        value: undefined,
      });

      const next: Next = vi.fn(() => {
        throw validationError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Validation Error',
        code: ErrorCode.VALIDATION_ERROR,
        details: [
          {
            path: 'name',
            message: 'Name is required',
            code: ErrorCode.VALIDATION_ERROR,
          },
        ],
      });
    });
  });

  describe('Mongoose duplicate key error handling', () => {
    it('should handle duplicate key errors with 409 status', async () => {
      const ctx = createMockContext();
      const duplicateError = new Error('Duplicate key error') as Error & {
        code: number;
      };
      duplicateError.code = 11000;

      const next: Next = vi.fn(() => {
        throw duplicateError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(409);
      expect(ctx.body).toEqual({
        error: 'Resource already exists',
        code: ErrorCode.RESOURCE_ALREADY_EXISTS,
      });
    });
  });

  describe('ApiError handling', () => {
    it('should handle ApiError with custom status and message', async () => {
      const ctx = createMockContext();
      const apiError = new ApiError(
        404,
        'User not found',
        ErrorCode.USER_NOT_FOUND,
      );

      const next: Next = vi.fn(() => {
        throw apiError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(404);
      expect(ctx.body).toEqual({
        error: 'User not found',
        code: ErrorCode.USER_NOT_FOUND,
      });
    });

    it('should use default error code when not provided', async () => {
      const ctx = createMockContext();
      const apiError = new ApiError(500, 'Server error');

      const next: Next = vi.fn(() => {
        throw apiError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        error: 'Server error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle generic Error with 500 status', async () => {
      const ctx = createMockContext();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const genericError = new Error('Something went wrong');

      const next: Next = vi.fn(() => {
        throw genericError;
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        error: 'Internal Server Error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unhandled error:',
        genericError,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error objects with default message', async () => {
      const ctx = createMockContext();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const next: Next = vi.fn(() => {
        throw 'string error';
      });

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        error: 'Internal Server Error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      });

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('ApiError class', () => {
  it('should create ApiError with correct properties', () => {
    const error = new ApiError(400, 'Bad request', ErrorCode.VALIDATION_ERROR);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.name).toBe('ApiError');
  });

  it('should use default error code when not provided', () => {
    const error = new ApiError(500, 'Internal error');

    expect(error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
  });
});
