import type { Context, Next } from 'koa';
import {
  info,
  debug,
  error as logError,
  tokenFingerprint,
} from '../utils/logger.js';

/**
 * Request logging middleware for Koa.
 * Emits a JSON log when request starts and when it finishes (with status & duration).
 */
export const requestLogger = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const start = Date.now();

  const authHeader = ctx.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;
  const tp = tokenFingerprint(token);

  info('request:start', {
    path: ctx.path,
    method: ctx.method,
    tokenFingerprint: tp,
  });

  try {
    await next();
  } catch (err) {
    // Re-throw after logging; there is an application-level error handler
    logError('request:error', {
      path: ctx.path,
      method: ctx.method,
      tokenFingerprint: tp,
      error: (err as Error).message,
    });
    throw err;
  } finally {
    const duration = Date.now() - start;
    const status = ctx.status || 200;

    debug('request:finish', {
      path: ctx.path,
      method: ctx.method,
      status,
      durationMs: duration,
      tokenFingerprint: tp,
    });

    // High level info for slower requests or errors
    if (status >= 500 || duration > 1000) {
      info('request:summary', {
        path: ctx.path,
        method: ctx.method,
        status,
        durationMs: duration,
        tokenFingerprint: tp,
      });
    }
  }
};

export default requestLogger;
