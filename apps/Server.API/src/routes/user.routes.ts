import Router from '@koa/router';
import {
  authMiddleware,
  AuthContext,
  optionalAuthMiddleware,
} from '../middleware/auth.js';
import {
  checkProfileStatus,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  checkNicknameAvailability,
  searchUsers,
  getPublicUserProfile,
} from '../controllers/user.controller.js';

const userRouter = new Router({ prefix: '/api/users' });

// Public routes
userRouter.get('/nickname/:nickname/available', checkNicknameAvailability);
userRouter.get('/search', searchUsers);

// Protected routes - require authentication
// These must come BEFORE the /:userId route to avoid conflicts
userRouter.get('/profile/status', authMiddleware, async ctx => {
  await checkProfileStatus(ctx as AuthContext);
});

userRouter.get('/me', authMiddleware, async ctx => {
  await getCurrentUser(ctx as AuthContext);
});

userRouter.patch('/me', authMiddleware, async ctx => {
  await updateCurrentUser(ctx as AuthContext);
});

userRouter.post('/', authMiddleware, async ctx => {
  await createUser(ctx as AuthContext);
});

// Public user profile - supports optional authentication
// This MUST come after /me and /profile/status to avoid route conflicts
userRouter.get('/:userId', optionalAuthMiddleware, getPublicUserProfile);

export { userRouter };
