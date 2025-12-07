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
import { LoginDialogProps } from './LoginDialog.model';

/**
 * LoginDialog — A dialog component for user login.
 *
 * This component renders a login form inside a dialog, providing a mobile-friendly
 * experience for user authentication without redirecting to a separate page.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Callback to close the dialog.
 * @param {Function} props.onSwitchToSignup - Optional callback to switch to signup dialog.
 *
 * @returns {JSX.Element} The login dialog component.
 */
export const LoginDialog: FC<LoginDialogProps> = ({
  open,
  onClose,
  onSwitchToSignup,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, authErrorMessages, clearAuthErrors } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit: handleSubmitForm,
    formState: { errors },
    reset,
  } = useForm<IFormInput>({ mode: 'onSubmit' });

  const handleClose = useCallback(() => {
    if (isLoading) {
      return; // Prevent closing during authentication
    }
    clearAuthErrors();
    reset();
    setIsLoading(false);
    onClose();
  }, [isLoading, clearAuthErrors, reset, onClose]);

  const onSubmit = useCallback(
    async (loginFormValue: LoginFormValue) => {
      clearAuthErrors();
      setIsLoading(true);
      await login({
        email: loginFormValue.user,
        password: loginFormValue.password,
        onSuccessCallback: () => {
          setIsLoading(false);
          enqueueSnackbar(t`Login successful! Welcome back.`, {
            variant: 'success',
          });
          handleClose();
        },
        onErrorCallback: () => {
          setIsLoading(false);
        },
      });
    },
    [clearAuthErrors, login, enqueueSnackbar, handleClose],
  );

  const handleSubmit: SubmitHandler<IFormInput> = data => {
    onSubmit({ user: data.user, password: data.password });
  };

  const handleSwitchToSignup = useCallback(() => {
    handleClose();
    onSwitchToSignup?.();
  }, [handleClose, onSwitchToSignup]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          <Trans>Login</Trans>
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
              id="login-user"
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
              id="login-password"
              type="password"
              label={t({ message: 'Password' })}
              placeholder="••••••"
              autoComplete="current-password"
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
              })}
            />
          </FormControl>
          {authErrorMessages && authErrorMessages.length > 0 && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {authErrorMessages.map((msg, index) => (
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
            <Trans>Login</Trans>
          </Button>
        </Box>

        {onSwitchToSignup && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" component="span">
              <Trans>Don&apos;t have an account?</Trans>{' '}
            </Typography>
            <Typography
              component="button"
              variant="body2"
              onClick={handleSwitchToSignup}
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
              <Trans>Sign Up</Trans>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
