import { Dispatch, DispatchWithoutAction, ReactNode } from 'react';

/**
 * Props for the utility Dialog component.
 * Defines the structure for a reusable dialog with confirm/cancel actions.
 *
 * @property {ReactNode} children - Content to display within the dialog body
 * @property {boolean} open - Whether the dialog is currently open/visible
 * @property {DispatchWithoutAction} close - Function to close the dialog without any action
 * @property {Dispatch<unknown>} submit - Function to submit/confirm the dialog action
 * @property {string} title - Title text displayed at the top of the dialog
 * @property {string} confirmButtonText - Text label for the confirm/submit button
 * @property {ReactNode} confirmButtonIcon - Icon to display on the confirm button
 * @property {string} closeButtonText - Text label for the cancel/close button
 */
export type UtiliyDialogProps = {
  children: ReactNode;

  open: boolean;
  close: DispatchWithoutAction;
  submit: Dispatch<unknown>;

  title: string;
  confirmButtonText: string;
  confirmButtonIcon: ReactNode;
  closeButtonText: string;
};
