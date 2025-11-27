import { FC, useEffect, useState, useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import SportsIcon from '@mui/icons-material/Sports';
import LinkIcon from '@mui/icons-material/Link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { SportType } from '@baaa-hub/shared-types';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { updateUserProfile } from '../../services/userService';
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
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { data: user, isLoading, error } = useCurrentUser();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(t`Profile`);
  }, [setTitle]);

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);

  const handleUpdate = useCallback(
    async (data: Readonly<ProfileEditFormInput>) => {
      if (!token?.idToken) return;

      setIsSubmitting(true);
      try {
        await updateUserProfile(token.idToken, {
          name: data.name.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          sportTypes: data.sportTypes,
          stravaLink: data.stravaLink?.trim() || undefined,
          instagramLink: data.instagramLink?.trim() || undefined,
        });

        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

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
    [token, enqueueSnackbar, queryClient],
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
              {t`Profile not found`}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 4 }}>
      {/* Cover Image Banner */}
      <Paper
        elevation={0}
        sx={{
          height: { xs: 160, md: 240 },
          borderRadius: { xs: 0, sm: 3 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          mb: { xs: 8, md: 6 },
          overflow: 'visible',
        }}
      >
        {/* Avatar overlapping the banner */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: { xs: '50%', md: 48 },
            transform: { xs: 'translate(-50%, 50%)', md: 'translate(0, 50%)' },
            zIndex: 2,
          }}
        >
          <Avatar
            src={user.profilePicture}
            sx={{
              width: { xs: 120, md: 150 },
              height: { xs: 120, md: 150 },
              border: `4px solid ${theme.palette.background.paper}`,
              fontSize: '3rem',
              fontWeight: 700,
              bgcolor: theme.palette.secondary.main,
              boxShadow: theme.shadows[3],
            }}
          >
            {!user.profilePicture && getInitials(user.name, user.surname)}
          </Avatar>
        </Box>
      </Paper>

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={2}
          sx={{ mb: 5, ml: { md: 22 } }}
        >
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {user.name} {user.surname}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={500}
              >
                @{user.nickname}
              </Typography>
              <Chip
                label={t`Member`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 24 }}
              />
            </Stack>
          </Box>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditOpen}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            <Trans>Edit Profile</Trans>
          </Button>
        </Stack>

        {/* Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - About & Contact */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  <Trans>About</Trans>
                </Typography>

                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}
                    >
                      <EmailIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        <Trans>Email</Trans>
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}
                    >
                      <CakeIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        <Trans>Date of Birth</Trans>
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(user.dateOfBirth)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        <Trans>Joined</Trans>
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              {/* Social Links */}
              {(user.stravaLink || user.instagramLink) && (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    <Trans>Social</Trans>
                  </Typography>
                  <Stack spacing={2}>
                    {user.stravaLink && (
                      <Button
                        component="a"
                        href={user.stravaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<LinkIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          borderColor: 'divider',
                        }}
                      >
                        Strava
                      </Button>
                    )}
                    {user.instagramLink && (
                      <Button
                        component="a"
                        href={user.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<LinkIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          borderColor: 'divider',
                        }}
                      >
                        Instagram
                      </Button>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Sports & Stats */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 3, height: '100%' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <SportsIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  <Trans>Sports & Activities</Trans>
                </Typography>
              </Stack>

              {user.sportTypes.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {user.sportTypes.map(sport => (
                    <Chip
                      key={sport}
                      label={sportTypeLabels[sport as SportType] || sport}
                      color="primary"
                      variant="filled"
                      sx={{
                        borderRadius: 2,
                        px: 1,
                        py: 2.5,
                        fontWeight: 500,
                        fontSize: '0.95rem',
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  <Trans>No sports selected yet.</Trans>
                </Typography>
              )}

              <Divider sx={{ my: 4 }} />

              {/* Placeholder for future stats */}
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  <Trans>Activity Statistics</Trans>
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  <Trans>Coming soon...</Trans>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="span" fontWeight={600}>
            <Trans>Edit Profile</Trans>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <ProfileEditForm
              user={user}
              onUpdate={handleUpdate}
              onCancel={handleEditClose}
              isSubmitting={isSubmitting}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
