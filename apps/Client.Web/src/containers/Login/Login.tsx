import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';

import { LoginForm } from '../../components/login/LoginForm/LoginForm';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { LoginFormValue } from '../../components/login/LoginForm/LoginForm.model';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { getErrorDescription } from '../../helpers/getErrorDescription/getErrorDescription';

/**
 * Login component — renders the login form and handles user authentication.
 *
 * Reads the current location for returned error codes and provides an
 * `onSubmit` handler that delegates credential verification to the
 * `AuthProvider`'s `login()` method. When `login()` reports an error the
 * component translates the error code to a human-friendly message and
 * displays it in the form.
 *
 * @param {void} props - This component does not accept props; it uses
 *   `useLocation` and `useAuth` internally.
 * @returns {JSX.Element} A React element containing the login form.
 * @throws {Error} If `useAuth()` is called outside an `AuthProvider` the
 *   hook may throw; ensure the component is rendered inside an
 *   `AuthProvider`.
 *
 * Notes:
 * - The component is synchronous (not `async`) but calls asynchronous
 *   logic inside `useAuth().login()` when submitting credentials.
 * - The `onSubmit` handler receives a `LoginFormValue` object with the
 *   shape `{ user: string; password: string }`.
 *
 * @example
 * // Route usage
 * // <Route path="/login" element={<Login />} />
 *
 * // Example `onSubmit` signature (internal):
 * // onSubmit({ user: 'alice', password: 'secret' });
 */

export const Login: FC = () => {
  const location = useLocation();
  const { login } = useAuth();

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const onSubmit = (loginFormValue: LoginFormValue) => {
    login({
      email: loginFormValue.user,
      password: loginFormValue.password,
      onErrorCallback: (errorCode?: AuthErrorCode) => {
        const newErrorMessages = errorCode
          ? [getErrorDescription({ errorCode })]
          : [];
        setErrorMessages(newErrorMessages);
      },
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorCode = params.get('error');
    if (errorCode) {
      const message = getErrorDescription({ errorCode });
      setErrorMessages([message]);
    }
  }, [location.search]);

  return (
    <FlexContainer direction="column">
      <LoginForm errorMessages={errorMessages} onSubmit={onSubmit} />
    </FlexContainer>
  );
};
