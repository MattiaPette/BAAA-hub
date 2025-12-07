import { FC, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  FormControl,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SubmitHandler, useForm } from 'react-hook-form';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useSnackbar } from 'notistack';

import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { IFormInput, LoginFormValue } from '../LoginForm/LoginForm.model';
import { AuthErrorCode } from '../../../providers/AuthProvider/AuthProvider.model';
import { getErrorDescription } from '../../../helpers/getErrorDescription/getErrorDescription';
import { SignupDialogProps } from './SignupDialog.model';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  const handleClose = useCallback(
    (_event?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
      if (isLoading) {
        return; // Prevent closing during authentication
      }
      // Prevent closing via backdrop click when there are error messages
      if (
        reason === 'backdropClick' &&
        errorMessages &&
        errorMessages.length > 0
      ) {
        return;
      }
      setErrorMessages([]);
      reset();
      setIsLoading(false);
      onClose();
    },
    [isLoading, errorMessages, reset, onClose],
  );

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
          handleClose();
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
    [signup, enqueueSnackbar, handleClose, onSwitchToLogin],
  );

  const handleSubmit: SubmitHandler<IFormInput> = data => {
    onSubmit({ user: data.user, password: data.password });
  };

  const handleSwitchToLogin = useCallback(() => {
    handleClose();
    onSwitchToLogin?.();
  }, [handleClose, onSwitchToLogin]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={isLoading}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography
          component="div"
          variant="h5"
          sx={{ fontWeight: 600, fontSize: 'clamp(1.5rem, 5vw, 1.75rem)' }}
        >
          <Trans>Sign Up</Trans>
        </Typography>
        <IconButton
          aria-label={t`Close`}
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
};
