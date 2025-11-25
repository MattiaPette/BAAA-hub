import { FC } from 'react';

import { Dialog, DialogTitle, DialogContent } from '@mui/material';

import { FormDialogProps } from './FormDialog.model';

export const FormDialog: FC<FormDialogProps> = ({
  children,

  open,

  title,
}) => (
  <Dialog
    open={open}
    slotProps={{
      paper: {
        style: { minWidth: '650px', minHeight: '250px', padding: 8 },
      },
    }}
  >
    <DialogTitle variant="h6">{title}</DialogTitle>

    <DialogContent>{children}</DialogContent>
  </Dialog>
);
