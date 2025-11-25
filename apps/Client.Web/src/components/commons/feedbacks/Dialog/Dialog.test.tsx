import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CheckIcon from '@mui/icons-material/Check';
import { renderWithProviders as render } from '../../../../test-utils';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  const defaultProps = {
    open: true,
    close: vi.fn(),
    submit: vi.fn(),
    title: 'Test Dialog',
    confirmButtonText: 'Confirm',
    confirmButtonIcon: <CheckIcon />,
    closeButtonText: 'Cancel',
    children: <div>Dialog content</div>,
  };

  it('should render dialog when open is true', () => {
    render(<Dialog {...defaultProps} />);

    expect(screen.getByText('TEST DIALOG')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    render(<Dialog {...defaultProps} open={false} />);

    expect(screen.queryByText('TEST DIALOG')).not.toBeInTheDocument();
  });

  it('should display confirm button with correct text', () => {
    render(<Dialog {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /confirm/i }),
    ).toBeInTheDocument();
  });

  it('should display close button with correct text', () => {
    render(<Dialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call close function when close button is clicked', () => {
    const mockClose = vi.fn();
    render(<Dialog {...defaultProps} close={mockClose} />);

    const closeButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(closeButton);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should call submit function when confirm button is clicked', () => {
    const mockSubmit = vi.fn();
    render(<Dialog {...defaultProps} submit={mockSubmit} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('should call close function when X icon is clicked', () => {
    const mockClose = vi.fn();
    render(<Dialog {...defaultProps} close={mockClose} />);

    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn =>
      btn.querySelector('svg[data-testid="CloseIcon"]'),
    );

    if (xButton) {
      fireEvent.click(xButton);
      expect(mockClose).toHaveBeenCalled();
    }
  });

  it('should render children content', () => {
    render(
      <Dialog {...defaultProps}>
        <div data-testid="custom-content">Custom content</div>
      </Dialog>,
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should display title in uppercase', () => {
    render(<Dialog {...defaultProps} title="my dialog title" />);

    expect(screen.getByText('MY DIALOG TITLE')).toBeInTheDocument();
  });
});
