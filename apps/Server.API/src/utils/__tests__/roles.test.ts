import { describe, it, expect } from 'vitest';
import {
  UserRole,
  hasRole,
  isAdmin,
  hasAnyRole,
  hasAllRoles,
} from '@baaa-hub/shared-types';

describe('UserRole utilities', () => {
  describe('UserRole enum', () => {
    it('should have MEMBER role', () => {
      expect(UserRole.MEMBER).toBe('MEMBER');
    });

    it('should have ADMIN role', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should have ORGANIZATION_COMMITTEE role', () => {
      expect(UserRole.ORGANIZATION_COMMITTEE).toBe('ORGANIZATION_COMMITTEE');
    });

    it('should have COMMUNITY_LEADER role', () => {
      expect(UserRole.COMMUNITY_LEADER).toBe('COMMUNITY_LEADER');
    });

    it('should have COMMUNITY_STAR role', () => {
      expect(UserRole.COMMUNITY_STAR).toBe('COMMUNITY_STAR');
    });

    it('should have GAMER role', () => {
      expect(UserRole.GAMER).toBe('GAMER');
    });

    it('should have exactly 6 roles', () => {
      const roleCount = Object.keys(UserRole).length;
      expect(roleCount).toBe(6);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER, UserRole.GAMER];
      expect(hasRole(userRoles, UserRole.MEMBER)).toBe(true);
      expect(hasRole(userRoles, UserRole.GAMER)).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER];
      expect(hasRole(userRoles, UserRole.ADMIN)).toBe(false);
      expect(hasRole(userRoles, UserRole.COMMUNITY_LEADER)).toBe(false);
    });

    it('should return false for empty roles array', () => {
      const userRoles: UserRole[] = [];
      expect(hasRole(userRoles, UserRole.MEMBER)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true when user has ADMIN role', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER, UserRole.ADMIN];
      expect(isAdmin(userRoles)).toBe(true);
    });

    it('should return true when user only has ADMIN role', () => {
      const userRoles: UserRole[] = [UserRole.ADMIN];
      expect(isAdmin(userRoles)).toBe(true);
    });

    it('should return false when user does not have ADMIN role', () => {
      const userRoles: UserRole[] = [
        UserRole.MEMBER,
        UserRole.COMMUNITY_LEADER,
      ];
      expect(isAdmin(userRoles)).toBe(false);
    });

    it('should return false for empty roles array', () => {
      const userRoles: UserRole[] = [];
      expect(isAdmin(userRoles)).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has at least one of the specified roles', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER, UserRole.GAMER];
      expect(hasAnyRole(userRoles, [UserRole.ADMIN, UserRole.GAMER])).toBe(
        true,
      );
    });

    it('should return true when user has all specified roles', () => {
      const userRoles: UserRole[] = [
        UserRole.MEMBER,
        UserRole.ADMIN,
        UserRole.COMMUNITY_LEADER,
      ];
      expect(
        hasAnyRole(userRoles, [UserRole.ADMIN, UserRole.COMMUNITY_LEADER]),
      ).toBe(true);
    });

    it('should return false when user has none of the specified roles', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER];
      expect(
        hasAnyRole(userRoles, [UserRole.ADMIN, UserRole.COMMUNITY_STAR]),
      ).toBe(false);
    });

    it('should return false for empty roles array', () => {
      const userRoles: UserRole[] = [];
      expect(hasAnyRole(userRoles, [UserRole.MEMBER, UserRole.ADMIN])).toBe(
        false,
      );
    });

    it('should return false when checking against empty roles to check', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER, UserRole.ADMIN];
      expect(hasAnyRole(userRoles, [])).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true when user has all specified roles', () => {
      const userRoles: UserRole[] = [
        UserRole.MEMBER,
        UserRole.ADMIN,
        UserRole.COMMUNITY_LEADER,
      ];
      expect(hasAllRoles(userRoles, [UserRole.MEMBER, UserRole.ADMIN])).toBe(
        true,
      );
    });

    it('should return false when user is missing one of the specified roles', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER, UserRole.GAMER];
      expect(
        hasAllRoles(userRoles, [
          UserRole.MEMBER,
          UserRole.ADMIN,
          UserRole.GAMER,
        ]),
      ).toBe(false);
    });

    it('should return false when user has none of the specified roles', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER];
      expect(
        hasAllRoles(userRoles, [UserRole.ADMIN, UserRole.COMMUNITY_LEADER]),
      ).toBe(false);
    });

    it('should return false for empty user roles array', () => {
      const userRoles: UserRole[] = [];
      expect(hasAllRoles(userRoles, [UserRole.MEMBER])).toBe(false);
    });

    it('should return true when checking against empty roles to check', () => {
      const userRoles: UserRole[] = [UserRole.MEMBER];
      expect(hasAllRoles(userRoles, [])).toBe(true);
    });
  });
});
