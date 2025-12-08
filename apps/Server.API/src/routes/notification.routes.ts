import Router from '@koa/router';
import { authMiddleware, AuthContext } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationAsRead,
} from '../controllers/notification.controller.js';

const notificationRouter = new Router({ prefix: '/api/notifications' });

// Protected routes - require authentication
notificationRouter.use(authMiddleware);

notificationRouter.get('/', async ctx => {
  await getNotifications(ctx as AuthContext);
});

notificationRouter.patch('/:notificationId/read', async ctx => {
  await markNotificationAsRead(ctx as AuthContext);
});

export { notificationRouter };
