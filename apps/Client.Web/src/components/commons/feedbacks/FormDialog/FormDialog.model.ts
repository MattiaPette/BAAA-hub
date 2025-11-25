import { ReactNode } from 'react';

/**
 * Props for the FormDialog component.
 * A simplified dialog specifically designed for forms.
 *
 * @property {ReactNode} children - Form content to display within the dialog
 * @property {boolean} open - Whether the dialog is currently open/visible
 * @property {string} title - Title text displayed at the top of the dialog
 */
export type FormDialogProps = {
  children: ReactNode;

  open: boolean;

  title: string;
};
