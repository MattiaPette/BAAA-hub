import {
  ErrorCode,
  User,
  UserResponse,
  UserRole,
  AdminUsersListResponse,
  canManageUser,
  canManageAdminRole,
  isSuperAdmin,
} from '@baaa-hub/shared-types';
import {
  User as UserMongooseModel,
  UserDocument,
} from '../models/user.model.js';
import {
  adminUpdateRolesSchema,
  adminUpdateBlockedSchema,
} from '../models/admin.validation.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AdminContext } from '../middleware/admin.js';

/**
 * Transform UserDocument to User response object
 */
const toUserResponse = (doc: UserDocument): User => {
  const obj = doc.toObject();
  return {
    id: obj.id,
    name: obj.name,
    surname: obj.surname,
    nickname: obj.nickname,
    email: obj.email,
    dateOfBirth: obj.dateOfBirth,
    sportTypes: obj.sportTypes,
    profilePicture: obj.profilePicture,
    avatarKey: obj.avatarKey,
    avatarThumbKey: obj.avatarThumbKey,
    bannerKey: obj.bannerKey,
    stravaLink: obj.stravaLink,
    instagramLink: obj.instagramLink,
    authId: obj.authId,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    isBlocked: obj.isBlocked,
    isEmailVerified: obj.isEmailVerified,
    roles: obj.roles,
    privacySettings: obj.privacySettings,
  };
};

/**
 * Get all users with pagination and search.
 *
 * Permission hierarchy:
 * - Super-admins can see all users
 * - Regular admins can only see non-admin users (members)
 */
export const listUsers = async (ctx: AdminContext): Promise<void> => {
  const page = Math.max(1, parseInt(ctx.query.page as string) || 1);
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(ctx.query.perPage as string) || 20),
  );
  const search = (ctx.query.search as string) || '';
  const roleFilter = ctx.query.role as string;
  const blockedFilter = ctx.query.blocked as string;
  const emailVerifiedFilter = ctx.query.emailVerified as string;

  // Build query
  const query: Record<string, unknown> = {};

  // Regular admins can only see non-admin users
  // Super-admins can see all users
  if (!ctx.state.adminUser.isSuperAdmin) {
    query.roles = { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
  }

  // Search by name, surname, nickname, or email
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { name: searchRegex },
      { surname: searchRegex },
      { nickname: searchRegex },
      { email: searchRegex },
    ];
  }

  // Filter by role (respect visibility restrictions)
  if (roleFilter && Object.values(UserRole).includes(roleFilter as UserRole)) {
    // Non-super-admins cannot filter by admin roles
    if (
      !ctx.state.adminUser.isSuperAdmin &&
      (roleFilter === UserRole.ADMIN || roleFilter === UserRole.SUPER_ADMIN)
    ) {
      // Return empty results - they can't see these users
      ctx.status = 200;
      ctx.body = {
        data: [],
        pagination: {
          page,
          perPage,
          total: 0,
          totalPages: 0,
        },
      } satisfies AdminUsersListResponse;
      return;
    }
    query.roles = roleFilter;
  }

  // Filter by blocked status
  if (blockedFilter === 'true' || blockedFilter === 'false') {
    query.isBlocked = blockedFilter === 'true';
  }

  // Filter by email verification status
  if (emailVerifiedFilter === 'true' || emailVerifiedFilter === 'false') {
    query.isEmailVerified = emailVerifiedFilter === 'true';
  }

  // Get total count for pagination
  const total = await UserMongooseModel.countDocuments(query);
  const totalPages = Math.ceil(total / perPage);

  // Get paginated users
  const users = await UserMongooseModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage);

  const response: AdminUsersListResponse = {
    data: users.map(toUserResponse),
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Get a specific user by ID.
 *
 * Permission hierarchy:
 * - Super-admins can view any user
 * - Regular admins can only view non-admin users
 */
export const getUserById = async (ctx: AdminContext): Promise<void> => {
  const { userId } = ctx.params;

  const user = await UserMongooseModel.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if actor can view this user
  if (!canManageUser(ctx.state.adminUser.roles, user.roles)) {
    throw new ApiError(
      403,
      'Cannot view admin or super-admin users',
      ErrorCode.FORBIDDEN,
    );
  }

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Update user roles.
 *
 * Permission hierarchy:
 * - Only super-admins can assign/revoke admin roles
 * - Regular admins can only modify non-admin user roles
 * - Nobody can modify super-admin roles
 */
export const updateUserRoles = async (ctx: AdminContext): Promise<void> => {
  const { userId } = ctx.params;

  // Validate request body
  const validationResult = adminUpdateRolesSchema.safeParse(ctx.request.body);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const { roles } = validationResult.data;

  const user = await UserMongooseModel.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if actor can manage this user
  if (!canManageUser(ctx.state.adminUser.roles, user.roles)) {
    throw new ApiError(
      403,
      'Cannot modify admin or super-admin users',
      ErrorCode.FORBIDDEN,
    );
  }

  // Check if actor can perform the role change
  if (!canManageAdminRole(ctx.state.adminUser.roles, user.roles, roles)) {
    throw new ApiError(
      403,
      'Only super-admins can assign or revoke admin privileges',
      ErrorCode.FORBIDDEN,
    );
  }

  // Prevent admin from removing their own admin privileges entirely
  // A super-admin can remove their ADMIN role if they still have SUPER_ADMIN
  // A regular admin cannot remove their only admin-level role
  const isSelf = user.id === ctx.state.adminUser.id;
  if (isSelf) {
    const actorIsSuperAdmin = isSuperAdmin(ctx.state.adminUser.roles);
    const newRolesAreSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
    const newRolesAreAdmin = roles.includes(UserRole.ADMIN);

    // Super-admin trying to remove their super-admin role is blocked by canManageAdminRole
    // So we only need to check if a regular admin is trying to remove their admin role
    if (!actorIsSuperAdmin && !newRolesAreAdmin) {
      throw new ApiError(
        400,
        'Cannot remove your own admin privileges',
        ErrorCode.FORBIDDEN,
      );
    }

    // Super-admin must retain at least one admin-level role
    if (actorIsSuperAdmin && !newRolesAreSuperAdmin && !newRolesAreAdmin) {
      throw new ApiError(
        400,
        'Cannot remove your own admin privileges',
        ErrorCode.FORBIDDEN,
      );
    }
  }

  user.roles = roles;
  await user.save();

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Update user blocked status.
 *
 * Permission hierarchy:
 * - Super-admins can block/unblock any user (except themselves)
 * - Regular admins can only block/unblock non-admin users
 */
export const updateUserBlocked = async (ctx: AdminContext): Promise<void> => {
  const { userId } = ctx.params;

  // Validate request body
  const validationResult = adminUpdateBlockedSchema.safeParse(ctx.request.body);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const { isBlocked } = validationResult.data;

  const user = await UserMongooseModel.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if actor can manage this user
  if (!canManageUser(ctx.state.adminUser.roles, user.roles)) {
    throw new ApiError(
      403,
      'Cannot block/unblock admin or super-admin users',
      ErrorCode.FORBIDDEN,
    );
  }

  // Prevent admin from blocking themselves
  if (user.id === ctx.state.adminUser.id && isBlocked) {
    throw new ApiError(
      400,
      'Cannot block your own account',
      ErrorCode.FORBIDDEN,
    );
  }

  // Prevent blocking super-admins entirely (even by other super-admins)
  if (isSuperAdmin(user.roles) && isBlocked) {
    throw new ApiError(
      403,
      'Cannot block a super-admin account',
      ErrorCode.FORBIDDEN,
    );
  }

  user.isBlocked = isBlocked;
  await user.save();

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 200;
  ctx.body = response;
};
