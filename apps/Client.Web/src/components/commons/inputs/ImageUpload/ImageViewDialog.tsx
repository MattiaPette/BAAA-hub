import { FC } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ImageViewDialogProps } from './ImageUpload.model';

/**
 * Dialog for viewing full-size images (avatar or banner)
 */
export const ImageViewDialog: FC<ImageViewDialogProps> = ({
  open,
  onClose,
  imageUrl,
  variant,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!imageUrl) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          bgcolor: 'background.default',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label={t`Close`}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '100vh' : 400,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={
            variant === 'banner'
              ? t`Full size banner image`
              : t`Full size profile picture`
          }
          sx={{
            maxWidth: '100%',
            maxHeight: isMobile ? '100%' : '80vh',
            objectFit: 'contain',
            borderRadius: variant === 'avatar' && !isMobile ? '50%' : 0,
          }}
        />
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
