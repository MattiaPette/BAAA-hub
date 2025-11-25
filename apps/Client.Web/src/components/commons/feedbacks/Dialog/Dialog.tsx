import { FC } from 'react';

import {
  Button,
  Dialog as MuiDialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { UtiliyDialogProps } from './Dialog.model';

export const Dialog: FC<UtiliyDialogProps> = ({
  children,

  open,
  submit,
  close,

  title,
  confirmButtonText,
  confirmButtonIcon,
  closeButtonText,
}) => (
  <MuiDialog
    open={open}
    slotProps={{
      paper: {
        style: {
          minWidth: '650px',
          minHeight: '100px',
          padding: 8,
          position: 'relative',
        },
      },
    }}
  >
    <IconButton
      onClick={close}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: theme => theme.palette.grey[500],
        '&:hover': {
          backgroundColor: theme => theme.palette.action.hover,
        },
      }}
    >
      <CloseIcon />
    </IconButton>

    <DialogTitle variant="h6">{title.toLocaleUpperCase()}</DialogTitle>

    <DialogContent sx={{ paddingBottom: '0', alignContent: 'center' }}>
      {children}
    </DialogContent>

    <DialogActions sx={{ justifyContent: 'flex-start', margin: 2 }}>
      <Stack direction="row" spacing={4}>
        <Button
          onClick={close}
          startIcon={<CloseIcon />}
          sx={{
            '&:hover': {
              backgroundColor: theme => theme.palette.error.dark,
            },
          }}
        >
          {closeButtonText}
        </Button>

        <Button
          onClick={submit}
          startIcon={confirmButtonIcon}
          sx={{
            '& .MuiSvgIcon-root': {
              color: theme => theme.palette.accent.main,
            },
            '&:hover .MuiSvgIcon-root': {
              color: theme => theme.palette.text.primary,
            },
            '&:hover': {
              backgroundColor: theme => theme.palette.success.dark,
            },
          }}
        >
          {confirmButtonText}
        </Button>
      </Stack>
    </DialogActions>
  </MuiDialog>
);
