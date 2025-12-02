import { FC, useCallback, useEffect } from 'react';

import {
  Box,
  Button,
  FormControl,
  Stack,
  styled,
  TextField,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';

import MuiCard from '@mui/material/Card';
import { SubmitHandler, useForm } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { IFormInput, LoginFormProps } from './LoginForm.model';

import logo from '../../../assets/baaa.png';

const Card = styled(MuiCard)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
  },
  '& fieldset': {
    borderColor: theme.palette.text.primary,
    borderWidth: 1,
  },
}));

/**
 * This is a React functional component that manages the login/signup form.
 * It uses the useForm hook to handle form state and input validation.
 * It also uses the useTheme hook to access the application's current theme.
 * If an error is detected during form submission, an error message is displayed.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - A flag indicating if there is an error in the login form.
 * @param {Function} props.onSubmit - The function to call when the form is submitted for login.
 * @param {Function} props.onSignup - The function to call when the form is submitted for signup.
 * @param {boolean} props.isSignupMode - Whether the form is in signup mode.
 * @param {Function} props.onToggleMode - Function to toggle between login and signup modes.
 * @param {string} props.successMessage - Success message to display.
 * @param {boolean} props.isLoading - Whether a request is in progress.
 *
 * @returns {JSX.Element} The rendered login/signup form.
 *
 * @example
 * <LoginForm error={false} onSubmit={handleLogin} onSignup={handleSignup} />
 */
export const LoginForm: FC<LoginFormProps> = ({
  errorMessages,
  successMessage,
  isSignupMode = false,
  isLoading = false,
  onSubmit,
  onSignup,
  onToggleMode,
}) => {
  const {
    register,
    handleSubmit: handleSubmitForm,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IFormInput>({ mode: 'onSubmit' });

  const theme = useTheme();

  const setLoginError = useCallback(() => {
    setError('user', {
      types: { error: '' },
    });
    setError('password', {
      types: { error: '' },
    });
  }, [setError]);

  /**
   * Handler function for submitting the login form. This function resets any error messages,
   * calls the provided submit function (if it exists) with the form data, and if there is an error, sets the login error.
   *
   * @param {IFormInput} data - The object containing the login form data. Must have 'user' and 'password' properties.
   * @throws {Error} If there is an error during form submission, the login error is set.
   * @example
   * handleSubmit({ user: 'username', password: 'password' });
   */
  const handleSubmit: SubmitHandler<IFormInput> = data => {
    if (isSignupMode) {
      onSignup?.({ user: data.user, password: data.password });
    } else {
      onSubmit?.({ user: data.user, password: data.password });
    }

    if (errorMessages && errorMessages.length > 0) {
      setLoginError();
    }
  };

  useEffect(() => {
    if (errorMessages && errorMessages.length > 0) {
      setLoginError();
    }
  }, [setLoginError, errorMessages]);

  // Clear errors when toggling mode
  useEffect(() => {
    clearErrors();
  }, [isSignupMode, clearErrors]);

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card sx={{ borderColor: theme.palette.grey[600] }}>
        <img
          src={logo}
          width={350}
          style={{ placeSelf: 'center' }}
          alt="Logo"
        />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          {isSignupMode ? <Trans>Sign Up</Trans> : <Trans>Login</Trans>}
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 1 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmitForm(handleSubmit)}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <TextField
              id="user"
              label={t({ message: 'Email' })}
              placeholder={t({ message: 'Email' })}
              autoComplete="email"
              autoFocus
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!errors?.user}
              helperText={errors?.user?.message ?? errors?.user?.types?.error}
              {...register('user', {
                maxLength: {
                  value: 100,
                  message: t({ message: 'Too many characters' }),
                },
                required: {
                  value: true,
                  message: t({ message: 'Email is required' }),
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t({ message: 'Invalid email address' }),
                },
              })}
            />
          </FormControl>
          <FormControl>
            <TextField
              id="password"
              type="password"
              label={t({ message: 'Password' })}
              placeholder="••••••"
              autoComplete={isSignupMode ? 'new-password' : 'current-password'}
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!errors?.password}
              helperText={
                errors?.password?.message ?? errors?.password?.types?.error
              }
              {...register('password', {
                required: {
                  value: true,
                  message: t({ message: 'Password is required' }),
                },
                ...(isSignupMode && {
                  minLength: {
                    value: 8,
                    message: t({
                      message: 'Password must be at least 8 characters',
                    }),
                  },
                }),
              })}
            />
          </FormControl>
          {errorMessages && errorMessages.length > 0 && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorMessages.map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isSignupMode ? (
              <Trans>Create Account</Trans>
            ) : (
              <Trans>Login</Trans>
            )}
          </Button>

          {/* Toggle between login and signup */}
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: 'text.secondary' }}
          >
            {isSignupMode ? (
              <>
                <Trans>Already have an account?</Trans>{' '}
                <Button
                  variant="text"
                  onClick={onToggleMode}
                  disabled={isLoading}
                  sx={{
                    padding: 0,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontWeight: 'inherit',
                    fontSize: 'inherit',
                    verticalAlign: 'baseline',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <Trans>Login</Trans>
                </Button>
              </>
            ) : (
              <>
                <Trans>Don&apos;t have an account?</Trans>{' '}
                <Button
                  variant="text"
                  onClick={onToggleMode}
                  disabled={isLoading}
                  sx={{
                    padding: 0,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontWeight: 'inherit',
                    fontSize: 'inherit',
                    verticalAlign: 'baseline',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <Trans>Sign Up</Trans>
                </Button>
              </>
            )}
          </Typography>
        </Box>
      </Card>
    </SignInContainer>
  );
};
