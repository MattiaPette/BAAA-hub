import { FC, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import {
  IconButton,
  Box,
  alpha,
  Typography,
  Avatar,
  Stack,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { Sidebar } from '../../components/commons/navigation/Sidebar/Sidebar';
import { SidebarProps } from '../../components/commons/navigation/Sidebar/Sidebar.model';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import logo from '../../assets/shrimp.png';

type BaseContainerProps = {
  /** Title displayed in the content header (breadcrumb) */
  title: string;
  /** Sidebar route definitions */
  routes: SidebarProps['routes'];
  /** Optional component to render in the content header */
  endAdornment?: React.ReactNode;
  /** Optional wrapper providers */
  providers?: React.ComponentType<{ children: React.ReactNode }>[];
};

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
 * Generic, reusable container layout for application modules.
 * Mobile-first design with overlay sidebar and user info in sidebar bottom.
 * Uses a content header that matches the sidebar style instead of a top bar.
 */
export const BaseContainer: FC<BaseContainerProps> = ({
  title,
  routes,
  endAdornment,
  providers = [],
}) => {
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPath = pathname.split('/').filter(Boolean).join('/');

  // Wrap children with any providers passed
  const wrapWithProviders = (children: Readonly<React.ReactNode>) =>
    providers.reduceRight(
      (acc, Provider) => (Provider ? <Provider>{acc}</Provider> : acc),
      children,
    );

  const content = (
    <FlexContainer direction="column">
      {/* Content Header with logo, menu button, and breadcrumbs */}
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
            aria-label="Open menu"
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

        {/* End adornment slot */}
        {endAdornment && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {endAdornment}
          </Box>
        )}
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

      {/* Mobile-first overlay sidebar */}
      <Sidebar
        routes={routes}
        currentPath={currentPath}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userName={user ? `${user.name} ${user.surname}` : undefined}
        userEmail={user?.email}
      />
    </FlexContainer>
  );

  return <>{wrapWithProviders(content)}</>;
};
