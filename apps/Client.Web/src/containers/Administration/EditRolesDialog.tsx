import { FC, useState, useEffect } from 'react';
import { t } from '@lingui/core/macro';
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
} from '@mui/material';

import { User, UserRole } from '@baaa-hub/shared-types';

/**
 * Role label mapping for display
 */
const roleLabels: Record<UserRole, string> = {
  [UserRole.MEMBER]: 'Member',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.ORGANIZATION_COMMITTEE]: 'Organization Committee',
  [UserRole.COMMUNITY_LEADER]: 'Community Leader',
  [UserRole.COMMUNITY_STAR]: 'Community Star',
  [UserRole.GAMER]: 'Gamer',
};

/**
 * Role descriptions
 */
const roleDescriptions: Record<UserRole, string> = {
  [UserRole.MEMBER]: 'Basic member role (required)',
  [UserRole.ADMIN]: 'Full administrative access',
  [UserRole.ORGANIZATION_COMMITTEE]: 'Organization committee member',
  [UserRole.COMMUNITY_LEADER]: 'Community leadership role',
  [UserRole.COMMUNITY_STAR]: 'Community recognition',
  [UserRole.GAMER]: 'Gaming features access',
};

interface EditRolesDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSave: (roles: UserRole[]) => Promise<void>;
}

/**
 * Dialog for editing user roles.
 *
 * @param {EditRolesDialogProps} props - Component props.
 * @returns {JSX.Element} The edit roles dialog.
 */
export const EditRolesDialog: FC<EditRolesDialogProps> = ({
  open,
  user,
  onClose,
  onSave,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [saving, setSaving] = useState(false);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t`Edit Roles for ${user.name} ${user.surname}`}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t`Select the roles to assign to this user.`}
        </Typography>
        <FormGroup>
          {Object.values(UserRole).map(role => (
            <Box key={role} sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    disabled={role === UserRole.MEMBER}
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
          disabled={saving || !hasChanges()}
        >
          {saving ? t`Saving...` : t`Save`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
