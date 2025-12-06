/**
 * Props for the SignupDialog component.
 */
export type SignupDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Optional callback to switch to login dialog */
  onSwitchToLogin?: () => void;
};
