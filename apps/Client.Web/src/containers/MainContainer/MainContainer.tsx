import { FC, useMemo } from 'react';
import { useLingui } from '@lingui/react';
import { t } from '@lingui/core/macro';

import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';

import { SidebarProps } from '../../components/commons/navigation/Sidebar/Sidebar.model';
import { BaseContainer } from '../BaseContainer/BaseContainer';

/**
 * MainContainer — wraps the main entry sections of the app (Hub, Factory, Licenses, CAT, etc.)
 * Uses BaseContainer with mobile-first design and permission-based routing.
 */
export const MainContainer: FC = () => {
  const { title } = useBreadcrum();
  const { i18n } = useLingui();

  const routes = useMemo<SidebarProps['routes']>(
    () => [
      {
        id: 'dashboard',
        path: 'dashboard',
        icon: DashboardIcon,
        label: t`Dashboard`,
        linkTo: { to: '/dashboard' },
        order: 1,
        permission: 'user',
      },
      {
        id: 'profile',
        path: 'profile',
        icon: PersonIcon,
        label: t`Profile`,
        linkTo: { to: '/profile' },
        order: 2,
        permission: 'user',
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
        permission: 'user',
      },
      {
        id: 'logout',
        path: 'logout',
        icon: LogoutIcon,
        label: t`Logout`,
        linkTo: { to: '/logout' },
        order: 12,
        permission: 'user',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- i18n.locale triggers re-translation when language changes
    [i18n.locale],
  );

  return (
    <BaseContainer
      title={title}
      routes={routes}
      endAdornment={null}
      providers={[]}
    />
  );
};
