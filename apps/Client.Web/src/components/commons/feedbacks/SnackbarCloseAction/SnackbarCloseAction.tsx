import { FC } from 'react';

import { IconButton } from '@mui/material';

import { useSnackbar } from 'notistack';

import CloseIcon from '@mui/icons-material/Close';
import { SnackbarCloseActionProps } from './SnackbarCloseAction.model';

/**
 * Function that returns an IconButton component. When clicked, this component closes the Snackbar notification corresponding to the provided key.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.snackbarKey - The key of the Snackbar notification to close.
 * @returns {JSX.Element} An IconButton component that, when clicked, closes the Snackbar notification with the given key.
 * @example
 * <SnackbarCloseAction snackbarKey="mySnackbarKey" />
 */
export const SnackbarCloseAction: FC<SnackbarCloseActionProps> = ({
  snackbarKey,
}) => {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton
      id="is-clickable"
      color="inherit"
      onClick={() => closeSnackbar(snackbarKey)}
    >
      <CloseIcon />
    </IconButton>
  );
};
