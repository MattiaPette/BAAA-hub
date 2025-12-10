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
    avatarKey: obj.avatarKey,
    avatarThumbKey: obj.avatarThumbKey,
    bannerKey: obj.bannerKey,
    stravaLink: obj.stravaLink,
    instagramLink: obj.instagramLink,
    youtubeLink: obj.youtubeLink,
    garminLink: obj.garminLink,
    tiktokLink: obj.tiktokLink,
    personalWebsiteLink: obj.personalWebsiteLink,
    country: obj.country,
    description: obj.description,
    cityRegion: obj.cityRegion,
    personalStats: obj.personalStats,
    personalAchievements: obj.personalAchievements,
    authId: obj.authId,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    isBlocked: obj.isBlocked,
    isEmailVerified: obj.isEmailVerified,
    mfaEnabled: obj.mfaEnabled,
    mfaType: obj.mfaType,
    roles: obj.roles,
    privacySettings: obj.privacySettings,
    workoutGoals: obj.workoutGoals,
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
    roles: [UserRole.MEMBER],
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
  if (data.youtubeLink !== undefined)
    user.youtubeLink = data.youtubeLink || undefined;
  if (data.garminLink !== undefined)
    user.garminLink = data.garminLink || undefined;
  if (data.tiktokLink !== undefined)
    user.tiktokLink = data.tiktokLink || undefined;
  if (data.personalWebsiteLink !== undefined)
    user.personalWebsiteLink = data.personalWebsiteLink || undefined;
  if (data.country !== undefined) user.country = data.country || undefined;
  if (data.description !== undefined)
    user.description = data.description || undefined;
  if (data.cityRegion !== undefined)
    user.cityRegion = data.cityRegion || undefined;
  if (data.personalStats !== undefined)
    user.personalStats = data.personalStats ?? undefined;
  if (data.personalAchievements !== undefined)
    user.personalAchievements = data.personalAchievements ?? undefined;
  if (data.privacySettings !== undefined)
    user.privacySettings = data.privacySettings;
  if (data.workoutGoals !== undefined)
    user.workoutGoals = data.workoutGoals ?? undefined;

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

/**
 * Search for users by nickname or name (fuzzy search)
 * Excludes the current user from results if authenticated
 */
export const searchUsers = async (ctx: Context): Promise<void> => {
  const query = ctx.query.q as string;

  if (!query || query.length < 2) {
    ctx.status = 200;
    ctx.body = { users: [] };
    return;
  }

  // Get current user ID if authenticated (from optional auth middleware)
  const currentUserId = (ctx.state.auth as any)?.userId;
  let currentUserMongoId: string | null = null;

  if (currentUserId) {
    const currentUser = await UserMongooseModel.findByAuthId(currentUserId);
    if (currentUser) {
      currentUserMongoId = String(currentUser._id);
    }
  }

  // Sanitize query to prevent ReDoS attacks
  // Escape special regex characters and limit length
  const sanitizedQuery = query
    .substring(0, 50)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create case-insensitive regex for fuzzy search (simple prefix match)
  const searchRegex = new RegExp(`^${sanitizedQuery}`, 'i');

  // Build query to exclude current user
  const searchQuery: any = {
    $or: [
      { nickname: searchRegex },
      { name: searchRegex },
      { surname: searchRegex },
    ],
    isBlocked: false,
  };

  // Exclude current user from results
  if (currentUserMongoId) {
    searchQuery._id = { $ne: currentUserMongoId };
  }

  // Search in nickname, name, and surname
  const users = await UserMongooseModel.find(searchQuery)
    .limit(10)
    .select('nickname name surname avatarThumbKey profilePicture');

  ctx.status = 200;
  ctx.body = {
    users: users.map(user => ({
      id: String(user._id),
      nickname: user.nickname,
      name: user.name,
      surname: user.surname,
      avatarThumbKey: user.avatarThumbKey,
      profilePicture: user.profilePicture,
    })),
  };
};

/**
 * Get public user profile by ID with privacy filtering
 */
export const getPublicUserProfile = async (ctx: Context): Promise<void> => {
  const targetUserId = ctx.params.userId;
  const requestingUserId = ctx.state.auth?.userId; // May be undefined if not authenticated

  // Get target user
  const targetUser = await UserMongooseModel.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  if (targetUser.isBlocked) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Import Follow model here to avoid circular dependencies
  const { Follow } = await import('../models/follow.model.js');

  // Get follow stats
  const [followersCount, followingCount] = await Promise.all([
    Follow.countFollowers(targetUserId),
    Follow.countFollowing(targetUserId),
  ]);

  // Check if requesting user is following target user (if authenticated)
  let isFollowing = undefined;
  if (requestingUserId) {
    const requestingUser =
      await UserMongooseModel.findByAuthId(requestingUserId);
    if (requestingUser) {
      const follow = await Follow.findFollow(
        String(requestingUser._id),
        targetUserId,
      );
      isFollowing = !!follow;
    }
  }

  // Determine what data to include based on privacy settings
  // PUBLIC = everyone, FOLLOWERS = only users who are following the target user
  const canViewFollowersOnly = isFollowing === true;

  // Start with basic public info
  const userResponse: Record<string, unknown> = {
    id: String(targetUser._id),
    name: targetUser.name,
    surname: targetUser.surname,
    nickname: targetUser.nickname,
    createdAt: targetUser.createdAt,
    roles: targetUser.roles,
  };

  // Apply privacy filtering for each field
  const privacy = targetUser.privacySettings;

  if (
    privacy.email === 'PUBLIC' ||
    (privacy.email === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.email = targetUser.email;
  }

  if (
    privacy.dateOfBirth === 'PUBLIC' ||
    (privacy.dateOfBirth === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.dateOfBirth = targetUser.dateOfBirth;
  }

  if (
    privacy.sportTypes === 'PUBLIC' ||
    (privacy.sportTypes === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.sportTypes = targetUser.sportTypes;
  }

  if (
    privacy.socialLinks === 'PUBLIC' ||
    (privacy.socialLinks === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.stravaLink = targetUser.stravaLink;
    userResponse.instagramLink = targetUser.instagramLink;
    userResponse.youtubeLink = targetUser.youtubeLink;
    userResponse.garminLink = targetUser.garminLink;
    userResponse.tiktokLink = targetUser.tiktokLink;
    userResponse.personalWebsiteLink = targetUser.personalWebsiteLink;
  }

  // Country is always public
  userResponse.country = targetUser.country;

  // Description with privacy
  if (
    privacy.description === 'PUBLIC' ||
    (privacy.description === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.description = targetUser.description;
  }

  // City/Region with privacy
  if (
    privacy.cityRegion === 'PUBLIC' ||
    (privacy.cityRegion === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.cityRegion = targetUser.cityRegion;
  }

  // Personal stats with privacy
  if (
    privacy.personalStats === 'PUBLIC' ||
    (privacy.personalStats === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.personalStats = targetUser.personalStats;
  }

  // Personal achievements with privacy
  if (
    privacy.personalAchievements === 'PUBLIC' ||
    (privacy.personalAchievements === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.personalAchievements = targetUser.personalAchievements;
  }

  if (
    privacy.avatar === 'PUBLIC' ||
    (privacy.avatar === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.avatarKey = targetUser.avatarKey;
    userResponse.avatarThumbKey = targetUser.avatarThumbKey;
    userResponse.profilePicture = targetUser.profilePicture;
  }

  if (
    privacy.banner === 'PUBLIC' ||
    (privacy.banner === 'FOLLOWERS' && canViewFollowersOnly)
  ) {
    userResponse.bannerKey = targetUser.bannerKey;
  }

  ctx.status = 200;
  ctx.body = {
    user: userResponse,
    followStats: {
      followersCount,
      followingCount,
    },
    isFollowing,
  };
};
