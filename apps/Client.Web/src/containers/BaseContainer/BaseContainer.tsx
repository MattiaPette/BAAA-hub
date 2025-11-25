import { FC, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { IconButton, Stack, Box, alpha } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { Layout } from '../../components/commons/layouts/Layout/Layout';
import { TopBar } from '../../components/commons/navigation/TopBar/TopBar';
import { TopBarTitle } from '../../components/commons/navigation/TopbarTitle/TopbarTitle';
import { Sidebar } from '../../components/commons/navigation/Sidebar/Sidebar';
import { SidebarProps } from '../../components/commons/navigation/Sidebar/Sidebar.model';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';

type BaseContainerProps = {
  /** Title in the top bar */
  title: string;
  /** Sidebar route definitions */
  routes: SidebarProps['routes'];
  /** Optional component to render at the right of the topbar */
  endAdornment?: React.ReactNode;
  /** Optional wrapper providers */
  providers?: React.ComponentType<{ children: React.ReactNode }>[];
};

/**
 * Generic, reusable container layout for application modules.
 * Mobile-first design with overlay sidebar and user info in sidebar bottom.
 */
export const BaseContainer: FC<BaseContainerProps> = ({
  title,
  routes,
  endAdornment,
  providers = [],
}) => {
  const { pathname } = useLocation();
  const { token } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPath = pathname.split('/').filter(Boolean).join('/');

  // Wrap children with any providers passed
  const wrapWithProviders = (children: Readonly<React.ReactNode>) =>
    providers.reduceRight(
      (acc, Provider) => (Provider ? <Provider>{acc}</Provider> : acc),
      children,
    );

  const renderTopBar = (
    <TopBar
      sx={{
        background: theme =>
          `linear-gradient(135deg, 
            ${theme.palette.primary.dark} 0%,
            ${theme.palette.primary.main} 50%,
            ${theme.palette.primary.light} 100%)`,
        borderBottom: 'none',
      }}
      startAdornment={
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            ml: 1,
            color: theme => theme.palette.common.white,
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.common.white, 0.1),
            },
          }}
          aria-label="Open menu"
        >
          <MenuIcon fontSize="medium" />
        </IconButton>
      }
      endAdornment={
        endAdornment && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {endAdornment}
          </Box>
        )
      }
    >
      <Stack sx={{ direction: 'row' }}>
        <TopBarTitle title={title} />
      </Stack>
    </TopBar>
  );

  const content = (
    <FlexContainer direction="column">
      <Layout startAdornment={renderTopBar}>
        <Box
          sx={{
            padding: 2,
            flex: 1,
            overflow: 'auto',
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
          userName={token?.idTokenPayload?.name}
          userEmail={token?.idTokenPayload?.email}
        />
      </Layout>
    </FlexContainer>
  );

  return <>{wrapWithProviders(content)}</>;
};
