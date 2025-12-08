import { FC, useCallback, useState } from 'react';
import {
  Box,
  FormControl,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useSnackbar } from 'notistack';

import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { IFormInput, LoginFormValue } from '../LoginForm/LoginForm.model';
import { AuthErrorCode } from '../../../providers/AuthProvider/AuthProvider.model';
import { getErrorDescription } from '../../../helpers/getErrorDescription/getErrorDescription';
import { SignupDialogProps } from './SignupDialog.model';
import { AuthDialog } from '../AuthDialog';

/**
 * SignupDialog — A dialog component for user registration.
 *
 * This component renders a signup form inside a dialog, providing a mobile-friendly
 * experience for user registration without redirecting to a separate page.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Callback to close the dialog.
 * @param {Function} props.onSwitchToLogin - Optional callback to switch to login dialog.
 *
 * @returns {JSX.Element} The signup dialog component.
 */
export const SignupDialog: FC<SignupDialogProps> = ({
  open,
  onClose,
  onSwitchToLogin,
}) => {
  const { signup } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const {
    register,
    handleSubmit: handleSubmitForm,
    formState: { errors },
    reset,
  } = useForm<IFormInput>({ mode: 'onSubmit' });

  /**
   * Cleanup function called when dialog is closed.
   * Resets form state and clears any errors.
   */
  const handleDialogClose = useCallback(() => {
    setErrorMessages([]);
    reset();
    setIsLoading(false);
  }, [reset]);

  const onSubmit = useCallback(
    (signupFormValue: LoginFormValue) => {
      setErrorMessages([]);
      setIsLoading(true);
      signup({
        email: signupFormValue.user,
        password: signupFormValue.password,
        onSuccessCallback: () => {
          setIsLoading(false);
          enqueueSnackbar(
            t`Account created successfully! You can now log in.`,
            { variant: 'success' },
          );
          // Clean up and close dialog on success
          handleDialogClose();
          onClose();
          onSwitchToLogin?.();
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
    [signup, enqueueSnackbar, handleDialogClose, onClose, onSwitchToLogin],
  );

  const handleSubmit: SubmitHandler<IFormInput> = data => {
    onSubmit({ user: data.user, password: data.password });
  };

  const handleSwitchToLogin = useCallback(() => {
    handleDialogClose();
    onClose();
    onSwitchToLogin?.();
  }, [handleDialogClose, onClose, onSwitchToLogin]);

  return (
    <AuthDialog
      open={open}
      onClose={onClose}
      title={t`Sign Up`}
      isLoading={isLoading}
      errorMessages={errorMessages}
      onDialogClose={handleDialogClose}
    >
      <Box
        component="form"
        onSubmit={handleSubmitForm(handleSubmit)}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 2,
          mt: 1,
        }}
      >
        <FormControl fullWidth>
          <TextField
            id="signup-user"
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
        <FormControl fullWidth>
          <TextField
            id="signup-password"
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
          sx={{ mt: 1, py: 1.25 }}
        >
          <Trans>Create Account</Trans>
        </Button>
      </Box>

      {onSwitchToLogin && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary" component="span">
            <Trans>Already have an account?</Trans>{' '}
          </Typography>
          <Typography
            component="button"
            variant="body2"
            onClick={handleSwitchToLogin}
            sx={{
              fontWeight: 600,
              textDecoration: 'none',
              color: 'primary.main',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <Trans>Login</Trans>
          </Typography>
        </Box>
      )}
    </AuthDialog>
  );
};
