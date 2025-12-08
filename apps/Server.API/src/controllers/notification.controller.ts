import {
  ErrorCode,
  NotificationsListResponse,
  NotificationReadResponse,
  Notification as NotificationType,
} from '@baaa-hub/shared-types';
import {
  Notification,
  NotificationDocument,
} from '../models/notification.model.js';
import { User as UserMongooseModel } from '../models/user.model.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuthContext } from '../middleware/auth.js';

/**
 * Transform NotificationDocument to Notification response object
 */
const toNotificationResponse = (
  doc: NotificationDocument,
): NotificationType => {
  const obj = doc.toObject();
  return {
    id: obj.id,
    userId: obj.userId,
    type: obj.type,
    isRead: obj.isRead,
    createdAt: obj.createdAt,
    data: obj.data,
  };
};

/**
 * Get notifications for the current user
 */
export const getNotifications = async (ctx: AuthContext): Promise<void> => {
  const { userId } = ctx.state.auth;

  // Get current user
  const currentUser = await UserMongooseModel.findByAuthId(userId);
  if (!currentUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Get all notifications for the user
  const notifications = await Notification.findByUser(String(currentUser._id));

  // Count unread notifications
  const unreadCount = await Notification.countUnreadByUser(
    String(currentUser._id),
  );

  const response: NotificationsListResponse = {
    notifications: notifications.map(toNotificationResponse),
    unreadCount,
  };

  ctx.status = 200;
  ctx.body = response;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  ctx: AuthContext,
): Promise<void> => {
  const { userId } = ctx.state.auth;
  const notificationId = ctx.params.notificationId;

  // Get current user
  const currentUser = await UserMongooseModel.findByAuthId(userId);
  if (!currentUser) {
    throw new ApiError(404, 'User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Find notification
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(
      404,
      'Notification not found',
      ErrorCode.VALIDATION_ERROR,
    );
  }

  // Verify notification belongs to current user
  if (notification.userId !== String(currentUser._id)) {
    throw new ApiError(403, 'Forbidden', ErrorCode.VALIDATION_ERROR);
  }

  // Mark as read
  notification.isRead = true;
  await notification.save();

  const response: NotificationReadResponse = {
    notification: toNotificationResponse(notification),
  };

  ctx.status = 200;
  ctx.body = response;
};
