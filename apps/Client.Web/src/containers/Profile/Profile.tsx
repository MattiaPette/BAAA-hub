import { FC, useEffect, useState, useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import SportsIcon from '@mui/icons-material/Sports';
import LinkIcon from '@mui/icons-material/Link';
import { SportType, User } from '@baaa-hub/shared-types';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { getCurrentUser, updateUserProfile } from '../../services/userService';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileEditFormInput } from './Profile.model';

/**
 * Sport type labels for display
 */
const sportTypeLabels: Record<SportType, string> = {
  [SportType.RUNNING]: 'Running',
  [SportType.CYCLING]: 'Cycling',
  [SportType.SWIMMING]: 'Swimming',
  [SportType.TRIATHLON]: 'Triathlon',
  [SportType.TRAIL_RUNNING]: 'Trail Running',
  [SportType.HIKING]: 'Hiking',
  [SportType.WALKING]: 'Walking',
  [SportType.GYM]: 'Gym',
  [SportType.CROSS_FIT]: 'CrossFit',
  [SportType.OTHER]: 'Other',
};

/**
 * Generate initials from name
 */
const getInitials = (name?: string, surname?: string): string => {
  const firstInitial = name ? name.charAt(0).toUpperCase() : '';
  const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}` || '?';
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Profile page component - displays and allows editing user profile
 */
export const Profile: FC = () => {
  const { token } = useAuth();
  const { setTitle } = useBreadcrum();
  const { enqueueSnackbar } = useSnackbar();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setTitle(t`Profile`);
  }, [setTitle]);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      if (!token?.accessToken) return;

      setIsLoading(true);
      try {
        const userData = await getCurrentUser(token.accessToken);
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(t`Failed to load profile`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);

  const handleUpdate = useCallback(
    async (data: Readonly<ProfileEditFormInput>) => {
      if (!token?.accessToken || !user) return;

      setIsSubmitting(true);
      try {
        const updatedUser = await updateUserProfile(token.accessToken, {
          name: data.name.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          sportTypes: data.sportTypes,
          stravaLink: data.stravaLink?.trim() || undefined,
          instagramLink: data.instagramLink?.trim() || undefined,
        });

        setUser(updatedUser);
        setIsEditOpen(false);
        enqueueSnackbar(t`Profile updated successfully!`, {
          variant: 'success',
        });
      } catch (err) {
        console.error('Failed to update profile:', err);
        enqueueSnackbar(t`Failed to update profile. Please try again.`, {
          variant: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, user, enqueueSnackbar],
  );

  if (isLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Skeleton variant="circular" width={100} height={100} />
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Typography color="error" textAlign="center">
              {error || t`Profile not found`}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent>
          {/* Header with Avatar */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            sx={{ mb: 3 }}
          >
            <Avatar
              src={user.profilePicture}
              sx={theme => ({
                width: 100,
                height: 100,
                fontSize: '2.5rem',
                fontWeight: 600,
                backgroundColor: theme.palette.primary.main,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              })}
            >
              {!user.profilePicture && getInitials(user.name, user.surname)}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                spacing={1}
              >
                <Typography variant="h4" fontWeight={600}>
                  {user.name} {user.surname}
                </Typography>
                <IconButton
                  onClick={handleEditOpen}
                  size="small"
                  aria-label={t`Edit profile`}
                >
                  <EditIcon />
                </IconButton>
              </Stack>
              <Typography variant="body1" color="text.secondary">
                @{user.nickname}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Profile Details */}
          <Grid container spacing={3}>
            {/* Email */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <EmailIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    <Trans>Email</Trans>
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Date of Birth */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CakeIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    <Trans>Date of Birth</Trans>
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.dateOfBirth)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Sport Types */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <SportsIcon color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    <Trans>Sport Types</Trans>
                  </Typography>
                  <Box
                    sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}
                  >
                    {user.sportTypes.map(sport => (
                      <Chip
                        key={sport}
                        label={sportTypeLabels[sport as SportType] || sport}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {/* Social Links */}
            {(user.stravaLink || user.instagramLink) && (
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <LinkIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <Trans>Social Links</Trans>
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {user.stravaLink && (
                        <Typography
                          component="a"
                          href={user.stravaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          Strava Profile
                        </Typography>
                      )}
                      {user.instagramLink && (
                        <Typography
                          component="a"
                          href={user.instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          Instagram Profile
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            )}

            {/* Member Since */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <PersonIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    <Trans>Member Since</Trans>
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Trans>Edit Profile</Trans>
        </DialogTitle>
        <DialogContent>
          <ProfileEditForm
            user={user}
            onUpdate={handleUpdate}
            onCancel={handleEditClose}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
