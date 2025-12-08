import { FC, useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  IconButton,
  Box,
  alpha,
  Typography,
  Avatar,
  Stack,
  Button,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';

import DashboardIcon from '@mui/icons-material/Dashboard';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { Sidebar } from '../../components/commons/navigation/Sidebar/Sidebar';
import {
  SidebarProps,
  RoutePermission,
} from '../../components/commons/navigation/Sidebar/Sidebar.model';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { LoginDialog } from '../../components/login/LoginDialog/LoginDialog';
import { SignupDialog } from '../../components/login/SignupDialog/SignupDialog';
import logo from '../../assets/shrimp.png';

// Subtle gradient animation for the header accent
const accentGlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/**
 * Styled content header that matches the sidebar style
 */
const ContentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  position: 'relative',
  background:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow:
    theme.palette.mode === 'light'
      ? `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
      : 'none',
  zIndex: 10,

  // Animated gradient border
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '2px',
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.secondary.main}, 
      ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: `${accentGlow} 4s linear infinite`,
    opacity: 0.8,
  },
}));

/**
 * Logo and app name section
 */
const LogoSection = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

/**
 * Breadcrumb/title section
 */
const TitleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flex: 1,
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,

  [theme.breakpoints.down('sm')]: {
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
}));

/**
 * Auth buttons section
 */
const AuthButtonsSection = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.5),
  },
}));

/**
 * PublicContainer — a container for public-facing pages with login/signup dialogs.
 *
 * This container is used when users are not authenticated. It displays
 * the main layout with a header containing login and signup buttons
 * that open dialog modals for authentication.
 */
export const PublicContainer: FC = () => {
  const { pathname } = useLocation();
  const { title } = useBreadcrum();
  const { i18n } = useLingui();
  const { authErrorMessages } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  // Auto-reopen login dialog if there are auth errors
  useEffect(() => {
    if (authErrorMessages && authErrorMessages.length > 0 && !loginDialogOpen) {
      setLoginDialogOpen(true);
    }
  }, [authErrorMessages, loginDialogOpen]);

  const currentPath = pathname.split('/').filter(Boolean).join('/');

  // Public routes - limited navigation for unauthenticated users
  const routes: SidebarProps['routes'] = [
    {
      id: 'dashboard',
      path: 'dashboard',
      icon: DashboardIcon,
      label: t`Feed`,
      linkTo: { to: '/dashboard' },
      order: 1,
      permission: 'public' as RoutePermission,
    },
    {
      id: 'divider-settings',
      path: 'divider-settings',
      label: '',
      isDivider: true,
      order: 10,
    },
    {
      id: 'settings',
      path: 'settings',
      icon: SettingsIcon,
      label: t`Settings`,
      linkTo: { to: '/settings' },
      order: 11,
      permission: 'public' as RoutePermission,
    },
  ];

  /**
   * Handle login button click - opens login dialog.
   */
  const handleOpenLogin = useCallback(() => {
    setLoginDialogOpen(true);
  }, []);

  /**
   * Handle signup button click - opens signup dialog.
   */
  const handleOpenSignup = useCallback(() => {
    setSignupDialogOpen(true);
  }, []);

  /**
   * Close login dialog
   */
  const handleCloseLogin = useCallback(() => {
    setLoginDialogOpen(false);
  }, []);

  /**
   * Close signup dialog
   */
  const handleCloseSignup = useCallback(() => {
    setSignupDialogOpen(false);
  }, []);

  /**
   * Switch from login to signup dialog
   */
  const handleSwitchToSignup = useCallback(() => {
    setLoginDialogOpen(false);
    setSignupDialogOpen(true);
  }, []);

  /**
   * Switch from signup to login dialog
   */
  const handleSwitchToLogin = useCallback(() => {
    setSignupDialogOpen(false);
    setLoginDialogOpen(true);
  }, []);

  return (
    <FlexContainer direction="column">
      {/* Content Header with logo, menu button, breadcrumbs, and auth buttons */}
      <ContentHeader>
        <LogoSection>
          {/* Menu button for mobile/tablet */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: theme => theme.palette.text.primary,
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: theme =>
                  alpha(theme.palette.primary.main, 0.2),
              },
            }}
            aria-label={t`Open menu`}
          >
            <MenuIcon fontSize="medium" />
          </IconButton>

          {/* Logo */}
          <Avatar
            src={logo}
            variant="square"
            sx={{
              width: 45,
              height: 45,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
              },
              '& img': {
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              },
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        </LogoSection>

        {/* Breadcrumb/Title */}
        <TitleSection>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              background: theme =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${theme.palette.primary.light} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
        </TitleSection>

        {/* Login/Signup Buttons */}
        <AuthButtonsSection>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LoginIcon />}
            onClick={handleOpenLogin}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
              px: { xs: 1, sm: 2 },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Trans>Login</Trans>
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenSignup}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
              px: { xs: 1, sm: 2 },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Trans>Sign Up</Trans>
          </Button>
          {/* Mobile: Icon-only buttons */}
          <IconButton
            onClick={handleOpenLogin}
            color="primary"
            sx={{
              display: { xs: 'flex', sm: 'none' },
            }}
            aria-label={t`Login`}
          >
            <LoginIcon />
          </IconButton>
          <IconButton
            onClick={handleOpenSignup}
            color="primary"
            sx={{
              display: { xs: 'flex', sm: 'none' },
              backgroundColor: theme => theme.palette.primary.main,
              color: theme => theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme => theme.palette.primary.dark,
              },
            }}
            aria-label={t`Sign Up`}
          >
            <PersonAddIcon />
          </IconButton>
        </AuthButtonsSection>
      </ContentHeader>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          padding: 2,
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile-first overlay sidebar for public users */}
      <Sidebar
        routes={routes}
        currentPath={currentPath}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userPermission={'public' as RoutePermission}
        key={i18n.locale}
      />

      {/* Login Dialog */}
      <LoginDialog
        open={loginDialogOpen}
        onClose={handleCloseLogin}
        onSwitchToSignup={handleSwitchToSignup}
      />

      {/* Signup Dialog */}
      <SignupDialog
        open={signupDialogOpen}
        onClose={handleCloseSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </FlexContainer>
  );
};
