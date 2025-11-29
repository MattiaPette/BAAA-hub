import Router from '@koa/router';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware, AdminContext } from '../middleware/admin.js';
import {
  listUsers,
  getUserById,
  updateUserRoles,
  updateUserBlocked,
} from '../controllers/admin.controller.js';

const adminRouter = new Router({ prefix: '/api/admin' });

// All admin routes require authentication and admin privileges
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// List all users (with pagination and search)
adminRouter.get('/users', async ctx => {
  await listUsers(ctx as AdminContext);
});

// Get a specific user by ID
adminRouter.get('/users/:userId', async ctx => {
  await getUserById(ctx as AdminContext);
});

// Update user roles
adminRouter.patch('/users/:userId/roles', async ctx => {
  await updateUserRoles(ctx as AdminContext);
});

// Update user blocked status
adminRouter.patch('/users/:userId/blocked', async ctx => {
  await updateUserBlocked(ctx as AdminContext);
});

export { adminRouter };
