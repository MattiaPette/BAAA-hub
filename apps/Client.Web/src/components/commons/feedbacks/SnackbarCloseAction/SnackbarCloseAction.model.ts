import { SnackbarKey } from 'notistack';

/**
 * Props for the SnackbarCloseAction component.
 * Provides a close button for snackbar notifications.
 *
 * @property {SnackbarKey} [snackbarKey] - Optional identifier for the snackbar to close
 */
export type SnackbarCloseActionProps = Readonly<{
  snackbarKey?: SnackbarKey;
}>;
