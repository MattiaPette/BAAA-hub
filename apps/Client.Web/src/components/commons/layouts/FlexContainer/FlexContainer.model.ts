import { CSSProperties, ReactNode } from 'react';

import { SxProps } from '@mui/system';

/**
 * Props for the FlexContainer component.
 * A flexible container component with customizable flex direction and styling.
 *
 * @property {CSSProperties['flexDirection']} [direction] - CSS flex-direction value (row, column, etc.)
 * @property {keyof Pick<HTMLElementTagNameMap, 'main' | 'div'>} [component] - HTML element to render as ('main' or 'div')
 * @property {ReactNode} [children] - Optional content to display within the container
 * @property {SxProps} [sx] - Material-UI sx prop for additional styling
 */
export type FlexContainerProps = Readonly<{
  direction?: CSSProperties['flexDirection'];
  component?: keyof Pick<HTMLElementTagNameMap, 'main' | 'div'>;
  children?: ReactNode;
  sx?: SxProps;
}>;
