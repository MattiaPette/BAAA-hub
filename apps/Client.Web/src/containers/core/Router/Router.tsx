import { FC, ReactNode } from 'react';

import { Navigate, useRoutes } from 'react-router';

import { isAdmin } from '@baaa-hub/shared-types';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useUser } from '../../../providers/UserProvider/UserProvider';

import { Logout } from '../../Logout/Logout';
import { Settings } from '../../Settings/Settings';
import { Feed } from '../../Feed/Feed';
import { Profile } from '../../Profile/Profile';
import { ProfileSetup } from '../../ProfileSetup/ProfileSetup';
import { Administration } from '../../Administration/Administration';
import { PublicProfile } from '../../PublicProfile/PublicProfile';
import { Tracker } from '../../Tracker/Tracker';

import { Loader } from '../../../components/commons/feedbacks/Loader/Loader';

import { MainContainer } from '../../MainContainer/MainContainer';
import { PublicContainer } from '../../PublicContainer/PublicContainer';
import { LoginCallback } from '../../LoginCallback/LoginCallback';

/**
 * AuthenticatedRoute - A guard component that requires authentication to access.
 * Unauthenticated users are redirected to the dashboard.
 */
const AuthenticatedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { hasProfile, isLoading: isUserLoading } = useUser();

  // Show loader while authentication/profile is being checked
  if (isUserLoading && isAuthenticated) {
    return <Loader />;
  }

  // If authenticated but no profile, redirect to setup
  if (isAuthenticated && !hasProfile) {
    return <Navigate to="/profile/setup" replace />;
  }

  // If not authenticated, redirect to dashboard
  if (!isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment -- children must be wrapped in JSX for FC return type
  return <>{children}</>;
};

/**
 * AdminRoute - A guard component that only allows users with admin role to access the route.
 * Non-admin users are redirected to the dashboard.
 */
const AdminRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();

  if (!user || !isAdmin(user.roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment -- children must be wrapped in JSX for FC return type
  return <>{children}</>;
};

/**
 * Routes for users who need to complete profile setup
 */
const ProfileSetupRoutes: FC = () =>
  useRoutes([
    {
      path: '/profile/setup',
      element: <ProfileSetup />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '*',
      element: <Navigate to="/profile/setup" />,
    },
  ]);

/**
 * Public-first routes - Most pages are publicly accessible.
 * Authentication is required only for specific features (profile, admin).
 * Login/signup is handled via dialogs in the PublicContainer.
 * Settings page is accessible to all users.
 */
const PublicFirstRoutes: FC = () => {
  const { isAuthenticated } = useAuth();

  const routes = useRoutes([
    // Login callback for Keycloak OAuth flow
    {
      path: '/login/callback',
      element: <LoginCallback />,
    },
    // Logout route
    {
      path: '/logout',
      element: <Logout />,
    },
    // Routes with authenticated MainContainer (with user info in sidebar)
    ...(isAuthenticated
      ? [
          {
            element: <MainContainer />,
            children: [
              {
                path: '/dashboard/*',
                element: <Feed />,
              },
              {
                path: '/user/:userId',
                element: <PublicProfile />,
              },
              {
                path: '/profile',
                element: (
                  <AuthenticatedRoute>
                    <Profile />
                  </AuthenticatedRoute>
                ),
              },
              {
                path: '/tracker',
                element: (
                  <AuthenticatedRoute>
                    <Tracker />
                  </AuthenticatedRoute>
                ),
              },
              {
                path: '/settings',
                element: <Settings />,
              },
              {
                path: '/administration',
                element: (
                  <AuthenticatedRoute>
                    <AdminRoute>
                      <Administration />
                    </AdminRoute>
                  </AuthenticatedRoute>
                ),
              },
            ],
          },
        ]
      : [
          // Routes with PublicContainer (with login/signup dialogs)
          {
            element: <PublicContainer />,
            children: [
              {
                path: '/dashboard/*',
                element: <Feed />,
              },
              {
                path: '/user/:userId',
                element: <PublicProfile />,
              },
              {
                path: '/settings',
                element: <Settings />,
              },
            ],
          },
        ]),
    // Default redirect to dashboard (public)
    {
      path: '*',
      element: <Navigate to="/dashboard" />,
    },
  ]);

  return routes;
};

/**
 * Router component that manages the application's routing.
 *
 * Implements a public-first approach where most content is publicly accessible.
 * - Public users see the dashboard and settings, and can browse content
 * - Login/signup is handled via dialogs in the header
 * - Authenticated users have access to additional features (profile)
 * - Admin features require admin role
 *
 * @returns {JSX.Element} The appropriate route component based on auth state
 */
export const Router: FC = () => {
  const { isAuthenticated, localStorageAvailable, isLoading } = useAuth();
  const { hasProfile, isLoading: isUserLoading } = useUser();

  // Wait for localStorage check
  if (!localStorageAvailable) {
    return <Loader />;
  }

  // Show loader during initial auth check
  if (isLoading) {
    return <Loader />;
  }

  // If authenticated but needs profile setup, show setup routes
  if (isAuthenticated && !isUserLoading && !hasProfile) {
    return <ProfileSetupRoutes />;
  }

  // Show public-first routes (works for both authenticated and unauthenticated users)
  return <PublicFirstRoutes />;
};
