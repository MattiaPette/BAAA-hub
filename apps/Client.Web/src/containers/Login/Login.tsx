import { FC, useCallback, useState } from 'react';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';

import { LoginForm } from '../../components/login/LoginForm/LoginForm';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { LoginFormValue } from '../../components/login/LoginForm/LoginForm.model';

/**
 * Login component — renders the login form and handles user authentication.
 *
 * Reads the current location for returned error codes and provides an
 * `onSubmit` handler that delegates credential verification to the
 * `AuthProvider`'s `login()` method. When `login()` reports an error the
 * component translates the error code to a human-friendly message and
 * displays it in the form.
 *
 * @returns {JSX.Element} A React element containing the login form.
 * @throws {Error} If `useAuth()` is called outside an `AuthProvider` the
 *   hook may throw; ensure the component is rendered inside an
 *   `AuthProvider`.
 *
 * @example
 * // Route usage
 * // <Route path="/login" element={<Login />} />
 */

export const Login: FC = () => {
  const { login, authErrorMessages, clearAuthErrors } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (loginFormValue: LoginFormValue) => {
      clearAuthErrors();
      setIsLoading(true);
      await login({
        email: loginFormValue.user,
        password: loginFormValue.password,
        onErrorCallback: () => {
          setIsLoading(false);
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Don't include login/clearAuthErrors - they're stable from AuthProvider
  );

  return (
    <FlexContainer direction="column">
      <LoginForm
        errorMessages={authErrorMessages}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </FlexContainer>
  );
};
