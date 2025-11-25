import { ReactNode } from 'react';

import { AppBarProps } from '@mui/material';

/**
 * Props for the TopBar component.
 * Extends Material-UI's AppBar props with additional customization options.
 *
 * @property {number} [height] - Optional custom height for the top bar
 * @property {ReactNode} [startAdornment] - Optional content to render at the start of the top bar
 * @property {ReactNode} [endAdornment] - Optional content to render at the end of the top bar
 */
export type TopBarProps = AppBarProps &
  Readonly<{
    height?: number;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
  }>;
