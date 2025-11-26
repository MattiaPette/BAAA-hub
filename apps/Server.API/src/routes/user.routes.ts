import Router from '@koa/router';
import { authMiddleware, AuthContext } from '../middleware/auth.js';
import {
  checkProfileStatus,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  checkNicknameAvailability,
} from '../controllers/user.controller.js';

const userRouter = new Router({ prefix: '/api/users' });

// Public routes
userRouter.get('/nickname/:nickname/available', checkNicknameAvailability);

// Protected routes - require authentication
userRouter.use(authMiddleware);

// Check profile status (for onboarding flow)
userRouter.get('/profile/status', async ctx => {
  await checkProfileStatus(ctx as AuthContext);
});

// Create user profile
userRouter.post('/', async ctx => {
  await createUser(ctx as AuthContext);
});

// Get current user profile
userRouter.get('/me', async ctx => {
  await getCurrentUser(ctx as AuthContext);
});

// Update current user profile
userRouter.patch('/me', async ctx => {
  await updateCurrentUser(ctx as AuthContext);
});

export { userRouter };
