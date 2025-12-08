import { FC, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { t } from '@lingui/core/macro';

import { AuthDialogProps } from './AuthDialog.model';

/**
 * AuthDialog — A reusable dialog component for authentication flows.
 *
 * This component encapsulates the common dialog behavior for login and signup,
 * including:
 * - Preventing close during authentication (loading state)
 * - Preventing backdrop close when there are error messages
 * - Mobile-friendly full-screen layout
 * - Consistent styling and close button behavior
 *
 * @param {AuthDialogProps} props - The component props.
 * @returns {JSX.Element} The authentication dialog component.
 */
export const AuthDialog: FC<AuthDialogProps> = ({
  open,
  onClose,
  title,
  children,
  isLoading,
  errorMessages,
  onDialogClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Handle dialog close with validation.
   * Prevents closing when:
   * - Authentication is in progress (isLoading)
   * - There are error messages and close was triggered by backdrop click
   */
  const handleClose = useCallback(
    (_event?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
      // Prevent closing during authentication
      if (isLoading) {
        return;
      }

      // Prevent closing via backdrop click when there are error messages
      if (
        reason === 'backdropClick' &&
        errorMessages &&
        errorMessages.length > 0
      ) {
        return;
      }

      // Call custom cleanup if provided
      onDialogClose?.();

      // Call the parent's close handler
      onClose();
    },
    [isLoading, errorMessages, onDialogClose, onClose],
  );

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
          {title}
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

      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
