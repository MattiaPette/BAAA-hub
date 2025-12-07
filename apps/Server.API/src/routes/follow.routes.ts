import Router from '@koa/router';
import { authMiddleware, AuthContext } from '../middleware/auth.js';
import {
  followUser,
  unfollowUser,
  getFollowStats,
  checkFollowStatus,
} from '../controllers/follow.controller.js';

const followRouter = new Router({ prefix: '/api/follow' });

// Public routes - can be accessed without authentication
followRouter.get('/stats/:userId', getFollowStats);

// Protected routes - require authentication
followRouter.use(authMiddleware);

followRouter.post('/:userId', async ctx => {
  await followUser(ctx as AuthContext);
});

followRouter.delete('/:userId', async ctx => {
  await unfollowUser(ctx as AuthContext);
});

followRouter.get('/status/:userId', async ctx => {
  await checkFollowStatus(ctx as AuthContext);
});

export { followRouter };
