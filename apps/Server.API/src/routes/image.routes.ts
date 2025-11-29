import Router from '@koa/router';
import { authMiddleware, AuthContext } from '../middleware/auth.js';
import {
  uploadUserImage,
  getUserImage,
  getMyImage,
  deleteUserImage,
} from '../controllers/image.controller.js';

const imageRouter = new Router({ prefix: '/api/images' });

// Public route - get any user's image (with validation that user exists)
imageRouter.get('/user/:userId/:type', getUserImage);

// Protected routes - require authentication
imageRouter.use(authMiddleware);

// Get current user's image
imageRouter.get('/me/:type', async ctx => {
  await getMyImage(ctx as AuthContext);
});

// Upload image for current user
imageRouter.put('/me/:type', async ctx => {
  await uploadUserImage(ctx as AuthContext);
});

// Delete current user's image
imageRouter.delete('/me/:type', async ctx => {
  await deleteUserImage(ctx as AuthContext);
});

export { imageRouter };
