import Router from '@koa/router';
import {
  webhookSecretMiddleware,
  WebhookContext,
} from '../middleware/webhook.js';
import { handleKeycloakUserUpdate } from '../controllers/webhook.controller.js';

const webhookRouter = new Router({ prefix: '/api/webhooks' });

/**
 * Keycloak Event Listener webhook endpoint
 * Updates user's MFA status and email verification from Keycloak events
 *
 * Security:
 * - Requires x-webhook-secret header matching KEYCLOAK_WEBHOOK_SECRET
 * - Uses constant-time comparison to prevent timing attacks
 */
webhookRouter.post(
  '/keycloak/user-update',
  webhookSecretMiddleware,
  async ctx => {
    await handleKeycloakUserUpdate(ctx as WebhookContext);
  },
);

export { webhookRouter };
