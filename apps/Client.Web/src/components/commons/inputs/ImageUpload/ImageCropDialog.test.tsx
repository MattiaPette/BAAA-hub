import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { ImageCropDialog } from './ImageCropDialog';

describe('ImageCropDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const mockFile = new File(['test image content'], 'test.jpg', {
    type: 'image/jpeg',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDialog = (props = {}) =>
    render(
      <ImageCropDialog
        open
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        imageFile={mockFile}
        variant="avatar"
        {...props}
      />,
    );

  it('should render dialog when open', () => {
    renderDialog();

    expect(screen.getByText(/Adjust Profile Picture/i)).toBeInTheDocument();
  });

  it('should show banner title for banner variant', () => {
    renderDialog({ variant: 'banner' });

    expect(screen.getByText(/Adjust Banner Image/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderDialog({ open: false });

    expect(
      screen.queryByText(/Adjust Profile Picture/i),
    ).not.toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    renderDialog();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show zoom slider', () => {
    renderDialog();

    const slider = screen.getByRole('slider', { name: /zoom/i });
    expect(slider).toBeInTheDocument();
  });

  it('should have Apply button', async () => {
    renderDialog();

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).toBeInTheDocument();
  });

  it('should display instructions for users', () => {
    renderDialog();

    expect(screen.getByText(/Drag to reposition/i)).toBeInTheDocument();
  });

  it('should handle zoom change', async () => {
    renderDialog();

    const slider = screen.getByRole('slider', { name: /zoom/i });
    fireEvent.change(slider, { target: { value: 2 } });

    // Slider value should update
    expect(slider).toHaveAttribute('aria-valuenow', '2');
  });

  it('should handle null imageFile', () => {
    renderDialog({ imageFile: null });

    // Dialog should still render but without cropper image
    expect(screen.getByText(/Adjust Profile Picture/i)).toBeInTheDocument();
  });
});
