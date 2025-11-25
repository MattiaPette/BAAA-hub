import { FC } from 'react';

import { Container } from '@mui/material';

import { LayoutProps } from './Layout.model';

/**
 * Functional component that generates a layout with a container and optional adornments at the start and end.
 *
 * @param {Object} props - The properties object for the component.
 * @param {ReactNode} props.startAdornment - React element to render at the start of the layout.
 * @param {ReactNode} props.endAdornment - React element to render at the end of the layout.
 * @param {string} [props.component='div'] - The type of component to use for the container. Defaults to 'div'.
 * @param {boolean} [props.maxWidth=false] - If true, the container will have maximum width.
 * @param {ReactNode} props.children - The child components to render inside the container.
 * @param {Object} props.sx - CSS styles to apply to the container.
 * @param {Object} props.props - Additional properties to pass to the container.
 *
 * @returns {ReactElement} A React element representing the generated layout.
 *
 * @example
 * <Layout startAdornment={<Header />} endAdornment={<Footer />} component="main" maxWidth>
 *   <Content />
 * </Layout>
 */
export const Layout: FC<LayoutProps> = ({
  startAdornment,
  endAdornment,
  component = 'div',
  maxWidth = false,
  children,
  sx,
  ...props
}) => (
  <>
    {startAdornment}

    <Container
      component={component}
      sx={{
        position: 'relative',
        flex: '1 1 auto',
        overflow: 'auto',
        ...sx,
      }}
      disableGutters
      maxWidth={maxWidth}
      {...props}
    >
      {children}
    </Container>

    {endAdornment}
  </>
);
