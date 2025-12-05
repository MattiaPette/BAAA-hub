import { FC } from 'react';

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
import { IFormInput, LoginFormProps } from '../LoginForm/LoginForm.model';

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
 * This is a React functional component that manages the signup form.
 * It uses the useForm hook to handle form state and input validation.
 * It also uses the useTheme hook to access the application's current theme.
 * If an error is detected during form submission, an error message is displayed.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string[]} props.errorMessages - Array of error messages to display.
 * @param {string} props.successMessage - Success message to display.
 * @param {Function} props.onSignup - The function to call when the form is submitted.
 * @param {boolean} props.isLoading - Whether a request is in progress.
 *
 * @returns {JSX.Element} The rendered signup form.
 *
 * @example
 * <SignupForm errorMessages={[]} onSignup={handleSignup} isLoading={false} />
 */
export const SignupForm: FC<
  Omit<LoginFormProps, 'isSignupMode' | 'onSubmit'> & {
    onSignup?: (value: Readonly<IFormInput>) => void;
  }
> = ({ errorMessages, successMessage, isLoading = false, onSignup }) => {
  const {
    register,
    handleSubmit: handleSubmitForm,
    formState: { errors },
  } = useForm<IFormInput>({ mode: 'onSubmit' });

  const theme = useTheme();

  /**
   * Handler function for submitting the signup form.
   *
   * @param {IFormInput} data - The object containing the signup form data. Must have 'user' and 'password' properties.
   * @example
   * handleSubmit({ user: 'email@example.com', password: 'password123' });
   */
  const handleSubmit: SubmitHandler<IFormInput> = data => {
    onSignup?.({ user: data.user, password: data.password });
  };

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
          <Trans>Sign Up</Trans>
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
              autoComplete="new-password"
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
                minLength: {
                  value: 8,
                  message: t({
                    message: 'Password must be at least 8 characters',
                  }),
                },
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
            <Trans>Create Account</Trans>
          </Button>
        </Box>
      </Card>
    </SignInContainer>
  );
};
