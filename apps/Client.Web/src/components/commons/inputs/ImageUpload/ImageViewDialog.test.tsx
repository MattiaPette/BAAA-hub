import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { ImageViewDialog } from './ImageViewDialog';

describe('ImageViewDialog', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Avatar variant', () => {
    it('should render dialog when open with imageUrl', () => {
      render(
        <ImageViewDialog
          open
          onClose={mockOnClose}
          imageUrl="https://example.com/avatar.jpg"
          variant="avatar"
        />,
      );

      const image = screen.getByAltText(/full size profile picture/i);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <ImageViewDialog
          open
          onClose={mockOnClose}
          imageUrl="https://example.com/avatar.jpg"
          variant="avatar"
        />,
      );

      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Banner variant', () => {
    it('should render dialog with banner image', () => {
      render(
        <ImageViewDialog
          open
          onClose={mockOnClose}
          imageUrl="https://example.com/banner.jpg"
          variant="banner"
        />,
      );

      const image = screen.getByAltText(/full size banner image/i);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/banner.jpg');
    });
  });

  describe('Empty state', () => {
    it('should not render anything when imageUrl is not provided', () => {
      const { container } = render(
        <ImageViewDialog
          open
          onClose={mockOnClose}
          imageUrl={undefined}
          variant="avatar"
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when dialog is closed', () => {
      render(
        <ImageViewDialog
          open={false}
          onClose={mockOnClose}
          imageUrl="https://example.com/avatar.jpg"
          variant="avatar"
        />,
      );

      expect(
        screen.queryByAltText(/full size profile picture/i),
      ).not.toBeInTheDocument();
    });
  });
});
