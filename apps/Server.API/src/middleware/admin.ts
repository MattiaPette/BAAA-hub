import type { Next } from 'koa';
import {
  ErrorCode,
  UserRole,
  hasAdminPrivileges,
  isSuperAdmin,
} from '@baaa-hub/shared-types';
import { User as UserMongooseModel } from '../models/user.model.js';
import { AuthContext } from './auth.js';

/**
 * Extended context with admin user information
 */
export interface AdminContext extends AuthContext {
  state: AuthContext['state'] & {
    adminUser: {
      id: string;
      roles: UserRole[];
      isSuperAdmin: boolean;
    };
  };
}

/**
 * Admin middleware that verifies the user has admin privileges.
 * This includes both regular admins and super-admins.
 * Must be used after authMiddleware.
 */
export const adminMiddleware = async (
  ctx: AdminContext,
  next: Next,
): Promise<void> => {
  const { userId } = ctx.state.auth;

  // Find the user in the database
  const user = await UserMongooseModel.findByAuthId(userId);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      error: 'User not found',
      code: ErrorCode.USER_NOT_FOUND,
    };
    return;
  }

  if (user.isBlocked) {
    ctx.status = 403;
    ctx.body = {
      error: 'User account is blocked',
      code: ErrorCode.USER_BLOCKED,
    };
    return;
  }

  // Check if user has admin privileges (admin or super-admin)
  if (!hasAdminPrivileges(user.roles)) {
    ctx.status = 403;
    ctx.body = {
      error: 'Admin privileges required',
      code: ErrorCode.FORBIDDEN,
    };
    return;
  }

  // Attach admin user info to context
  ctx.state.adminUser = {
    id: user.id,
    roles: user.roles,
    isSuperAdmin: isSuperAdmin(user.roles),
  };

  await next();
};

/**
 * Super-admin middleware that verifies the user has super-admin privileges.
 * Use this for operations that only super-admins should perform,
 * such as modifying admin roles.
 * Must be used after authMiddleware.
 */
export const superAdminMiddleware = async (
  ctx: AdminContext,
  next: Next,
): Promise<void> => {
  const { userId } = ctx.state.auth;

  // Find the user in the database
  const user = await UserMongooseModel.findByAuthId(userId);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      error: 'User not found',
      code: ErrorCode.USER_NOT_FOUND,
    };
    return;
  }

  if (user.isBlocked) {
    ctx.status = 403;
    ctx.body = {
      error: 'User account is blocked',
      code: ErrorCode.USER_BLOCKED,
    };
    return;
  }

  // Check if user has super-admin role
  if (!isSuperAdmin(user.roles)) {
    ctx.status = 403;
    ctx.body = {
      error: 'Super-admin privileges required',
      code: ErrorCode.FORBIDDEN,
    };
    return;
  }

  // Attach admin user info to context
  ctx.state.adminUser = {
    id: user.id,
    roles: user.roles,
    isSuperAdmin: true,
  };

  await next();
};
