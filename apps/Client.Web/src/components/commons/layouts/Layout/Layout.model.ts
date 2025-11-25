import { ElementType, ReactNode } from 'react';

import { ContainerProps } from '@mui/material';

/**
 * Props for the Layout component.
 * Extends Material-UI's Container props with optional adornments.
 *
 * @property {ElementType} [component] - Optional custom element type to render as the container
 * @property {ReactNode} [startAdornment] - Optional content to render before the main content
 * @property {ReactNode} [endAdornment] - Optional content to render after the main content
 */
export type LayoutProps = ContainerProps &
  Readonly<{
    component?: ElementType;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
  }>;
