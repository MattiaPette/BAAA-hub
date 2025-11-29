/**
 * Supported sport types for user profiles
 */
export enum SportType {
  RUNNING = 'RUNNING',
  CYCLING = 'CYCLING',
  SWIMMING = 'SWIMMING',
  TRIATHLON = 'TRIATHLON',
  TRAIL_RUNNING = 'TRAIL_RUNNING',
  HIKING = 'HIKING',
  WALKING = 'WALKING',
  GYM = 'GYM',
  CROSS_FIT = 'CROSS_FIT',
  OTHER = 'OTHER',
}

/**
 * Privacy levels for user profile fields
 */
export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  FOLLOWERS = 'FOLLOWERS',
  PRIVATE = 'PRIVATE',
}

/**
 * User privacy settings configuration
 */
export interface UserPrivacySettings {
  email: PrivacyLevel;
  dateOfBirth: PrivacyLevel;
  sportTypes: PrivacyLevel;
  socialLinks: PrivacyLevel;
  /** Privacy setting for profile picture/avatar */
  avatar?: PrivacyLevel;
  /** Privacy setting for banner image */
  banner?: PrivacyLevel;
}

/**
 * User roles for access control.
 * These roles define the permissions and access levels within the application.
 */
export enum UserRole {
  /** Basic member role - default for all registered users */
  MEMBER = 'MEMBER',
  /** Administrator role with full system access */
  ADMIN = 'ADMIN',
  /** Organization committee member with elevated privileges */
  ORGANIZATION_COMMITTEE = 'ORGANIZATION_COMMITTEE',
  /** Community leader with community management capabilities */
  COMMUNITY_LEADER = 'COMMUNITY_LEADER',
  /** Community star recognition role */
  COMMUNITY_STAR = 'COMMUNITY_STAR',
  /** Gamer role for gaming-related features */
  GAMER = 'GAMER',
}

/**
 * Checks if a user has a specific role
 * @param userRoles - Array of roles assigned to the user
 * @param role - The role to check for
 * @returns true if user has the specified role
 */
export const hasRole = (userRoles: UserRole[], role: UserRole): boolean => {
  return userRoles.includes(role);
};

/**
 * Checks if a user has admin privileges
 * @param userRoles - Array of roles assigned to the user
 * @returns true if user has the ADMIN role
 */
export const isAdmin = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, UserRole.ADMIN);
};

/**
 * Checks if a user has any of the specified roles
 * @param userRoles - Array of roles assigned to the user
 * @param roles - Array of roles to check for
 * @returns true if user has at least one of the specified roles
 */
export const hasAnyRole = (userRoles: UserRole[], roles: UserRole[]): boolean => {
  return roles.some(role => hasRole(userRoles, role));
};

/**
 * Checks if a user has all of the specified roles
 * @param userRoles - Array of roles assigned to the user
 * @param roles - Array of roles to check for
 * @returns true if user has all of the specified roles
 */
export const hasAllRoles = (userRoles: UserRole[], roles: UserRole[]): boolean => {
  return roles.every(role => hasRole(userRoles, role));
};

/**
 * Base user data that can be set by the user
 */
export interface UserProfileData {
  name: string;
  surname: string;
  nickname: string;
  email: string;
  dateOfBirth: string; // ISO date string
  sportTypes: SportType[];
  /** @deprecated Use avatarKey instead for MinIO storage */
  profilePicture?: string;
  /** Object storage key for avatar image (stored in MinIO) */
  avatarKey?: string;
  /** Object storage key for avatar thumbnail image (stored in MinIO) */
  avatarThumbKey?: string;
  /** Object storage key for banner image (stored in MinIO) */
  bannerKey?: string;
  stravaLink?: string;
  instagramLink?: string;
  privacySettings: UserPrivacySettings;
}

/**
 * Full user entity including system fields
 */
export interface User extends UserProfileData {
  id: string;
  authId: string;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  roles: UserRole[];
}

/**
 * Request body for creating a new user profile
 */
export type CreateUserRequest = UserProfileData;

/**
 * Request body for updating a user profile
 */
export type UpdateUserRequest = Partial<
  Omit<UserProfileData, 'email' | 'nickname'>
>;

/**
 * API response for user operations
 */
export interface UserResponse {
  user: User;
}

/**
 * User profile status check response
 */
export interface UserProfileStatusResponse {
  hasProfile: boolean;
  user?: User;
}
