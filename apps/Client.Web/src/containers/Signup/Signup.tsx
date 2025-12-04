import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FlexContainer } from '../../components/commons/layouts/FlexContainer/FlexContainer';
import { SignupForm } from '../../components/login/SignupForm/SignupForm';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { LoginFormValue } from '../../components/login/LoginForm/LoginForm.model';
import { AuthErrorCode } from '../../providers/AuthProvider/AuthProvider.model';
import { getErrorDescription } from '../../helpers/getErrorDescription/getErrorDescription';

/**
 * Signup component — renders the signup form and handles user registration.
 *
 * Provides signup functionality via the `signup()` method from AuthProvider.
 * When signup fails, displays error messages. When successful, redirects to login.
 *
 * @returns {JSX.Element} A React element containing the signup form.
 * @throws {Error} If `useAuth()` is called outside an `AuthProvider`.
 */
export const Signup: FC = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSignup = useCallback(
    (signupFormValue: LoginFormValue) => {
      setErrorMessages([]);
      setSuccessMessage('');
      setIsLoading(true);
      signup({
        email: signupFormValue.user,
        password: signupFormValue.password,
        onSuccessCallback: () => {
          setSuccessMessage(
            'Account created successfully! Redirecting to login...',
          );
          setIsLoading(false);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        },
        onErrorCallback: (errorCode?: AuthErrorCode) => {
          const newErrorMessages = errorCode
            ? [getErrorDescription({ errorCode })]
            : [];
          setErrorMessages(newErrorMessages);
          setIsLoading(false);
        },
      });
    },
    [signup, navigate],
  );

  return (
    <FlexContainer direction="column">
      <SignupForm
        errorMessages={errorMessages}
        successMessage={successMessage}
        isLoading={isLoading}
        onSignup={onSignup}
      />
    </FlexContainer>
  );
};
