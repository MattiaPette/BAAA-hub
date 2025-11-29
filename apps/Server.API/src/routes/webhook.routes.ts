import Router from '@koa/router';
import {
  webhookSecretMiddleware,
  WebhookContext,
} from '../middleware/webhook.js';
import { handleAuth0UserUpdate } from '../controllers/webhook.controller.js';

const webhookRouter = new Router({ prefix: '/api/webhooks' });

/**
 * Auth0 Post-Login Action webhook endpoint
 * Updates user's MFA status and email verification from Auth0 events
 *
 * Security:
 * - Requires x-webhook-secret header matching AUTH0_WEBHOOK_SECRET
 * - Uses constant-time comparison to prevent timing attacks
 */
webhookRouter.post('/auth0/user-update', webhookSecretMiddleware, async ctx => {
  await handleAuth0UserUpdate(ctx as WebhookContext);
});

export { webhookRouter };
