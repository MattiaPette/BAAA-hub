import { FC, useState, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
} from '@mui/material';

import { User, UserRole, isSuperAdmin } from '@baaa-hub/shared-types';
import { getRoleLabels, getRoleDescriptions } from '../../helpers/roleLabels';

interface EditRolesDialogProps {
  open: boolean;
  user: User;
  currentUserRoles: UserRole[];
  onClose: () => void;
  onSave: (roles: UserRole[]) => Promise<void>;
}

/**
 * Dialog for editing user roles.
 * Respects the permission hierarchy:
 * - Super-admins can assign/revoke any role except SUPER_ADMIN
 * - Regular admins cannot assign/revoke ADMIN or SUPER_ADMIN roles
 *
 * @param {EditRolesDialogProps} props - Component props.
 * @returns {JSX.Element} The edit roles dialog.
 */
export const EditRolesDialog: FC<EditRolesDialogProps> = ({
  open,
  user,
  currentUserRoles,
  onClose,
  onSave,
}) => {
  useLingui(); // Hook for locale reactivity
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [saving, setSaving] = useState(false);

  // Get translated labels and descriptions (useLingui hook makes this reactive)
  const roleLabels = getRoleLabels();
  const roleDescriptions = getRoleDescriptions();

  // Check if current user is super-admin
  const currentUserIsSuperAdmin = isSuperAdmin(currentUserRoles);

  // Check if target user is super-admin (cannot edit their roles)
  const targetUserIsSuperAdmin = isSuperAdmin(user.roles);

  // Initialize selected roles when user changes
  useEffect(() => {
    setSelectedRoles([...user.roles]);
  }, [user]);

  const handleRoleToggle = (role: UserRole) => {
    // MEMBER role cannot be removed
    if (role === UserRole.MEMBER) return;

    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      }
      return [...prev, role];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedRoles);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (selectedRoles.length !== user.roles.length) return true;
    return selectedRoles.some(role => !user.roles.includes(role));
  };

  /**
   * Determine if a role checkbox should be disabled
   * - MEMBER is always disabled (cannot be removed)
   * - SUPER_ADMIN is always disabled (cannot be assigned/removed)
   * - ADMIN is disabled for non-super-admins
   */
  const isRoleDisabled = (role: UserRole): boolean => {
    if (role === UserRole.MEMBER) return true;
    if (role === UserRole.SUPER_ADMIN) return true;
    if (role === UserRole.ADMIN && !currentUserIsSuperAdmin) return true;
    return false;
  };

  /**
   * Determine if a role should be hidden from the list
   * - SUPER_ADMIN is always hidden (only set at database level)
   * - ADMIN is hidden for non-super-admins (they cannot see this option)
   */
  const isRoleHidden = (role: UserRole): boolean => {
    if (role === UserRole.SUPER_ADMIN) return true;
    if (role === UserRole.ADMIN && !currentUserIsSuperAdmin) return true;
    return false;
  };

  // Get visible roles
  const visibleRoles = Object.values(UserRole).filter(
    role => !isRoleHidden(role),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t`Edit Roles for ${user.name} ${user.surname}`}</DialogTitle>
      <DialogContent>
        {targetUserIsSuperAdmin ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t`Super Admin roles cannot be modified.`}
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t`Select the roles to assign to this user.`}
          </Typography>
        )}
        <FormGroup>
          {visibleRoles.map(role => (
            <Box key={role} sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    disabled={isRoleDisabled(role) || targetUserIsSuperAdmin}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{roleLabels[role]}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {roleDescriptions[role]}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t`Cancel`}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !hasChanges() || targetUserIsSuperAdmin}
        >
          {saving ? t`Saving...` : t`Save`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
