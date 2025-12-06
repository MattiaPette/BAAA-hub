import { FC, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

import { UserProfilePopupProps } from './UserProfilePopup.model';

/**
 * Helper to get initials from name
 */
const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return parts[0].charAt(0).toUpperCase();
};

/**
 * UserProfilePopup — A popup component for displaying user info and actions in desktop view.
 *
 * This component renders a user avatar button that opens a menu with user information
 * and quick actions like profile, settings, and logout.
 *
 * @param {Object} props - The component props.
 * @param {string} props.userName - User's display name.
 * @param {string} props.userEmail - User's email address.
 * @param {string} props.userPicture - User's profile picture URL.
 *
 * @returns {JSX.Element | null} The user profile popup component or null if no user data.
 */
export const UserProfilePopup: FC<UserProfilePopupProps> = ({
  userName,
  userEmail,
  userPicture,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleProfile = useCallback(() => {
    handleClose();
    navigate('/profile');
  }, [handleClose, navigate]);

  const handleSettings = useCallback(() => {
    handleClose();
    navigate('/settings');
  }, [handleClose, navigate]);

  const handleLogout = useCallback(() => {
    handleClose();
    navigate('/logout');
  }, [handleClose, navigate]);

  // Don't render if no user data
  if (!userName && !userEmail) {
    return null;
  }

  const initials = getInitials(userName);

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'user-profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t`User menu`}
        sx={{
          p: 0.5,
          border: theme =>
            `2px solid ${alpha(theme.palette.primary.main, open ? 1 : 0.3)}`,
          transition: 'border-color 0.2s ease',
          '&:hover': {
            borderColor: theme => theme.palette.primary.main,
          },
        }}
      >
        <Avatar
          src={userPicture}
          sx={{
            width: 36,
            height: 36,
            backgroundColor: theme => theme.palette.primary.main,
            color: theme => theme.palette.primary.contrastText,
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {!userPicture && initials}
        </Avatar>
      </IconButton>
      <Menu
        id="user-profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              minWidth: 280,
              borderRadius: 2,
              mt: 1,
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: theme =>
                  `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderTop: theme =>
                  `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              },
            },
          },
        }}
      >
        {/* User Info Section */}
        <Box sx={{ px: 2, py: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={userPicture}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme => theme.palette.primary.main,
                color: theme => theme.palette.primary.contrastText,
                fontWeight: 600,
              }}
            >
              {!userPicture && initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {userName && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userName}
                </Typography>
              )}
              {userEmail && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userEmail}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            startIcon={<PersonIcon />}
            onClick={handleProfile}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: 1,
              py: 1,
            }}
          >
            <Trans>Profile</Trans>
          </Button>
          <Button
            fullWidth
            startIcon={<SettingsIcon />}
            onClick={handleSettings}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: 1,
              py: 1,
            }}
          >
            <Trans>Settings</Trans>
          </Button>
        </Box>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="error"
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: 1,
              py: 1,
            }}
          >
            <Trans>Logout</Trans>
          </Button>
        </Box>
      </Menu>
    </>
  );
};
