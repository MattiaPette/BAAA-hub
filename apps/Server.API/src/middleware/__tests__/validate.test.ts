import { describe, it, expect, vi } from 'vitest';
import type { Context, Next } from 'koa';
import { z } from 'zod';
import { validate } from '../validate';

const createMockContext = (body: unknown = {}): Context => {
  return {
    status: 200,
    body: undefined,
    request: {
      body,
    },
  } as unknown as Context;
};

describe('validate middleware', () => {
  describe('successful validation', () => {
    it('should pass validation with valid data', async () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      const middleware = validate(schema);

      const ctx = createMockContext({
        name: 'John Doe',
        email: 'john@example.com',
      });
      const next: Next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.request.body).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should transform data based on schema', async () => {
      const schema = z.object({
        email: z.string().email().toLowerCase(),
      });
      const middleware = validate(schema);

      const ctx = createMockContext({
        email: 'JOHN@EXAMPLE.COM',
      });
      const next: Next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.request.body).toEqual({
        email: 'john@example.com',
      });
    });

    it('should strip extra fields not in schema', async () => {
      const schema = z.object({
        name: z.string(),
      });
      const middleware = validate(schema);

      const ctx = createMockContext({
        name: 'John',
        extraField: 'should be removed',
      });
      const next: Next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.request.body).toEqual({
        name: 'John',
      });
    });
  });

  describe('validation failure', () => {
    it('should return 400 with validation error details', async () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
      });
      const middleware = validate(schema);

      const ctx = createMockContext({
        name: '',
        email: 'invalid-email',
      });
      const next: Next = vi.fn();

      await middleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            message: 'Name is required',
          }),
          expect.objectContaining({
            path: 'email',
            message: 'Invalid email address',
          }),
        ]),
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const middleware = validate(schema);

      const ctx = createMockContext({});
      const next: Next = vi.fn();

      await middleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
          }),
          expect.objectContaining({
            path: 'age',
          }),
        ]),
      });
    });

    it('should handle nested path validation errors', async () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
          }),
        }),
      });
      const middleware = validate(schema);

      const ctx = createMockContext({
        user: {
          profile: {
            name: 123,
          },
        },
      });
      const next: Next = vi.fn();

      await middleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        error: 'Validation Error',
        details: [
          expect.objectContaining({
            path: 'user.profile.name',
          }),
        ],
      });
    });
  });

  describe('non-Zod errors', () => {
    it('should rethrow non-Zod errors', async () => {
      const schema = {
        parse: () => {
          throw new Error('Custom error');
        },
      } as unknown as z.ZodSchema;
      const middleware = validate(schema);

      const ctx = createMockContext({});
      const next: Next = vi.fn();

      await expect(middleware(ctx, next)).rejects.toThrow('Custom error');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
