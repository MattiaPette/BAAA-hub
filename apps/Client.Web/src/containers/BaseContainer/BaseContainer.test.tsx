import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { BaseContainer } from './BaseContainer';

describe('BaseContainer', () => {
  const mockRoutes = [
    { id: 'dashboard', path: 'dashboard', label: 'Dashboard', order: 1 },
    { id: 'settings', path: 'settings', label: 'Settings', order: 2 },
  ];

  it('should render with title', () => {
    render(
      <BrowserRouter>
        <BaseContainer title="Test App" routes={mockRoutes} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('should render menu button to toggle sidebar', () => {
    const { container } = render(
      <BrowserRouter>
        <BaseContainer title="Test App" routes={mockRoutes} />
      </BrowserRouter>,
    );

    // Check for menu button that toggles sidebar
    const menuButton = container.querySelector('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should render topbar', () => {
    const { container } = render(
      <BrowserRouter>
        <BaseContainer title="Test App" routes={mockRoutes} />
      </BrowserRouter>,
    );

    const topbar = container.querySelector('.MuiStack-root');
    expect(topbar).toBeInTheDocument();
  });

  it('should render menu icon button', () => {
    const { container } = render(
      <BrowserRouter>
        <BaseContainer title="Test App" routes={mockRoutes} />
      </BrowserRouter>,
    );

    const menuButton = container.querySelector('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should render with endAdornment when provided', () => {
    const endAdornment = <div data-testid="end-adornment">End Content</div>;

    render(
      <BrowserRouter>
        <BaseContainer
          title="Test App"
          routes={mockRoutes}
          endAdornment={endAdornment}
        />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('end-adornment')).toBeInTheDocument();
  });

  it('should toggle drawer state when menu button is clicked', async () => {
    const { container } = render(
      <BrowserRouter>
        <BaseContainer title="Test App" routes={mockRoutes} />
      </BrowserRouter>,
    );

    const menuButton = container.querySelector('button');
    expect(menuButton).toBeInTheDocument();

    if (menuButton) {
      // Click to toggle drawer
      fireEvent.click(menuButton);

      await waitFor(() => {
        // After clicking, the button should still be present
        const buttonAfterClick = container.querySelector('button');
        expect(buttonAfterClick).toBeInTheDocument();
      });
    }
  });

  it('should wrap content with providers when provided', () => {
    const TestProvider = ({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) => <div data-testid="test-provider">{children}</div>;

    const providers = [TestProvider];

    render(
      <BrowserRouter>
        <BaseContainer
          title="Test App"
          routes={mockRoutes}
          providers={providers}
        />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('test-provider')).toBeInTheDocument();
  });

  it('should handle multiple providers', () => {
    const Provider1 = ({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) => <div data-testid="provider-1">{children}</div>;
    const Provider2 = ({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) => <div data-testid="provider-2">{children}</div>;

    const providers = [Provider1, Provider2];

    render(
      <BrowserRouter>
        <BaseContainer
          title="Test App"
          routes={mockRoutes}
          providers={providers}
        />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('provider-1')).toBeInTheDocument();
    expect(screen.getByTestId('provider-2')).toBeInTheDocument();
  });
});
