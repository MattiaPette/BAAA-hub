import { FC, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
  Avatar,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import SportsIcon from '@mui/icons-material/Sports';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InstagramIcon from '@mui/icons-material/Instagram';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import {
  SportType,
  UserRole,
  PublicUserProfileResponse,
} from '@baaa-hub/shared-types';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  getPublicUserProfile,
  followUser,
  unfollowUser,
} from '../../services/socialService';
import { getUserImageUrl } from '../../services/userService';
import { getSportTypeLabel } from '../../helpers/sportTypes';
import { getRoleLabels } from '../../helpers/roleLabels';
import { ImageViewDialog } from '../../components/commons/inputs/ImageUpload';

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
 * PublicProfile page component - displays user profile with privacy filtering
 */
export const PublicProfile: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { setTitle } = useBreadcrum();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { i18n } = useLingui();
  const { data: currentUser } = useCurrentUser();

  const [profileData, setProfileData] =
    useState<PublicUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [avatarViewOpen, setAvatarViewOpen] = useState(false);
  const [bannerViewOpen, setBannerViewOpen] = useState(false);

  const roleLabels = getRoleLabels();

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      try {
        const response = await getPublicUserProfile(userId, token?.accessToken);
        setProfileData(response);
        setIsFollowing(response.isFollowing ?? false);
        setTitle(`${response.user.name} ${response.user.surname}`);
      } catch (error) {
        console.error('Failed to load profile:', error);
        enqueueSnackbar(t`Failed to load user profile`, { variant: 'error' });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, token?.accessToken, navigate, enqueueSnackbar, setTitle]);

  const handleFollow = useCallback(async () => {
    if (!isAuthenticated || !token?.accessToken || !userId) {
      enqueueSnackbar(t`Please log in to follow users`, { variant: 'info' });
      return;
    }

    setIsFollowLoading(true);
    try {
      await followUser(userId, token.accessToken);
      setIsFollowing(true);
      setProfileData(prev =>
        prev
          ? {
              ...prev,
              followStats: {
                ...prev.followStats,
                followersCount: prev.followStats.followersCount + 1,
              },
            }
          : prev,
      );
      enqueueSnackbar(t`Successfully followed user`, { variant: 'success' });
    } catch (error) {
      console.error('Failed to follow user:', error);
      enqueueSnackbar(t`Failed to follow user`, { variant: 'error' });
    } finally {
      setIsFollowLoading(false);
    }
  }, [isAuthenticated, token, userId, enqueueSnackbar]);

  const handleUnfollow = useCallback(async () => {
    if (!isAuthenticated || !token?.accessToken || !userId) return;

    setIsFollowLoading(true);
    try {
      await unfollowUser(userId, token.accessToken);
      setIsFollowing(false);
      setProfileData(prev =>
        prev
          ? {
              ...prev,
              followStats: {
                ...prev.followStats,
                followersCount: prev.followStats.followersCount - 1,
              },
            }
          : prev,
      );
      enqueueSnackbar(t`Successfully unfollowed user`, { variant: 'success' });
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      enqueueSnackbar(t`Failed to unfollow user`, { variant: 'error' });
    } finally {
      setIsFollowLoading(false);
    }
  }, [isAuthenticated, token, userId, enqueueSnackbar]);

  const handleAvatarViewOpen = useCallback(() => setAvatarViewOpen(true), []);
  const handleAvatarViewClose = useCallback(() => setAvatarViewOpen(false), []);
  const handleBannerViewOpen = useCallback(() => setBannerViewOpen(true), []);
  const handleBannerViewClose = useCallback(() => setBannerViewOpen(false), []);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Skeleton variant="circular" width={180} height={180} />
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!profileData) {
    return null;
  }

  const { user } = profileData;
  const { followStats } = profileData;

  const avatarUrl = user.avatarKey
    ? getUserImageUrl(userId!, 'avatar', false)
    : user.profilePicture;
  const bannerUrl = user.bannerKey
    ? getUserImageUrl(userId!, 'banner', false)
    : undefined;
  const avatarFullUrl = user.avatarKey
    ? getUserImageUrl(userId!, 'avatar', true)
    : user.profilePicture;
  const bannerFullUrl = user.bannerKey
    ? getUserImageUrl(userId!, 'banner', true)
    : undefined;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 4 }}>
      {/* Banner */}
      <Box
        sx={{
          position: 'relative',
          mb: { xs: 8, md: 6 },
          overflow: 'visible',
        }}
      >
        {bannerUrl ? (
          <Box
            onClick={handleBannerViewOpen}
            sx={{
              width: '100%',
              height: 300,
              backgroundImage: `url(${bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 300,
              background: theme =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: 3,
            }}
          />
        )}

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
          {avatarUrl ? (
            <Avatar
              src={avatarUrl}
              onClick={handleAvatarViewOpen}
              sx={{
                width: { xs: 150, md: 180 },
                height: { xs: 150, md: 180 },
                border: theme => `4px solid ${theme.palette.background.paper}`,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: { xs: 150, md: 180 },
                height: { xs: 150, md: 180 },
                border: theme => `4px solid ${theme.palette.background.paper}`,
                bgcolor: theme => theme.palette.primary.main,
                fontSize: '3rem',
              }}
            >
              {getInitials(user.name, user.surname)}
            </Avatar>
          )}
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={2}
          sx={{ mb: 3, ml: { md: 22 } }}
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
              flexWrap="wrap"
              sx={{ gap: 1, mb: 2 }}
            >
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={500}
              >
                @{user.nickname}
              </Typography>
              {user.roles?.map((role: UserRole) => (
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

            {/* Follow Stats */}
            <Stack
              direction="row"
              spacing={3}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {followStats.followersCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Followers</Trans>
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {followStats.followingCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Following</Trans>
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Follow/Unfollow Button */}
          {isAuthenticated && !isOwnProfile && (
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={isFollowLoading}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isFollowing ? <Trans>Unfollow</Trans> : <Trans>Follow</Trans>}
            </Button>
          )}
        </Stack>

        {/* Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - About & Contact */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {(user.email || user.dateOfBirth || user.createdAt) && (
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
                    {user.email && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
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
                    )}

                    {user.dateOfBirth && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
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
                    )}

                    {user.createdAt && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
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
                    )}
                  </Stack>
                </Paper>
              )}

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
                          color: '#FC4C02',
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
                          color: '#E1306C',
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
            {user.sportTypes && user.sportTypes.length > 0 && (
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

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {user.sportTypes.map((sport: string) => (
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
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

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
