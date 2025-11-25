import { FC, useCallback, useEffect } from 'react';

import {
  Box,
  Button,
  Divider,
  FormControl,
  Stack,
  styled,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import MuiCard from '@mui/material/Card';
import { SubmitHandler, useForm } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { IFormInput, LoginFormProps } from './LoginForm.model';

import logo from '../../../assets/vite.svg';

const Card = styled(MuiCard)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  opacity: 0.8,
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
 * This is a React functional component that manages the login form.
 * It uses the useForm hook to handle form state and input validation.
 * It also uses the useTheme hook to access the application's current theme.
 * If an error is detected during form submission, an error message is displayed.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - A flag indicating if there is an error in the login form.
 * @param {Function} props.onSubmit - The function to call when the form is submitted.
 * @param {Function} props.onLoginWithRedirect - The function to call for redirect-based login.
 *
 * @returns {JSX.Element} The rendered login form.
 *
 * @example
 * <LoginForm error={false} onSubmit={handleLogin} onLoginWithRedirect={handleRedirectLogin} />
 */
export const LoginForm: FC<LoginFormProps> = ({
  errorMessages,
  onSubmit,
  onLoginWithRedirect,
}) => {
  const {
    register,
    handleSubmit: handleSubmitForm,
    setError,
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
    onSubmit?.({ user: data.user, password: data.password });

    if (errorMessages && errorMessages.length > 0) {
      setLoginError();
    }
  };

  useEffect(() => {
    if (errorMessages && errorMessages.length > 0) {
      setLoginError();
    }
  }, [setLoginError, errorMessages]);

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined" sx={{ borderColor: theme.palette.grey[600] }}>
        <img
          src={logo}
          width={200}
          style={{ placeSelf: 'center', marginBottom: '2rem' }}
          alt="Logo"
        />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          <Trans>Login</Trans>
        </Typography>
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
              label={t({ message: 'Username' })}
              placeholder={t({ message: 'Username' })}
              autoComplete="user"
              autoFocus
              fullWidth
              variant="outlined"
              error={!!errors?.user}
              helperText={errors?.user?.message ?? errors?.user?.types?.error}
              {...register('user', {
                maxLength: {
                  value: 40,
                  message: t({ message: 'Too many characters' }),
                },
                required: {
                  value: true,
                  message: t({ message: 'Username is required' }),
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
              autoComplete="current-password"
              fullWidth
              variant="outlined"
              error={!!errors?.password}
              helperText={
                errors?.password?.message ?? errors?.password?.types?.error
              }
              {...register('password', {
                required: {
                  value: true,
                  message: t({ message: 'Password is required' }),
                },
              })}
            />
          </FormControl>
          <Typography
            component="div"
            sx={{
              font: { fontSize: '12px' },
              marginTop: '4px',
              marginBottom: '4px',
              color: theme.palette.error.main,
            }}
          >
            {errorMessages?.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </Typography>
          <Button type="submit" fullWidth variant="contained">
            <Trans>Login</Trans>
          </Button>
          {onLoginWithRedirect && (
            <>
              <Divider>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <Trans>or</Trans>
                </Typography>
              </Divider>
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Trans>Having trouble signing in?</Trans>{' '}
                <Button
                  type="button"
                  onClick={onLoginWithRedirect}
                  variant="text"
                  sx={{
                    padding: 0,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontWeight: 'inherit',
                    fontSize: 'inherit',
                    verticalAlign: 'baseline',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <Trans>Try alternative login</Trans>
                </Button>
              </Typography>
            </>
          )}
        </Box>
      </Card>
    </SignInContainer>
  );
};
