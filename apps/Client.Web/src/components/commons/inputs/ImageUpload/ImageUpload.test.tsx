import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnackbarProvider } from 'notistack';
import { PrivacyLevel } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../../../test-utils';
import { ImageUpload } from './ImageUpload';

describe('ImageUpload', () => {
  const mockOnUpload = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnPrivacyChange = vi.fn();

  const renderComponent = (props = {}) => {
    return render(
      <SnackbarProvider>
        <ImageUpload variant="avatar" onUpload={mockOnUpload} {...props} />
      </SnackbarProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Avatar variant', () => {
    it('should render avatar with fallback text when no image', () => {
      renderComponent({ fallbackText: 'JD' });

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render avatar with image when imageUrl is provided', () => {
      renderComponent({ imageUrl: 'https://example.com/avatar.jpg' });

      // Avatar should display the image
      const avatarImg = document.querySelector('img');
      expect(avatarImg).toHaveAttribute(
        'src',
        'https://example.com/avatar.jpg',
      );
    });

    it('should have file input for uploading', () => {
      renderComponent();

      const fileInput = screen.getByLabelText(/upload profile picture/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });

  describe('Banner variant', () => {
    it('should render banner without image', () => {
      renderComponent({ variant: 'banner' });

      // Should have file input
      const fileInput = screen.getByLabelText(/upload banner image/i);
      expect(fileInput).toBeInTheDocument();
    });

    it('should have delete button when image and onDelete are provided', () => {
      renderComponent({
        variant: 'banner',
        imageUrl: 'https://example.com/banner.jpg',
        onDelete: mockOnDelete,
      });

      // Banner should have delete button
      const deleteButton = screen.getByLabelText(/remove banner image/i);
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show loading indicator when isLoading is true', () => {
      renderComponent({ isLoading: true });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Privacy controls', () => {
    it('should show privacy selector when showPrivacyControls is true', () => {
      renderComponent({
        showPrivacyControls: true,
        privacy: PrivacyLevel.PUBLIC,
        onPrivacyChange: mockOnPrivacyChange,
      });

      expect(screen.getByLabelText(/photo privacy/i)).toBeInTheDocument();
    });

    it('should not show privacy selector when showPrivacyControls is false', () => {
      renderComponent({
        showPrivacyControls: false,
        privacy: PrivacyLevel.PUBLIC,
        onPrivacyChange: mockOnPrivacyChange,
      });

      expect(screen.queryByLabelText(/photo privacy/i)).not.toBeInTheDocument();
    });
  });
});
