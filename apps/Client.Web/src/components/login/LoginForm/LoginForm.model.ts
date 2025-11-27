import { Dispatch, DispatchWithoutAction } from 'react';

export interface IFormInput {
  user: string;
  password: string;
}

export type LoginFormValue = Readonly<IFormInput>;

export type LoginFormProps = Readonly<{
  errorMessages?: string[];
  successMessage?: string;
  isSignupMode?: boolean;

  onSubmit?: Dispatch<LoginFormValue>;
  onSignup?: Dispatch<LoginFormValue>;
  onLoginWithRedirect?: DispatchWithoutAction;
  onToggleMode?: DispatchWithoutAction;
}>;
