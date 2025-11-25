import { ReactElement } from 'react';

/**
 * Props for the Tooltip component.
 * A wrapper around Material-UI's Tooltip with simplified props.
 *
 * @property {string} title - Text to display in the tooltip
 * @property {ReactElement} children - The element that triggers the tooltip on hover
 */
export type TooltipProps = {
  title: string;
  children: ReactElement<unknown>;
};
