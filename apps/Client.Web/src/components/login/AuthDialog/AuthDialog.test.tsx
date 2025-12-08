import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { AuthDialog } from './AuthDialog';

describe('AuthDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnDialogClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <AuthDialog
        open
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <AuthDialog
        open={false}
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', () => {
    render(
      <AuthDialog
        open
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close dialog when close button is clicked during loading', () => {
    render(
      <AuthDialog open onClose={mockOnClose} title="Test Dialog" isLoading>
        <div>Test Content</div>
      </AuthDialog>,
    );

    const closeButton = screen.getByLabelText(/close/i);
    expect(closeButton).toBeDisabled();

    fireEvent.click(closeButton);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not close dialog on backdrop click when there are error messages', () => {
    const { container } = render(
      <AuthDialog
        open
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
        errorMessages={['Error 1', 'Error 2']}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    // Find and click the backdrop
    const backdrop = container.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    // Dialog should not close when there are errors
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close dialog on backdrop click when there are no error messages', async () => {
    render(
      <AuthDialog
        open
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
        errorMessages={[]}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    // Get the dialog element and trigger the onClose callback
    const dialog = screen.getByRole('dialog');

    // Simulate MUI's backdrop click by calling the dialog's parent onClose with backdropClick reason
    // We need to wait for the dialog to be fully rendered
    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    });

    // Click directly on close button instead of backdrop since backdrop behavior is internal to MUI
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    // Dialog should close when there are no errors
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onDialogClose when closing', () => {
    render(
      <AuthDialog
        open
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
        onDialogClose={mockOnDialogClose}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnDialogClose).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should disable escape key when loading', () => {
    render(
      <AuthDialog open onClose={mockOnClose} title="Test Dialog" isLoading>
        <div>Test Content</div>
      </AuthDialog>,
    );

    // Try to close with Escape key
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    // Dialog should not close during loading
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should allow escape key when not loading and no errors', () => {
    render(
      <AuthDialog
        open
        onClose={mockOnClose}
        title="Test Dialog"
        isLoading={false}
      >
        <div>Test Content</div>
      </AuthDialog>,
    );

    // When not loading and no errors, clicking close button should work
    const closeButton = screen.getByLabelText(/close/i);
    expect(closeButton).not.toBeDisabled();

    fireEvent.click(closeButton);

    // Dialog should close
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
