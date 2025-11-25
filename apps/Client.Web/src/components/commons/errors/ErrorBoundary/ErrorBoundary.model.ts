import { ReactNode } from 'react';
import { ErrorBoundaryProps as ErrorBoundaryPropsLib } from 'react-error-boundary';

/**
 * Props for the ErrorBoundary component.
 * A wrapper around react-error-boundary with optional fallback and reset handler.
 *
 * @property {ReactNode} children - Components to be wrapped by the error boundary
 * @property {ComponentType} [FallbackComponent] - Optional custom fallback component to display when an error occurs
 * @property {function} [onReset] - Optional callback invoked when the error boundary is reset
 */
export type ErrorBoundaryProps = Partial<
  Pick<ErrorBoundaryPropsLib, 'FallbackComponent' | 'onReset'>
> &
  Readonly<{ children: ReactNode }>;
