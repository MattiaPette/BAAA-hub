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
 * User roles for access control
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

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
  profilePicture?: string;
  stravaLink?: string;
  instagramLink?: string;
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
