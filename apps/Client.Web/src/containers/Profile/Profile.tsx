import { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import {
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
  useMediaQuery,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import SportsIcon from '@mui/icons-material/Sports';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InstagramIcon from '@mui/icons-material/Instagram';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { SportType } from '@baaa-hub/shared-types';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  updateUserProfile,
  getUserImageUrl,
  uploadUserImage,
  deleteUserImage,
} from '../../services/userService';
import { getSportTypeLabel } from '../../helpers/sportTypes';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileEditFormInput } from './Profile.model';
import { ImageUpload } from '../../components/commons/inputs/ImageUpload';

const StravaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.477 0 4.51 11.173h4.171" />
  </SvgIcon>
);

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
const formatDate = (dateString: string, locale: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
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
  const { i18n } = useLingui();

  const { data: user, isLoading, error } = useCurrentUser();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cache buster timestamps to force browser to reload images after upload
  const [avatarCacheBuster, setAvatarCacheBuster] = useState<
    number | undefined
  >(undefined);
  const [bannerCacheBuster, setBannerCacheBuster] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    setTitle(t`Profile`);
  }, [setTitle, i18n.locale]);

  /**
   * Get the user's avatar image URL
   * Prefer avatarKey (MinIO storage) over deprecated profilePicture URL
   */
  const avatarUrl = useMemo(() => {
    if (!user) return undefined;
    if (user.avatarKey) {
      return getUserImageUrl(user.id, 'avatar', false, avatarCacheBuster);
    }
    return user.profilePicture;
  }, [user, avatarCacheBuster]);

  /**
   * Get the user's banner image URL
   */
  const bannerUrl = useMemo(() => {
    if (!user) return undefined;
    if (user.bannerKey) {
      return getUserImageUrl(user.id, 'banner', false, bannerCacheBuster);
    }
    return undefined;
  }, [user, bannerCacheBuster]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!token?.idToken) return;
      await uploadUserImage(token.idToken, 'avatar', file);
      // Update cache buster to force browser to reload the new image
      setAvatarCacheBuster(Date.now());
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    [token, queryClient],
  );

  /**
   * Handle avatar delete
   */
  const handleAvatarDelete = useCallback(async () => {
    if (!token?.idToken) return;
    await deleteUserImage(token.idToken, 'avatar');
    setAvatarCacheBuster(undefined);
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }, [token, queryClient]);

  /**
   * Handle banner upload
   */
  const handleBannerUpload = useCallback(
    async (file: File) => {
      if (!token?.idToken) return;
      await uploadUserImage(token.idToken, 'banner', file);
      // Update cache buster to force browser to reload the new image
      setBannerCacheBuster(Date.now());
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    [token, queryClient],
  );

  /**
   * Handle banner delete
   */
  const handleBannerDelete = useCallback(async () => {
    if (!token?.idToken) return;
    await deleteUserImage(token.idToken, 'banner');
    setBannerCacheBuster(undefined);
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }, [token, queryClient]);

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
          privacySettings: data.privacySettings,
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
      {/* Cover Image Banner with Edit Overlay */}
      <Box
        sx={{
          position: 'relative',
          mb: { xs: 8, md: 6 },
          overflow: 'visible',
        }}
      >
        <ImageUpload
          variant="banner"
          imageUrl={bannerUrl}
          onUpload={handleBannerUpload}
          onDelete={user.bannerKey ? handleBannerDelete : undefined}
        />

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
          <ImageUpload
            variant="avatar"
            imageUrl={avatarUrl}
            onUpload={handleAvatarUpload}
            onDelete={user.avatarKey ? handleAvatarDelete : undefined}
            fallbackText={getInitials(user.name, user.surname)}
            size={isMobile ? 120 : 150}
          />
        </Box>
      </Box>

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
                        {formatDate(user.dateOfBirth, i18n.locale)}
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
                        {formatDate(user.createdAt, i18n.locale)}
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
                        startIcon={<StravaIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          color: '#FC4C02', // Strava brand color
                          borderColor: alpha('#FC4C02', 0.5),
                          '&:hover': {
                            borderColor: '#FC4C02',
                            bgcolor: alpha('#FC4C02', 0.05),
                          },
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
                        startIcon={<InstagramIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          color: '#E1306C', // Instagram brand color
                          borderColor: alpha('#E1306C', 0.5),
                          '&:hover': {
                            borderColor: '#E1306C',
                            bgcolor: alpha('#E1306C', 0.05),
                          },
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
                      label={getSportTypeLabel(sport as SportType)}
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
