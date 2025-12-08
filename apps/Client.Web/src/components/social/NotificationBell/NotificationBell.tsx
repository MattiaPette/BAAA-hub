import { FC, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  alpha,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Notification,
  NotificationType,
  NewFollowerNotificationData,
} from '@baaa-hub/shared-types';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import {
  getNotifications,
  markNotificationAsRead,
} from '../../../services/socialService';
import { getUserImageUrl } from '../../../services/userService';

const POLL_INTERVAL = 30000; // 30 seconds

/**
 * NotificationBell component - displays notification bell with badge and dropdown
 */
export const NotificationBell: FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token?.accessToken) return;

    try {
      const response = await getNotifications(token.accessToken);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [token]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchNotifications();

    // Set up polling
    // eslint-disable-next-line functional/immutable-data
    pollIntervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Readonly<Notification>) => {
      if (!token?.accessToken) return;

      // Mark as read
      if (!notification.isRead) {
        try {
          await markNotificationAsRead(notification.id, token.accessToken);
          // Update local state
          setNotifications(prev =>
            prev.map(n =>
              n.id === notification.id ? { ...n, isRead: true } : n,
            ),
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      }

      // Handle navigation based on notification type
      if (notification.type === NotificationType.NEW_FOLLOWER) {
        const data = notification.data as NewFollowerNotificationData;
        handleClose();
        navigate(`/user/${data.followerId}`);
      }
    },
    [token, navigate, handleClose],
  );

  const open = Boolean(anchorEl);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_FOLLOWER:
        return <PersonAddIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationText = (
    notification: Readonly<Notification>,
  ): string => {
    if (notification.type === NotificationType.NEW_FOLLOWER) {
      const data = notification.data as NewFollowerNotificationData;
      return t`${data.followerName} ${data.followerSurname} (@${data.followerNickname}) is now following you`;
    }
    return t`New notification`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t`Just now`;
    if (diffMins < 60) return t`${diffMins}m ago`;
    if (diffHours < 24) return t`${diffHours}h ago`;
    if (diffDays < 7) return t`${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: theme => theme.palette.text.primary,
        }}
        aria-label={t`Notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            <Trans>Notifications</Trans>
          </Typography>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              <Trans>No notifications yet</Trans>
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => {
              const data = notification.data as NewFollowerNotificationData;
              return (
                <div key={notification.id}>
                  <ListItem
                    component="li"
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.isRead
                        ? 'transparent'
                        : theme => alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        backgroundColor: theme =>
                          alpha(theme.palette.primary.main, 0.12),
                        cursor: 'pointer',
                      },
                      py: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          data.followerId
                            ? getUserImageUrl(data.followerId, 'avatar', false)
                            : undefined
                        }
                        sx={{
                          bgcolor: theme => theme.palette.primary.main,
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={getNotificationText(notification)}
                      secondary={formatTime(notification.createdAt)}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: notification.isRead ? 400 : 600,
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                      }}
                    />
                    {!notification.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          ml: 1,
                        }}
                      />
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </div>
              );
            })}
          </List>
        )}
      </Popover>
    </>
  );
};
