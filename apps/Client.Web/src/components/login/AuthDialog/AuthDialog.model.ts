import { ReactNode } from 'react';

/**
 * Props for the AuthDialog component.
 * A specialized dialog for authentication flows (login/signup).
 */
export type AuthDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog content */
  children: ReactNode;
  /** Whether authentication is in progress */
  isLoading: boolean;
  /** Error messages to display */
  errorMessages?: string[];
  /** Callback to clear errors and reset dialog state */
  onDialogClose?: () => void;
};
