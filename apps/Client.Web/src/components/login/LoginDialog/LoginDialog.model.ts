/**
 * Props for the LoginDialog component.
 */
export type LoginDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Optional callback to switch to signup dialog */
  onSwitchToSignup?: () => void;
};
