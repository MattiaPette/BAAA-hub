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
 *
 * Role Hierarchy:
 * - SUPER_ADMIN: Highest level, can manage all users including admins
 * - ADMIN: Can manage regular users but not other admins or super-admins
 * - MEMBER and others: Regular users with no admin capabilities
 */
export enum UserRole {
  /** Basic member role - default for all registered users */
  MEMBER = 'MEMBER',
  /** Administrator role with elevated privileges for managing regular users */
  ADMIN = 'ADMIN',
  /** Super administrator role - highest privilege level, can manage admins */
  SUPER_ADMIN = 'SUPER_ADMIN',
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
 * Checks if a user has super-admin privileges
 * @param userRoles - Array of roles assigned to the user
 * @returns true if user has the SUPER_ADMIN role
 */
export const isSuperAdmin = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, UserRole.SUPER_ADMIN);
};

/**
 * Checks if a user has any administrative privileges (admin or super-admin)
 * @param userRoles - Array of roles assigned to the user
 * @returns true if user has ADMIN or SUPER_ADMIN role
 */
export const hasAdminPrivileges = (userRoles: UserRole[]): boolean => {
  return isAdmin(userRoles) || isSuperAdmin(userRoles);
};

/**
 * Checks if a user can manage another user's admin role.
 * Only super-admins can assign/revoke admin roles.
 * @param actorRoles - Roles of the user performing the action
 * @param targetRoles - Current roles of the target user
 * @param newRoles - New roles to be assigned to the target user
 * @returns true if the action is allowed
 */
export const canManageAdminRole = (
  actorRoles: UserRole[],
  targetRoles: UserRole[],
  newRoles: UserRole[],
): boolean => {
  // Only super-admins can manage admin roles
  if (!isSuperAdmin(actorRoles)) {
    // Check if trying to add or remove ADMIN or SUPER_ADMIN role
    const hadAdmin = targetRoles.includes(UserRole.ADMIN);
    const willHaveAdmin = newRoles.includes(UserRole.ADMIN);
    const hadSuperAdmin = targetRoles.includes(UserRole.SUPER_ADMIN);
    const willHaveSuperAdmin = newRoles.includes(UserRole.SUPER_ADMIN);

    // Non-super-admins cannot change admin/super-admin status
    if (
      hadAdmin !== willHaveAdmin ||
      hadSuperAdmin !== willHaveSuperAdmin
    ) {
      return false;
    }
  }

  // Nobody can modify super-admin role (even super-admins can't demote themselves)
  const targetIsSuperAdmin = isSuperAdmin(targetRoles);
  const newRolesHasSuperAdmin = newRoles.includes(UserRole.SUPER_ADMIN);

  if (targetIsSuperAdmin !== newRolesHasSuperAdmin) {
    return false;
  }

  return true;
};

/**
 * Checks if a user can be managed by an admin.
 * Admins can only manage non-privileged users (not admins or super-admins).
 * @param actorRoles - Roles of the user performing the action
 * @param targetRoles - Roles of the target user
 * @returns true if the actor can manage the target user
 */
export const canManageUser = (
  actorRoles: UserRole[],
  targetRoles: UserRole[],
): boolean => {
  // Super-admins can manage anyone
  if (isSuperAdmin(actorRoles)) {
    return true;
  }

  // Regular admins cannot manage other admins or super-admins
  if (hasAdminPrivileges(targetRoles)) {
    return false;
  }

  return true;
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
 * Types of MFA methods supported by Keycloak
 */
export enum MfaType {
  /** No MFA enabled */
  NONE = 'NONE',
  /** Time-based One-Time Password (authenticator apps) */
  TOTP = 'TOTP',
  /** SMS-based verification */
  SMS = 'SMS',
  /** Email-based verification */
  EMAIL = 'EMAIL',
  /** Push notification */
  PUSH = 'PUSH',
  /** WebAuthn/FIDO2 security keys */
  WEBAUTHN = 'WEBAUTHN',
  /** Recovery codes */
  RECOVERY_CODE = 'RECOVERY_CODE',
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
  /** Whether the user has MFA enabled (synced from Keycloak via webhook) */
  mfaEnabled: boolean;
  /** Primary MFA type used by the user (synced from Keycloak via webhook) */
  mfaType: MfaType;
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

/**
 * Admin API: Request body for updating user roles
 */
export interface AdminUpdateUserRolesRequest {
  roles: UserRole[];
}

/**
 * Admin API: Request body for updating user blocked status
 */
export interface AdminUpdateUserBlockedRequest {
  isBlocked: boolean;
}

/**
 * Admin API: Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Admin API: List users response
 */
export type AdminUsersListResponse = PaginatedResponse<User>;

/**
 * Keycloak Event Listener webhook payload
 * Sent by Keycloak to sync MFA and email verification status
 */
export interface KeycloakUserUpdateWebhookPayload {
  /** Keycloak user ID (UUID format) */
  user_id: string;
  /** User's email address */
  email: string;
  /** Whether the user's email is verified in Keycloak */
  email_verified: boolean;
  /** Whether MFA is enabled for the user */
  mfa_enabled: boolean;
  /** Primary MFA type if MFA is enabled */
  mfa_type?: string;
}
