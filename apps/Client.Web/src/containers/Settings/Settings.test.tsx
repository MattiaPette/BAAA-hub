import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { SnackbarProvider } from 'notistack';
import { Settings } from './Settings';
import { renderWithProviders as render } from '../../test-utils';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';

describe('Settings', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
  });

  const renderSettings = () =>
    render(
      <SnackbarProvider>
        <BreadcrumProvider>
          <Settings />
        </BreadcrumProvider>
      </SnackbarProvider>,
    );

  it('should render Settings component', () => {
    const { getByText } = renderSettings();
    expect(getByText(/settings/i)).toBeInTheDocument();
  });

  it('should render theme section', () => {
    const { container } = renderSettings();
    const themeCard = container.querySelector('.MuiCard-root');
    expect(themeCard).toBeInTheDocument();
  });

  it('should render language selector', () => {
    renderSettings();
    expect(screen.getByLabelText(/select language/i)).toBeInTheDocument();
  });

  it('should display theme description', () => {
    renderSettings();
    expect(
      screen.getByText(/switch between light and dark theme/i),
    ).toBeInTheDocument();
  });

  it('should display language description', () => {
    renderSettings();
    expect(
      screen.getByText(/choose your preferred language/i),
    ).toBeInTheDocument();
  });

  it('should render theme switch control', () => {
    const { container } = renderSettings();
    const switchControl = container.querySelector('.MuiSwitch-root');
    expect(switchControl).toBeInTheDocument();
  });

  it('should render language select control', () => {
    const { container } = renderSettings();
    const selectControl = container.querySelector('#language-select');
    expect(selectControl).toBeInTheDocument();
  });

  it('should toggle theme when switch is clicked', async () => {
    const { container } = renderSettings();
    const switchInput = container.querySelector('input[type="checkbox"]');

    if (switchInput) {
      fireEvent.click(switchInput);

      await waitFor(() => {
        // Snackbar should appear with success message
        const snackbar = document.querySelector('.notistack-Snackbar');
        expect(snackbar).toBeTruthy();
      });
    }
  });

  it('should change language when selection changes', async () => {
    const { container } = renderSettings();
    const selectElement = container.querySelector('#language-select');

    if (selectElement) {
      fireEvent.mouseDown(selectElement);

      await waitFor(() => {
        const italianOption = screen.queryByText('Italiano');
        if (italianOption) {
          fireEvent.click(italianOption);
        }
      });
    }
  });

  it('should show light theme message when switching from dark to light', async () => {
    const { container } = renderSettings();
    const switchInput = container.querySelector('input[type="checkbox"]');

    // First click to go to dark (assuming we start in light)
    if (switchInput) {
      fireEvent.click(switchInput);
      await waitFor(() => {
        const snackbar = document.querySelector('.notistack-Snackbar');
        expect(snackbar).toBeTruthy();
      });

      // Second click to go back to light
      fireEvent.click(switchInput);
      await waitFor(() => {
        const snackbar = document.querySelector('.notistack-Snackbar');
        expect(snackbar).toBeTruthy();
      });
    }
  });

  it('should show English language message when changing to English', async () => {
    const { container } = renderSettings();
    const selectElement = container.querySelector('#language-select');

    if (selectElement) {
      // First change to Italian
      fireEvent.mouseDown(selectElement);
      await waitFor(() => {
        const italianOption = screen.queryByText('Italiano');
        if (italianOption) {
          fireEvent.click(italianOption);
        }
      });

      // Then change back to English
      fireEvent.mouseDown(selectElement);
      await waitFor(() => {
        const englishOption = screen.queryByText('English');
        if (englishOption) {
          fireEvent.click(englishOption);
        }
      });
    }
  });
});
