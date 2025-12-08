/**
 * Types for social interaction features (following, notifications)
 */

/**
 * Follow relationship between users
 */
export interface Follow {
  id: string;
  /** User who is following */
  followerId: string;
  /** User being followed */
  followingId: string;
  createdAt: string;
}

/**
 * Follower/Following count statistics
 */
export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

/**
 * Notification types
 */
export enum NotificationType {
  /** User X started following you */
  NEW_FOLLOWER = 'NEW_FOLLOWER',
}

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  /** User receiving the notification */
  userId: string;
  type: NotificationType;
  /** Whether the notification has been read */
  isRead: boolean;
  createdAt: string;
  /** Additional data specific to the notification type */
  data: NotificationData;
}

/**
 * Data for NEW_FOLLOWER notification
 */
export interface NewFollowerNotificationData {
  /** ID of the user who followed */
  followerId: string;
  /** Nickname of the user who followed */
  followerNickname: string;
  /** Name of the user who followed */
  followerName: string;
  /** Surname of the user who followed */
  followerSurname: string;
}

/**
 * Union type for notification data
 */
export type NotificationData = NewFollowerNotificationData;

/**
 * API response for follow operations
 */
export interface FollowResponse {
  follow: Follow;
}

/**
 * API response for unfollow operations
 */
export interface UnfollowResponse {
  success: boolean;
}

/**
 * API response for follow stats
 */
export interface FollowStatsResponse {
  stats: FollowStats;
}

/**
 * API response for checking follow status
 */
export interface FollowStatusResponse {
  isFollowing: boolean;
}

/**
 * API response for listing notifications
 */
export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * API response for marking notification as read
 */
export interface NotificationReadResponse {
  notification: Notification;
}

/**
 * User search result
 */
export interface UserSearchResult {
  id: string;
  nickname: string;
  name: string;
  surname: string;
  /** Avatar thumbnail key for MinIO */
  avatarThumbKey?: string;
  /** @deprecated Use avatarThumbKey instead */
  profilePicture?: string;
}

/**
 * API response for user search
 */
export interface UserSearchResponse {
  users: UserSearchResult[];
}
