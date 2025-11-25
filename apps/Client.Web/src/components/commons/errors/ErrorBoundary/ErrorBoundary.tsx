import { FC } from 'react';

import { ErrorBoundary as ErrorBoundaryLib } from 'react-error-boundary';

import { RootErrorFallback } from '../RootErrorFallback/RootErrorFallback';

import { ErrorBoundaryProps } from './ErrorBoundary.model';

/**
 * Functional component that implements an ErrorBoundary. This component catches JavaScript errors in its child components and, instead of breaking the entire app, displays a fallback UI and logs the error.
 *
 * @param {React.ComponentType} [FallbackComponent=RootErrorFallback] - The component to display in case of an error. Defaults to RootErrorFallback.
 * @param {React.ReactNode} children - The child components to be wrapped by the ErrorBoundary.
 * @param {...any} props - Any other props to be passed to the ErrorBoundary.
 * @returns {React.ReactElement} A React element representing the ErrorBoundary.
 *
 * @example
 * <ErrorBoundary FallbackComponent={MyFallbackComponent}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export const ErrorBoundary: FC<ErrorBoundaryProps> = ({
  FallbackComponent = RootErrorFallback,
  children,
  ...props
}) => (
  <ErrorBoundaryLib FallbackComponent={FallbackComponent} {...props}>
    {children}
  </ErrorBoundaryLib>
);
