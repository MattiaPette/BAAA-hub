import { forwardRef, useMemo } from 'react';

import { unstable_styleFunctionSx as unstableStyleFunctionSx } from '@mui/system';

import { styled, Interpolation } from '@mui/material';

import { FlexContainerProps } from './FlexContainer.model';

/**
 * Creates a component with custom styles using MUI's `styled` function and the `unstableStyleFunctionSx`.
 * This function is used to create a FlexContainer component with custom styles.
 *
 * @param {NonNullable<FlexContainerProps['component']>} component - The component to be styled. Cannot be null.
 * @returns {React.ComponentType<FlexContainerProps>} A styled React component.
 *
 * @example
 * const MyStyledComponent = createComponent(MyComponent);
 */
const createComponent = (
  component: NonNullable<FlexContainerProps['component']>,
) =>
  styled(component)<FlexContainerProps>(
    unstableStyleFunctionSx as Interpolation<FlexContainerProps>,
  );

export const FlexContainer = forwardRef<HTMLDivElement, FlexContainerProps>(
  ({ component = 'div', direction = 'column', sx, children }, ref) => {
    const Component = useMemo(() => createComponent(component), [component]);

    return (
      <Component
        ref={ref}
        direction={direction}
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: direction,
          ...sx,
        }}
      >
        {children}
      </Component>
    );
  },
);
