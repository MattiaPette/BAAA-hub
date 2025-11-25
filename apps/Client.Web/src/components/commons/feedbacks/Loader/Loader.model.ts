import { CircularProgressProps } from '@mui/material';

/**
 * Props for the Loader component.
 * Extends Material-UI's CircularProgress props with a custom size property.
 *
 * @property {number} [size] - Custom size for the loader (optional override of CircularProgress size prop)
 */
export type LoaderProps = Omit<CircularProgressProps, 'size'> &
  Readonly<{
    size?: number;
  }>;
