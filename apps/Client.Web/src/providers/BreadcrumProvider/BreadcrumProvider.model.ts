import { Dispatch, ReactNode, SetStateAction } from 'react';

/**
 * Props for the BreadcrumProvider component.
 *
 * @property {ReactNode} children - React components to be wrapped by the breadcrumb provider
 */
export type BreadcrumProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Value provided by the breadcrumb context.
 * Contains the current page title and a method to update it.
 *
 * @property {string} title - The current page/breadcrumb title
 * @property {Dispatch<SetStateAction<string>>} setTitle - Function to update the page title
 */
export type BreadcrumContextValue = Readonly<{
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
}>;
