import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User, UserRole, PrivacyLevel } from '@baaa-hub/shared-types';
import { BrowserRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { BaseContainer } from './BaseContainer';
import * as useCurrentUserModule from '../../hooks/useCurrentUser';

// Mock the useCurrentUser hook
vi.mock('../../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

describe('BaseContainer', () => {
  const mockUser: User = {
    id: '1',
    name: 'John',
    surname: 'Doe',
    nickname: 'johndoe',
    email: 'john.doe@example.com',
    dateOfBirth: '1990-01-01',
    sportTypes: [],
    authId: 'auth0|123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isBlocked: false,
    isEmailVerified: true,
    roles: [UserRole.USER],
    privacySettings: {
      email: PrivacyLevel.PUBLIC,
      dateOfBirth: PrivacyLevel.PUBLIC,
      sportTypes: PrivacyLevel.PUBLIC,
      socialLinks: PrivacyLevel.PUBLIC,
    },
  };

  const mockRoutes = [
    { id: 'dashboard', path: 'dashboard', label: 'Dashboard', order: 1 },
    { id: 'settings', path: 'settings', label: 'Settings', order: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.spyOn(useCurrentUserModule, 'useCurrentUser').mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as never);
  });

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

  it('should render content header', () => {
    render(
      <BrowserRouter>
        <BaseContainer title="Test App" routes={mockRoutes} />
      </BrowserRouter>,
    );

    // Content header should show the title
    const header = screen.getByRole('heading', { name: 'Test App' });
    expect(header).toBeInTheDocument();
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
