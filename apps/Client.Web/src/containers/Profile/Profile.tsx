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
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageIcon from '@mui/icons-material/Language';
import HeightIcon from '@mui/icons-material/Height';
import ScaleIcon from '@mui/icons-material/Scale';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { SportType, UserRole } from '@baaa-hub/shared-types';
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
import { getRoleLabels } from '../../helpers/roleLabels';
import { getCountryFlag } from '../../helpers/countries';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileEditFormInput } from './Profile.model';
import {
  ImageUpload,
  ImageViewDialog,
} from '../../components/commons/inputs/ImageUpload';

/**
 * Role color mapping for chips
 */
const roleColors: Record<
  UserRole,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [UserRole.MEMBER]: 'default',
  [UserRole.ADMIN]: 'error',
  [UserRole.SUPER_ADMIN]: 'success',
  [UserRole.ORGANIZATION_COMMITTEE]: 'primary',
  [UserRole.COMMUNITY_LEADER]: 'secondary',
  [UserRole.COMMUNITY_STAR]: 'warning',
  [UserRole.GAMER]: 'info',
};

const StravaIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.477 0 4.51 11.173h4.171" />
  </SvgIcon>
);

const GarminIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12.9 2.6c-.5-.6-1.3-.6-1.9 0L2.6 11.1c-.6.6-.6 1.3 0 1.9l8.5 8.4c.5.6 1.3.6 1.9 0l8.4-8.4c.6-.6.6-1.3 0-1.9L12.9 2.6zM12 17.2l-5.2-5.2L12 6.8l5.2 5.2-5.2 5.2z" />
  </SvgIcon>
);

const TikTokIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
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
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const baseAge = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const needsAdjustment =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate());
  return needsAdjustment ? baseAge - 1 : baseAge;
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
  // State for viewing full-size images
  const [avatarViewOpen, setAvatarViewOpen] = useState(false);
  const [bannerViewOpen, setBannerViewOpen] = useState(false);
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

  /**
   * Get the user's full-size avatar image URL
   */
  const avatarFullUrl = useMemo(() => {
    if (!user) return undefined;
    if (user.avatarKey) {
      return getUserImageUrl(user.id, 'avatar', true, avatarCacheBuster);
    }
    return user.profilePicture;
  }, [user, avatarCacheBuster]);

  /**
   * Get the user's full-size banner image URL
   */
  const bannerFullUrl = useMemo(() => {
    if (!user) return undefined;
    if (user.bannerKey) {
      return getUserImageUrl(user.id, 'banner', true, bannerCacheBuster);
    }
    return undefined;
  }, [user, bannerCacheBuster]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get translated role labels (useLingui hook makes this reactive to locale)
  const roleLabels = getRoleLabels();

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);
  const handleAvatarViewOpen = useCallback(() => setAvatarViewOpen(true), []);
  const handleAvatarViewClose = useCallback(() => setAvatarViewOpen(false), []);
  const handleBannerViewOpen = useCallback(() => setBannerViewOpen(true), []);
  const handleBannerViewClose = useCallback(() => setBannerViewOpen(false), []);

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!token?.accessToken) return;
      await uploadUserImage(token.accessToken, 'avatar', file);
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
    if (!token?.accessToken) return;
    await deleteUserImage(token.accessToken, 'avatar');
    setAvatarCacheBuster(undefined);
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }, [token, queryClient]);

  /**
   * Handle banner upload
   */
  const handleBannerUpload = useCallback(
    async (file: File) => {
      if (!token?.accessToken) return;
      await uploadUserImage(token.accessToken, 'banner', file);
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
    if (!token?.accessToken) return;
    await deleteUserImage(token.accessToken, 'banner');
    setBannerCacheBuster(undefined);
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }, [token, queryClient]);

  const handleUpdate = useCallback(
    async (data: Readonly<ProfileEditFormInput>) => {
      if (!token?.accessToken) return;

      setIsSubmitting(true);
      try {
        await updateUserProfile(token.accessToken, {
          name: data.name.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          sportTypes: data.sportTypes,
          stravaLink: data.stravaLink?.trim() || undefined,
          instagramLink: data.instagramLink?.trim() || undefined,
          youtubeLink: data.youtubeLink?.trim() || undefined,
          garminLink: data.garminLink?.trim() || undefined,
          tiktokLink: data.tiktokLink?.trim() || undefined,
          personalWebsiteLink: data.personalWebsiteLink?.trim() || undefined,
          country: data.country?.trim() || undefined,
          description: data.description?.trim() || undefined,
          cityRegion: data.cityRegion?.trim() || undefined,
          personalStats: data.personalStats,
          personalAchievements: data.personalAchievements,
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
          onImageClick={user.bannerKey ? handleBannerViewOpen : undefined}
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
            size={isMobile ? 150 : 180}
            onImageClick={
              user.avatarKey || user.profilePicture
                ? handleAvatarViewOpen
                : undefined
            }
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
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {user.name} {user.surname}
              </Typography>
              {user.country && (
                <Typography variant="h4" fontWeight={700}>
                  {getCountryFlag(user.country)}
                </Typography>
              )}
            </Stack>
            {user.cityRegion && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mb: 1 }}
              >
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.cityRegion}
                </Typography>
              </Stack>
            )}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              flexWrap="wrap"
              sx={{ gap: 1 }}
            >
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={500}
              >
                @{user.nickname}
              </Typography>
              {user.roles.map(role => (
                <Chip
                  key={role}
                  label={roleLabels[role]}
                  size="small"
                  color={roleColors[role]}
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              ))}
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

        {/* Description Box */}
        {user.description && (
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, mb: 4, ml: { md: 22 } }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {user.description}
            </Typography>
          </Paper>
        )}

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

                  {/* Age */}
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      <Trans>Age</Trans>
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculateAge(user.dateOfBirth)} <Trans>years old</Trans>
                    </Typography>
                  </Box>

                  {/* Personal Stats */}
                  {user.personalStats &&
                    (user.personalStats.height ||
                      user.personalStats.weight) && (
                      <Box>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                          {user.personalStats.height && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  color: 'primary.main',
                                }}
                              >
                                <HeightIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  <Trans>Height</Trans>
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {user.personalStats.height} cm
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          {user.personalStats.weight && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  color: 'primary.main',
                                }}
                              >
                                <ScaleIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  <Trans>Weight</Trans>
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {user.personalStats.weight} kg
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    )}
                </Stack>
              </Paper>

              {/* Social Links */}
              {(user.stravaLink ||
                user.instagramLink ||
                user.youtubeLink ||
                user.garminLink ||
                user.tiktokLink ||
                user.personalWebsiteLink) && (
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
                    {user.youtubeLink && (
                      <Button
                        component="a"
                        href={user.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<YouTubeIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          color: '#FF0000',
                          borderColor: alpha('#FF0000', 0.5),
                          '&:hover': {
                            borderColor: '#FF0000',
                            bgcolor: alpha('#FF0000', 0.05),
                          },
                        }}
                      >
                        YouTube
                      </Button>
                    )}
                    {user.garminLink && (
                      <Button
                        component="a"
                        href={user.garminLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GarminIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          color: '#007CC3',
                          borderColor: alpha('#007CC3', 0.5),
                          '&:hover': {
                            borderColor: '#007CC3',
                            bgcolor: alpha('#007CC3', 0.05),
                          },
                        }}
                      >
                        Garmin Connect
                      </Button>
                    )}
                    {user.tiktokLink && (
                      <Button
                        component="a"
                        href={user.tiktokLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<TikTokIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          borderColor: alpha(theme.palette.text.primary, 0.3),
                          '&:hover': {
                            borderColor: theme.palette.text.primary,
                            bgcolor: alpha(theme.palette.text.primary, 0.05),
                          },
                        }}
                      >
                        TikTok
                      </Button>
                    )}
                    {user.personalWebsiteLink && (
                      <Button
                        component="a"
                        href={user.personalWebsiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<LanguageIcon />}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        sx={{
                          justifyContent: 'flex-start',
                          color: theme.palette.primary.main,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <Trans>Personal Website</Trans>
                      </Button>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Sports & Achievements */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
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
              </Paper>

              {/* Personal Achievements */}
              {user.personalAchievements &&
                (user.personalAchievements.time5k ||
                  user.personalAchievements.time10k ||
                  user.personalAchievements.timeHalfMarathon ||
                  user.personalAchievements.timeMarathon) && (
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 3 }}
                    >
                      <EmojiEventsIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        <Trans>Personal Achievements</Trans>
                      </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                      {user.personalAchievements.time5k && (
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 2,
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mb: 0.5 }}
                            >
                              5K
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {user.personalAchievements.time5k}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {user.personalAchievements.time10k && (
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 2,
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mb: 0.5 }}
                            >
                              10K
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {user.personalAchievements.time10k}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {user.personalAchievements.timeHalfMarathon && (
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 2,
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mb: 0.5 }}
                            >
                              <Trans>Half Marathon</Trans>
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {user.personalAchievements.timeHalfMarathon}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {user.personalAchievements.timeMarathon && (
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 2,
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mb: 0.5 }}
                            >
                              <Trans>Marathon</Trans>
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {user.personalAchievements.timeMarathon}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}
            </Stack>
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

      {/* Image View Dialogs */}
      <ImageViewDialog
        open={avatarViewOpen}
        onClose={handleAvatarViewClose}
        imageUrl={avatarFullUrl}
        variant="avatar"
      />
      <ImageViewDialog
        open={bannerViewOpen}
        onClose={handleBannerViewClose}
        imageUrl={bannerFullUrl}
        variant="banner"
      />
    </Box>
  );
};
