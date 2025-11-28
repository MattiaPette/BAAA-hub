import type { Context } from 'koa';
import {
  ErrorCode,
  User,
  UserResponse,
  UserProfileStatusResponse,
  UserRole,
} from '@baaa-hub/shared-types';
import {
  User as UserMongooseModel,
  UserDocument,
} from '../models/user.model.js';
import {
  createUserSchema,
  updateUserSchema,
  CreateUserInput,
  UpdateUserInput,
} from '../models/user.validation.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuthContext } from '../middleware/auth.js';

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
 * Check if user has a profile (used for onboarding flow)
 */
export const checkProfileStatus = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;

  const user = await UserMongooseModel.findByAuthId(userId);

  const response: UserProfileStatusResponse = {
    hasProfile: !!user,
    user: user ? toUserResponse(user) : undefined,
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Create a new user profile
 */
export const createUser = async (ctx: AuthContext): Promise<void> => {
  const { userId, emailVerified } = ctx.state.auth;

  // Validate request body
  const validationResult = createUserSchema.safeParse(ctx.request.body);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const data: CreateUserInput = validationResult.data;

  // Check if user already exists with this authId
  const existingUser = await UserMongooseModel.findByAuthId(userId);
  if (existingUser) {
    throw new ApiError(
      409,
      'User profile already exists',
      ErrorCode.USER_ALREADY_EXISTS,
    );
  }

  // Check if email is already taken
  const existingEmail = await UserMongooseModel.findByEmail(data.email);
  if (existingEmail) {
    throw new ApiError(409, 'Email is already taken', ErrorCode.EMAIL_TAKEN);
  }

  // Check if nickname is already taken
  const existingNickname = await UserMongooseModel.findByNickname(
    data.nickname,
  );
  if (existingNickname) {
    throw new ApiError(
      409,
      'Nickname is already taken',
      ErrorCode.NICKNAME_TAKEN,
    );
  }

  // Create user
  const user = new UserMongooseModel({
    ...data,
    authId: userId,
    isEmailVerified: emailVerified || false,
    roles: [UserRole.USER],
    stravaLink: data.stravaLink || undefined,
    instagramLink: data.instagramLink || undefined,
  });

  await user.save();

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 201;
  ctx.body = response;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;

  const user = await UserMongooseModel.findByAuthId(userId);

  if (!user) {
    throw new ApiError(404, 'User profile not found', ErrorCode.USER_NOT_FOUND);
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'User account is blocked', ErrorCode.USER_BLOCKED);
  }

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Update current user profile
 */
export const updateCurrentUser = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;

  // Validate request body
  const validationResult = updateUserSchema.safeParse(ctx.request.body);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const data: UpdateUserInput = validationResult.data;

  const user = await UserMongooseModel.findByAuthId(userId);

  if (!user) {
    throw new ApiError(404, 'User profile not found', ErrorCode.USER_NOT_FOUND);
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'User account is blocked', ErrorCode.USER_BLOCKED);
  }

  // Update fields
  if (data.name !== undefined) user.name = data.name;
  if (data.surname !== undefined) user.surname = data.surname;
  if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;
  if (data.sportTypes !== undefined) user.sportTypes = data.sportTypes;
  if (data.profilePicture !== undefined)
    user.profilePicture = data.profilePicture || undefined;
  if (data.stravaLink !== undefined)
    user.stravaLink = data.stravaLink || undefined;
  if (data.instagramLink !== undefined)
    user.instagramLink = data.instagramLink || undefined;

  await user.save();

  const response: UserResponse = {
    user: toUserResponse(user),
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Check if nickname is available
 */
export const checkNicknameAvailability = async (
  ctx: Context,
): Promise<void> => {
  const nickname = ctx.params.nickname;

  if (!nickname || nickname.length < 3) {
    ctx.status = 400;
    ctx.body = {
      error: 'Invalid nickname',
      code: ErrorCode.VALIDATION_ERROR,
    };
    return;
  }

  const existingUser = await UserMongooseModel.findByNickname(nickname);

  ctx.status = 200;
  ctx.body = {
    available: !existingUser,
    nickname,
  };
};
