import type { Context } from 'koa';
import {
  ErrorCode,
  FollowResponse,
  UnfollowResponse,
  FollowStatsResponse,
  FollowStatusResponse,
  NotificationType,
} from '@baaa-hub/shared-types';
import { Follow, FollowDocument } from '../models/follow.model.js';
import { User as UserMongooseModel } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuthContext } from '../middleware/auth.js';

/**
 * Transform FollowDocument to Follow response object
 */
const toFollowResponse = (doc: FollowDocument) => {
  const obj = doc.toObject();
  return {
    id: obj.id,
    followerId: obj.followerId,
    followingId: obj.followingId,
    createdAt: obj.createdAt,
  };
};

/**
 * Follow a user
 */
export const followUser = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;
  const targetUserId = ctx.params.userId;

  // Can't follow yourself
  if (userId === targetUserId) {
    throw new ApiError(
      400,
      'Cannot follow yourself',
      ErrorCode.VALIDATION_ERROR,
    );
  }

  // Check if target user exists
  const targetUser = await UserMongooseModel.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Get current user for notification data
  const currentUser = await UserMongooseModel.findByAuthId(userId);
  if (!currentUser) {
    throw new ApiError(404, 'Current user not found', ErrorCode.USER_NOT_FOUND);
  }

  // Check if already following
  const existingFollow = await Follow.findFollow(
    String(currentUser._id),
    targetUserId,
  );
  if (existingFollow) {
    throw new ApiError(
      409,
      'Already following this user',
      ErrorCode.VALIDATION_ERROR,
    );
  }

  // Create follow relationship
  const follow = new Follow({
    followerId: String(currentUser._id),
    followingId: targetUserId,
  });

  await follow.save();

  // Create notification for the followed user
  const notification = new Notification({
    userId: targetUserId,
    type: NotificationType.NEW_FOLLOWER,
    isRead: false,
    data: {
      followerId: String(currentUser._id),
      followerNickname: currentUser.nickname,
      followerName: currentUser.name,
      followerSurname: currentUser.surname,
    },
  });

  await notification.save();

  const response: FollowResponse = {
    follow: toFollowResponse(follow),
  };

  ctx.status = 201;
  ctx.body = response;
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;
  const targetUserId = ctx.params.userId;

  // Get current user
  const currentUser = await UserMongooseModel.findByAuthId(userId);
  if (!currentUser) {
    throw new ApiError(404, 'Current user not found', ErrorCode.USER_NOT_FOUND);
  }

  // Find and delete follow relationship
  const follow = await Follow.findFollow(String(currentUser._id), targetUserId);
  if (!follow) {
    throw new ApiError(
      404,
      'Not following this user',
      ErrorCode.USER_NOT_FOUND,
    );
  }

  await Follow.deleteOne({ _id: follow._id });

  const response: UnfollowResponse = {
    success: true,
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Get follow statistics for a user
 */
export const getFollowStats = async (ctx: Context): Promise<void> => {
  const targetUserId = ctx.params.userId;

  // Check if user exists
  const user = await UserMongooseModel.findById(targetUserId);
  if (!user) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  const [followersCount, followingCount] = await Promise.all([
    Follow.countFollowers(targetUserId),
    Follow.countFollowing(targetUserId),
  ]);

  const response: FollowStatsResponse = {
    stats: {
      followersCount,
      followingCount,
    },
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Check if current user is following another user
 */
export const checkFollowStatus = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;
  const targetUserId = ctx.params.userId;

  // Get current user
  const currentUser = await UserMongooseModel.findByAuthId(userId);
  if (!currentUser) {
    throw new ApiError(404, 'Current user not found', ErrorCode.USER_NOT_FOUND);
  }

  const follow = await Follow.findFollow(String(currentUser._id), targetUserId);

  const response: FollowStatusResponse = {
    isFollowing: !!follow,
  };

  ctx.status = 200;
  ctx.body = response;
};
