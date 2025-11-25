import { FC } from 'react';

import { CircularProgress, Fade, styled } from '@mui/material';

import { LoaderProps } from './Loader.model';

const StyledCircularProgress = styled(CircularProgress)<
  Required<Pick<LoaderProps, 'size'>>
>(({ size, theme }) => ({
  color: theme.palette.primary.main,
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: `-${size / 2}px`,
  marginLeft: `-${size / 2}px`,
}));

/**
 * Function that returns a circular loading component with a fade animation.
 * The loading component is centered within its parent container.
 * The size and thickness of the loading indicator can be customized.
 *
 * @param {Object} props - The properties of the component.
 * @param {number} [props.size=54] - The diameter of the loading component in pixels. Default is 54.
 * @param {number} [props.thickness=4.6] - The thickness of the loading circle. Default is 4.6.
 * @returns {JSX.Element} A circular loading component with a fade animation.
 *
 * @example
 * // To use the loader with default size and thickness
 * <Loader />
 *
 * @example
 * // To use the loader with custom size and thickness
 * <Loader size={100} thickness={5} />
 */
export const Loader: FC<LoaderProps> = ({
  size = 54,
  thickness = 4.6,
  ...props
}) => (
  <Fade in>
    <StyledCircularProgress size={size} thickness={thickness} {...props} />
  </Fade>
);
