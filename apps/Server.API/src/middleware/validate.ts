import type { Context, Next } from 'koa';
import { z, ZodSchema } from 'zod';

/**
 * Validation middleware factory
 * Validates request body against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return async (ctx: Context, next: Next): Promise<void> => {
    try {
      const validated = schema.parse(ctx.request.body);
      ctx.request.body = validated;
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        ctx.status = 400;
        ctx.body = {
          error: 'Validation Error',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        };
        return;
      }
      throw error;
    }
  };
};
