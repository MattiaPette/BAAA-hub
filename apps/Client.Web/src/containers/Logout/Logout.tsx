import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';

import { useNavigate } from 'react-router';

import { useAuth } from '../../providers/AuthProvider/AuthProvider';

/**
 * Logout function for the application. This function uses the `useAuth` hook to log out the user,
 * then uses the `useNavigate` hook to redirect the user to the login page. Finally, it returns a JSX element
 * representing the logout page title.
 *
 * @returns {JSX.Element} The title of the logout page.
 *
 * @example
 * // Usage of the logout function in a React component
 * const MyComponent: FC = () => {
 *   return <Logout />;
 * };
 */
export const Logout: FC = () => {
  const { logout } = useAuth();
  const navigateTo = useNavigate();

  const pageTitle = t`Logout page`;

  useEffect(() => {
    logout();

    navigateTo('/dsahboard');
  });

  return <h1>{pageTitle}</h1>;
};
