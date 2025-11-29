import { ElementType } from 'react';
import { NavigateOptions, To } from 'react-router';
import { DrawerProps, SvgIconProps } from '@mui/material';

/**
 * Permission levels for route access control.
 *
 * Hierarchy (highest to lowest):
 * - 'super-admin': Can access all routes, manage all users including admins
 * - 'admin': Can access admin routes, manage regular users only
 * - 'user': Can access authenticated user routes
 * - 'public': Can access public routes (no authentication required)
 */
export type RoutePermission = 'super-admin' | 'admin' | 'user' | 'public';

/**
 * Navigation target configuration for sidebar routes.
 *
 * @property {To} to - React Router navigation target (path or location object)
 * @property {NavigateOptions} [options] - Optional navigation options (replace, state, etc.)
 */
export type SidebarRouteLinkTo = Readonly<{
  to: To;
  options?: NavigateOptions;
}>;

/**
 * Configuration for a single route in the sidebar navigation.
 *
 * @property {string} [id] - Unique identifier for the route (recommended for new code)
 * @property {string} label - Display label for the route
 * @property {string} path - URL path for this route
 * @property {ElementType<SvgIconProps>} [icon] - Optional icon component to display
 * @property {SidebarRouteLinkTo} [linkTo] - Optional navigation configuration
 * @property {RoutePermission} [permission] - Permission level required to access this route (default: 'user')
 * @property {number} [order] - Display order in sidebar (lower numbers first, default: 999)
 * @property {boolean} [isDivider] - Whether this should render as a divider
 * @property {boolean} [showInSidebar] - Whether to show in main sidebar navigation (default: true)
 */
export type SidebarRoute = Readonly<{
  id?: string;
  label: string;
  path: string;
  icon?: ElementType<SvgIconProps>;
  linkTo?: SidebarRouteLinkTo;
  permission?: RoutePermission;
  order?: number;
  isDivider?: boolean;
  showInSidebar?: boolean;
}>;

/**
 * Props for the Sidebar component.
 * Extends Material-UI's Drawer props with navigation and branding options.
 *
 * @property {ReadonlyArray<SidebarRoute>} [routes] - Optional array of navigation routes to display
 * @property {string} [currentPath] - Current active path for highlighting
 * @property {RoutePermission} [userPermission] - Current user's permission level
 * @property {string} [userName] - User's name to display in sidebar footer
 * @property {string} [userEmail] - User's email to display in sidebar footer
 * @property {string} [userPicture] - User's profile picture URL
 */
export type SidebarProps = DrawerProps &
  Readonly<{
    routes?: ReadonlyArray<SidebarRoute>;
    currentPath?: string;
    userPermission?: RoutePermission;
    userName?: string;
    userEmail?: string;
    userPicture?: string;
  }>;
