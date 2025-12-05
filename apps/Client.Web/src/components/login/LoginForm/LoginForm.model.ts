import { Dispatch } from 'react';

export interface IFormInput {
  user: string;
  password: string;
}

export type LoginFormValue = Readonly<IFormInput>;

export type LoginFormProps = Readonly<{
  errorMessages?: string[];
  successMessage?: string;
  isSignupMode?: boolean;
  isLoading?: boolean;

  onSubmit?: Dispatch<LoginFormValue>;
  onSignup?: Dispatch<LoginFormValue>;
}>;
