import { FC } from 'react';

import { Navigate, useRoutes } from 'react-router';

import { useAuth } from '../../../providers/AuthProvider/AuthProvider';

import { Login } from '../../Login/Login';
import { Logout } from '../../Logout/Logout';
import { Settings } from '../../Settings/Settings';
import { Dashboard } from '../../Dashboard/Dashboard';
import { ComponentsDemo } from '../../ComponentsDemo/ComponentsDemo';
import { Books } from '../../Books/Books';

import { Loader } from '../../../components/commons/feedbacks/Loader/Loader';

import { MainContainer } from '../../MainContainer/MainContainer';
import { LoginCallback } from '../../LoginCallback/LoginCallback';

/**
 * Function that uses the useRoutes hook to define routes for unauthenticated users.
 * The defined routes include the login page and a general redirect to the login page.
 *
 * @returns {ReactElement} A React element representing the routes for unauthenticated users.
 *
 * @example
 * // Usage of the function inside a React component
 * const NotAuthenticatedRoutes: FC = () => useRoutesForUnauthenticatedUsers();
 */
const NotAuthenticatedRoutes: FC = () =>
  useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/login/callback',
      element: <LoginCallback />,
    },
    {
      path: '*',
      element: <Navigate to="/login" />,
    },
  ]);

/**
 * Function that defines the authenticated routes of the application.
 * Uses the useRoutes hook to define the routes and their corresponding components.
 * The routes include sections such as example sections, data tables, dialogs, text areas, and language selection sections.
 * Additionally, it includes a route for logout and a fallback route that redirects to the example section.
 *
 * @returns {JSX.Element[]} An array of objects representing the authenticated routes of the application.
 *
 * @example
 * const AuthenticatedRoutes = () => {
 *   const routes = useRoutes([
 *     {
 *       element: <MainContainer />,
 *       children: [
 *         {
 *           index: true,
 *           path: 'example-section/*',
 *           element: <h1><Trans>Example Section</Trans></h1>,
 *         },
 *         // ... other routes
 *       ],
 *     },
 *     {
 *       path: '/logout',
 *       element: <Logout />,
 *     },
 *     {
 *       path: '*',
 *       element: <Navigate to="/example-section" />,
 *     },
 *   ]);
 *   return routes;
 * };
 */
const AuthenticatedRoutes: FC = () => {
  const routes = useRoutes([
    {
      element: <MainContainer />,
      children: [
        {
          path: '/dashboard/*',
          element: <Dashboard />,
        },
        {
          path: '/books/*',
          element: <Books />,
        },
        {
          path: '/components-demo/*',
          element: <ComponentsDemo />,
        },
        {
          path: '/settings',
          element: <Settings />,
        },
      ],
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" />,
    },
  ]);

  return routes;
};

/**
 * Anonymous function that manages the application's routing based on the user's authentication state.
 * Uses the useAuth hook to check if the user is authenticated and if localStorage is available.
 * If localStorage is not available, it returns a Loader component.
 * If the user is authenticated, it returns the authenticated routes; otherwise, it returns the unauthenticated routes.
 *
 * @returns {JSX.Element} Returns a Loader component if localStorage is not available, otherwise returns the authenticated or unauthenticated routes based on the user's authentication state.
 */
export const Router: FC = () => {
  const { isAuthenticated, localStorageAvailable } = useAuth();

  if (!localStorageAvailable) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <AuthenticatedRoutes />;
  }
  return <NotAuthenticatedRoutes />;
};
