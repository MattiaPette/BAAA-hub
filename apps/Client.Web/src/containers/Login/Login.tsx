import { FC, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';

import { LoginForm } from '../../components/login/LoginForm/LoginForm';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { LoginFormValue } from '../../components/login/LoginForm/LoginForm.model';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { getErrorDescription } from '../../helpers/getErrorDescription/getErrorDescription';

/**
 * Login component — renders the login/signup form and handles user authentication.
 *
 * Reads the current location for returned error codes and provides an
 * `onSubmit` handler that delegates credential verification to the
 * `AuthProvider`'s `login()` method. When `login()` reports an error the
 * component translates the error code to a human-friendly message and
 * displays it in the form.
 *
 * Also provides signup functionality via the `signup()` method from AuthProvider,
 * and an alternative `loginWithRedirect` handler for browsers with strict
 * cookie policies (e.g., Safari) where the cross-origin authentication may
 * fail with server errors.
 *
 * @param {void} props - This component does not accept props; it uses
 *   `useLocation` and `useAuth` internally.
 * @returns {JSX.Element} A React element containing the login/signup form.
 * @throws {Error} If `useAuth()` is called outside an `AuthProvider` the
 *   hook may throw; ensure the component is rendered inside an
 *   `AuthProvider`.
 *
 * Notes:
 * - The component is synchronous (not `async`) but calls asynchronous
 *   logic inside `useAuth().login()` and `useAuth().signup()` when submitting credentials.
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
  const { login, signup, loginWithRedirect } = useAuth();

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSignupMode, setIsSignupMode] = useState(false);

  const onSubmit = useCallback(
    (loginFormValue: LoginFormValue) => {
      setSuccessMessage('');
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
    },
    [login],
  );

  const onSignup = useCallback(
    (loginFormValue: LoginFormValue) => {
      setErrorMessages([]);
      setSuccessMessage('');
      signup({
        email: loginFormValue.user,
        password: loginFormValue.password,
        onSuccessCallback: () => {
          setSuccessMessage(
            'Account created successfully! Please log in with your credentials.',
          );
          setIsSignupMode(false);
        },
        onErrorCallback: (errorCode?: AuthErrorCode) => {
          const newErrorMessages = errorCode
            ? [getErrorDescription({ errorCode })]
            : [];
          setErrorMessages(newErrorMessages);
        },
      });
    },
    [signup],
  );

  const onToggleMode = useCallback(() => {
    setIsSignupMode(prev => !prev);
    setErrorMessages([]);
    setSuccessMessage('');
  }, []);

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
      <LoginForm
        errorMessages={errorMessages}
        successMessage={successMessage}
        isSignupMode={isSignupMode}
        onSubmit={onSubmit}
        onSignup={onSignup}
        onLoginWithRedirect={loginWithRedirect}
        onToggleMode={onToggleMode}
      />
    </FlexContainer>
  );
};
