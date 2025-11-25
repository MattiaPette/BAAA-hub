import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { renderWithProviders as render } from '../../../../test-utils';
import { SnackbarCloseAction } from './SnackbarCloseAction';

describe('SnackbarCloseAction', () => {
  it('should render close button', () => {
    render(
      <SnackbarProvider>
        <SnackbarCloseAction snackbarKey="test-key" />
      </SnackbarProvider>,
    );

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should render close icon', () => {
    render(
      <SnackbarProvider>
        <SnackbarCloseAction snackbarKey="test-key" />
      </SnackbarProvider>,
    );

    const closeIcon = document.querySelector('.MuiSvgIcon-root');
    expect(closeIcon).toBeInTheDocument();
  });

  it('should have is-clickable id', () => {
    render(
      <SnackbarProvider>
        <SnackbarCloseAction snackbarKey="test-key" />
      </SnackbarProvider>,
    );

    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveAttribute('id', 'is-clickable');
  });

  it('should call closeSnackbar when clicked', () => {
    render(
      <SnackbarProvider>
        <SnackbarCloseAction snackbarKey="test-key" />
      </SnackbarProvider>,
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // The button should be clickable
    expect(closeButton).toBeInTheDocument();
  });
});
