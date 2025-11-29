import {
  ErrorCode,
  User,
  UserResponse,
  UserRole,
  AdminUsersListResponse,
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
 * Get all users with pagination and search
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

  // Filter by role
  if (roleFilter && Object.values(UserRole).includes(roleFilter as UserRole)) {
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
 * Get a specific user by ID
 */
export const getUserById = async (ctx: AdminContext): Promise<void> => {
  const { userId } = ctx.params;

  const user = await UserMongooseModel.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Update user roles
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

  // Prevent admin from removing their own admin role
  if (user.id === ctx.state.adminUser.id && !roles.includes(UserRole.ADMIN)) {
    throw new ApiError(
      400,
      'Cannot remove your own admin privileges',
      ErrorCode.FORBIDDEN,
    );
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
 * Update user blocked status
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

  // Prevent admin from blocking themselves
  if (user.id === ctx.state.adminUser.id && isBlocked) {
    throw new ApiError(
      400,
      'Cannot block your own account',
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
