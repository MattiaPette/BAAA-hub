import { styled } from '@mui/material';
import { FC } from 'react';
import { LoadingOverlayProps } from './LoadingOverlay.model';
import { Loader } from '../Loader/Loader';

const Overlay = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  opacity: 0.6,
  zIndex: 1300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

/**
 * Component that displays a full-screen overlay with a centered loader.
 * The overlay is shown only when the `isLoading` property is set to `true`.
 * It uses the `Loader` component for the circular loading indicator.
 *
 * @param {Object} props - The properties of the component.
 * @param {boolean} props.isLoading - Indicates whether the overlay should be displayed.
 * @returns {JSX.Element | null} An overlay with the loader if `isLoading` is `true`, otherwise `null`.
 *
 * @example
 * // To display the overlay during loading
 * <LoadingOverlay isLoading={true} />
 *
 * @example
 * // To hide the overlay
 * <LoadingOverlay isLoading={false} />
 */
export const LoadingOverlay: FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Overlay>
      <Loader />
    </Overlay>
  );
};
