import { useEffect, useState, useMemo } from 'react';
import { t } from '@lingui/core/macro';
import { useNavigate } from 'react-router';
import {
  List,
  Drawer,
  Box,
  Divider,
  Typography,
  Avatar,
  Stack,
  Link,
  Zoom,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha, keyframes, useTheme } from '@mui/material/styles';

import baaaLogo from '../../../../assets/baaa.png';
import { SidebarProps, SidebarRoute, RoutePermission } from './Sidebar.model';
import { SidebarItem } from '../SidebarItem/SidebarItem';
import { InstallApp } from '../../../prompts/InstallApp/InstallApp';

const DRAWER_WIDTH = 280;

// Animated gradient keyframes
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Slide in animation
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Logo glow animation
const glowAnimation = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4)); transform: scale(1.05); }
  100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1)); transform: scale(1); }
`;

/**
 * Styled drawer with animated gradient background optimized for dark theme
 */
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.dark} 0%,
      ${alpha(theme.palette.primary.main, 0.8)} 30%,
      ${alpha(theme.palette.primary.light, 0.6)} 60%,
      ${alpha(theme.palette.primary.main, 0.8)} 85%,
      ${theme.palette.primary.dark} 100%)`,
    backgroundSize: '400% 400%',
    animation: `${gradientAnimation} 15s ease infinite`,
    position: 'relative',
    overflow: 'hidden',

    // Glass morphism overlay
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(to bottom, 
        ${alpha(theme.palette.background.paper, 0.92)} 0%,
        ${alpha(theme.palette.background.paper, 0.88)} 100%)`,
      backdropFilter: 'blur(12px)',
      zIndex: 0,
    },

    // Animated border
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '2px',
      background: `linear-gradient(to bottom, 
        ${alpha(theme.palette.primary.main, 0)} 0%,
        ${alpha(theme.palette.primary.main, 0.6)} 50%,
        ${alpha(theme.palette.primary.main, 0)} 100%)`,
      animation: `${gradientAnimation} 3s ease infinite`,
    },
  },
}));

/**
 * Animated content wrapper
 */
const AnimatedContent = styled(Box)(() => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  animation: `${slideIn} 0.3s ease-out`,
}));

/**
 * Styled header with gradient
 */
const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 2, 3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  userSelect: 'none',
  cursor: 'default',

  '& .logo-container': {
    position: 'relative',
    marginBottom: theme.spacing(2),
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '120%',
      height: '120%',
      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
      zIndex: -1,
      animation: `${glowAnimation} 3s infinite ease-in-out`,
    },
  },

  '& .header-title': {
    fontWeight: 800,
    fontSize: '1.5rem',
    background:
      theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${theme.palette.primary.light} 100%)`
        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },

  '& .header-subtitle': {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
}));

/**
 * Styled user info section at bottom
 */
const UserInfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  background: `linear-gradient(to top, 
    ${alpha(theme.palette.background.paper, 0.5)} 0%,
    ${alpha(theme.palette.background.paper, 0)} 100%)`,
  backdropFilter: 'blur(10px)',
}));

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
 * Helper to check if user has permission to access a route
 *
 * Permission hierarchy:
 * - super-admin: Can access all routes
 * - admin: Can access admin and lower routes, but not super-admin routes
 * - user: Can access user and public routes
 * - public: Can access only public routes
 */
const hasPermission = (
  routePermission: RoutePermission | undefined,
  userPermission: RoutePermission | undefined,
): boolean => {
  if (!routePermission || routePermission === 'public') return true;
  if (!userPermission) return false;

  // Super-admin can access everything
  if (userPermission === 'super-admin') return true;

  // Admin can access admin and user routes, but not super-admin routes
  if (userPermission === 'admin') {
    return routePermission !== 'super-admin';
  }

  // Regular user can only access user routes
  if (userPermission === 'user' && routePermission === 'user') return true;

  return false;
};

/**
 * Mobile-first sidebar component with animated gradient design.
 * Features:
 * - Animated gradient background
 * - Glass morphism effect
 * - Smooth slide-in animation
 * - Permission-based route filtering
 * - Automatic route ordering
 * - PWA install prompt support
 * - User information display at bottom
 * - Logo/title hidden in mobile landscape view
 */
export const Sidebar: React.FC<SidebarProps> = ({
  routes = [],
  currentPath,
  open = false,
  onClose,
  userPermission = 'user',
  userName,
  userEmail,
  userPicture,
  ...props
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Check for mobile landscape orientation
  const isMobileLandscape = useMediaQuery(
    `${theme.breakpoints.down('md')} and (orientation: landscape)`,
  );

  /* PWA install handler */
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  // Filter and sort routes based on permissions and order
  const visibleRoutes = useMemo(
    () =>
      routes
        .filter(route => {
          // Hide routes not meant for sidebar
          if (route.showInSidebar === false) return false;
          // Check permissions
          return hasPermission(route.permission, userPermission);
        })
        .sort((a, b) => {
          const orderA = a.order ?? 999;
          const orderB = b.order ?? 999;
          return orderA - orderB;
        }),
    [routes, userPermission],
  );

  // Check if app is already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log(t`App is already installed`);
      setShowInstallPrompt(false);
    }
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(promptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          console.log(t`User installed the app`);
        } else {
          console.log(t`User rejected app installation`);
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  const handleNavigate = (route: SidebarRoute) => {
    if (route.linkTo) {
      navigate(route.linkTo.to.toString(), route.linkTo.options);
      // Always close drawer after navigation (mobile-first)
      if (onClose) {
        onClose({}, 'backdropClick');
      }
    }
  };

  const initials = getInitials(userName);

  return (
    <StyledDrawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      {...props}
    >
      <AnimatedContent>
        {/* Animated Header - hidden in mobile landscape */}
        {!isMobileLandscape && (
          <SidebarHeader>
            <Box className="logo-container">
              <Box
                component="img"
                src={baaaLogo}
                alt="BAAA Hub"
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(5deg)',
                  },
                }}
              />
            </Box>
            <Typography className="header-title">BAAA Hub</Typography>
            <Typography className="header-subtitle">
              Boss Anna Athlete Army
            </Typography>
          </SidebarHeader>
        )}

        {/* Main navigation list */}
        <List
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 1,
            px: 1,
          }}
        >
          {visibleRoutes.map((route, index) => {
            if (route.isDivider) {
              return (
                <Divider
                  key={route.id || route.path}
                  sx={{
                    my: 2,
                    borderColor: theme => alpha(theme.palette.divider, 0.3),
                  }}
                />
              );
            }

            return (
              <Zoom
                in={open}
                style={{ transitionDelay: `${index * 50}ms` }}
                key={route.id || route.path}
              >
                <Box>
                  <SidebarItem
                    path={route.path}
                    selected={route.path === currentPath}
                    open // Always show full width in overlay mode
                    icon={route.icon}
                    text={route.label}
                    onClick={() => handleNavigate(route)}
                  />
                </Box>
              </Zoom>
            );
          })}

          {/* PWA Install prompt */}
          {showInstallPrompt && <InstallApp handler={handleInstallApp} open />}
        </List>

        {/* Footer Credits */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack spacing={1} alignItems="center">
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Made with ❤️ by
              <Link
                href="https://github.com/mattiapette"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                Mattia
              </Link>
            </Typography>
          </Stack>
        </Box>

        {/* User Information Section */}
        {(userName || userEmail) && (
          <UserInfoSection>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={userPicture}
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: theme => theme.palette.primary.main,
                  color: theme => theme.palette.primary.contrastText,
                  boxShadow: theme =>
                    `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                {!userPicture && (
                  <Typography variant="h6" fontWeight={600}>
                    {initials}
                  </Typography>
                )}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {userName && (
                  <Typography
                    variant="subtitle2"
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
                    variant="caption"
                    sx={{
                      color: theme => alpha(theme.palette.text.secondary, 0.8),
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {userEmail}
                  </Typography>
                )}
              </Box>
            </Stack>
          </UserInfoSection>
        )}
      </AnimatedContent>
    </StyledDrawer>
  );
};
