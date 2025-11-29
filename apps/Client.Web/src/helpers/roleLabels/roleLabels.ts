import { t } from '@lingui/core/macro';
import { UserRole } from '@baaa-hub/shared-types';

/**
 * Get translated role labels for display
 */
export const getRoleLabels = (): Record<UserRole, string> => ({
  [UserRole.MEMBER]: t`Member`,
  [UserRole.ADMIN]: t`Admin`,
  [UserRole.SUPER_ADMIN]: t`Super Admin`,
  [UserRole.ORGANIZATION_COMMITTEE]: t`Organization Committee`,
  [UserRole.COMMUNITY_LEADER]: t`Community Leader`,
  [UserRole.COMMUNITY_STAR]: t`Community Star`,
  [UserRole.GAMER]: t`Gamer`,
});

/**
 * Get translated role descriptions for display
 */
export const getRoleDescriptions = (): Record<UserRole, string> => ({
  [UserRole.MEMBER]: t`Basic member role (required)`,
  [UserRole.ADMIN]: t`Full administrative access`,
  [UserRole.SUPER_ADMIN]: t`Highest privilege level - can manage admins`,
  [UserRole.ORGANIZATION_COMMITTEE]: t`Organization committee member`,
  [UserRole.COMMUNITY_LEADER]: t`Community leadership role`,
  [UserRole.COMMUNITY_STAR]: t`Community recognition`,
  [UserRole.GAMER]: t`Gaming features access`,
});
