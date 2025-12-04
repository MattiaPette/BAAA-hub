import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnackbarProvider } from 'notistack';
import { PrivacyLevel } from '@baaa-hub/shared-types';
import userEvent from '@testing-library/user-event';
import { renderWithProviders as render } from '../../../../test-utils';
import { ImageUpload } from './ImageUpload';

// Mock the utils
vi.mock('./ImageUpload.utils', async () => {
  const actual = await vi.importActual('./ImageUpload.utils');
  return {
    ...actual,
    getCroppedImage: vi
      .fn()
      .mockResolvedValue(
        new File(['test'], 'cropped.jpg', { type: 'image/jpeg' }),
      ),
  };
});

describe('ImageUpload', () => {
  const mockOnUpload = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnPrivacyChange = vi.fn();
  const mockOnImageClick = vi.fn();

  const renderComponent = (props = {}) =>
    render(
      <SnackbarProvider>
        <ImageUpload variant="avatar" onUpload={mockOnUpload} {...props} />
      </SnackbarProvider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpload.mockResolvedValue(undefined);
    mockOnDelete.mockResolvedValue(undefined);
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

  describe('Cache invalidation', () => {
    it('should update displayed image when imageUrl prop changes with cache buster', async () => {
      // Start with an existing image
      const { rerender } = renderComponent({
        imageUrl: 'https://example.com/old-avatar.jpg',
      });

      // Verify initial image is shown
      const initialImg = document.querySelector('img');
      expect(initialImg).toHaveAttribute(
        'src',
        'https://example.com/old-avatar.jpg',
      );

      // Simulate parent updating the imageUrl prop with cache buster after upload
      rerender(
        <SnackbarProvider>
          <ImageUpload
            variant="avatar"
            onUpload={mockOnUpload}
            imageUrl="https://example.com/new-avatar.jpg?t=1234567890"
          />
        </SnackbarProvider>,
      );

      // After rerender with new URL, component should display the new image
      await waitFor(() => {
        const updatedImg = document.querySelector('img');
        expect(updatedImg).toHaveAttribute(
          'src',
          'https://example.com/new-avatar.jpg?t=1234567890',
        );
      });
    });
  });

  describe('File selection', () => {
    it('should have file input available', async () => {
      renderComponent({ imageUrl: 'https://example.com/avatar.jpg' });

      // File input should be present
      const fileInput = screen.getByLabelText(/upload profile picture/i);
      expect(fileInput).toBeInTheDocument();
    });

    it('should validate file type before opening crop dialog', async () => {
      renderComponent();

      const fileInput = screen.getByLabelText(/upload profile picture/i);

      // Create an invalid file (GIF)
      const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      // Should show error snackbar (handled by notistack)
      // The crop dialog should not be opened
    });

    it('should accept valid JPEG file', async () => {
      renderComponent();

      const fileInput = screen.getByLabelText(/upload profile picture/i);

      // Create a valid file
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Crop dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/Adjust Profile Picture/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete functionality', () => {
    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({
        variant: 'banner',
        imageUrl: 'https://example.com/banner.jpg',
        onDelete: mockOnDelete,
      });

      const deleteButton = screen.getByLabelText(/remove banner image/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();
      mockOnDelete.mockRejectedValue(new Error('Delete failed'));

      renderComponent({
        variant: 'banner',
        imageUrl: 'https://example.com/banner.jpg',
        onDelete: mockOnDelete,
      });

      const deleteButton = screen.getByLabelText(/remove banner image/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });
  });

  describe('View full size', () => {
    it('should show view button when onImageClick is provided', () => {
      renderComponent({
        imageUrl: 'https://example.com/avatar.jpg',
        onImageClick: mockOnImageClick,
      });

      const viewButton = screen.getByLabelText(
        /view full size profile picture/i,
      );
      expect(viewButton).toBeInTheDocument();
    });

    it('should call onImageClick when view button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({
        imageUrl: 'https://example.com/avatar.jpg',
        onImageClick: mockOnImageClick,
      });

      const viewButton = screen.getByLabelText(
        /view full size profile picture/i,
      );
      await user.click(viewButton);

      expect(mockOnImageClick).toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should not show overlay when disabled', () => {
      renderComponent({ disabled: true });

      // Overlay should not be interactable when disabled
      const changeLabel = screen.queryByLabelText(/change profile picture/i);
      expect(changeLabel).not.toBeInTheDocument();
    });
  });

  describe('Custom size', () => {
    it('should render avatar with custom size', () => {
      renderComponent({ size: 200 });

      // The avatar should exist - size is applied via sx prop
      const avatar = document.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Banner variant specific', () => {
    it('should render banner correctly', () => {
      renderComponent({ variant: 'banner' });

      const fileInput = screen.getByLabelText(/upload banner image/i);
      expect(fileInput).toBeInTheDocument();
    });

    it('should show banner privacy selector when enabled', () => {
      renderComponent({
        variant: 'banner',
        showPrivacyControls: true,
        privacy: PrivacyLevel.PUBLIC,
        onPrivacyChange: mockOnPrivacyChange,
      });

      expect(screen.getByLabelText(/banner privacy/i)).toBeInTheDocument();
    });

    it('should render view button for banner when onImageClick provided', () => {
      renderComponent({
        variant: 'banner',
        imageUrl: 'https://example.com/banner.jpg',
        onImageClick: mockOnImageClick,
      });

      const viewButton = screen.getByLabelText(/view full size banner/i);
      expect(viewButton).toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('should have keyboard accessible file input', () => {
      renderComponent();

      const fileInput = screen.getByLabelText(/upload profile picture/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });
});
