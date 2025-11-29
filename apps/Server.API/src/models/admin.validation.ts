import { z } from 'zod';
import { UserRole } from '@baaa-hub/shared-types';

/**
 * Zod schema for updating user roles (admin)
 */
export const adminUpdateRolesSchema = z.object({
  roles: z
    .array(z.nativeEnum(UserRole))
    .min(1, 'At least one role is required')
    .refine(
      roles => roles.includes(UserRole.MEMBER),
      'User must have at least the MEMBER role',
    ),
});

/**
 * Zod schema for updating user blocked status (admin)
 */
export const adminUpdateBlockedSchema = z.object({
  isBlocked: z.boolean(),
});

export type AdminUpdateRolesInput = z.infer<typeof adminUpdateRolesSchema>;
export type AdminUpdateBlockedInput = z.infer<typeof adminUpdateBlockedSchema>;
