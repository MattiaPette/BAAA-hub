import { ReactNode } from 'react';

/**
 * Props for the Card component.
 * A simple wrapper component for card-based layouts.
 *
 * @property {ReactNode} [children] - Optional content to display within the card
 */
export type CardProps = Readonly<{
  children?: ReactNode;
}>;
