import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { Sidebar } from './Sidebar';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Sidebar', () => {
  const mockRoutes = [
    {
      id: 'dashboard',
      path: 'dashboard',
      icon: DashboardIcon,
      label: 'Dashboard',
      linkTo: { to: '/dashboard' },
      order: 1,
      permission: 'user' as const,
    },
    {
      id: 'settings',
      path: 'settings',
      icon: SettingsIcon,
      label: 'Settings',
      linkTo: { to: '/settings' },
      order: 2,
      permission: 'user' as const,
    },
    {
      id: 'admin-only',
      path: 'admin-only',
      icon: DashboardIcon,
      label: 'Admin Only',
      linkTo: { to: '/admin' },
      order: 3,
      permission: 'admin' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should render Sidebar content when open', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // Check that sidebar content is rendered when open
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should keep content mounted for performance when using temporary drawer', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open={false}
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // With keepMounted: true, content is in the DOM even when closed
    // This is expected behavior for performance optimization
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should filter routes based on user permission', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userPermission="user"
        />
      </MemoryRouter>,
    );

    // User routes should be visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    // Admin route should not be visible
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('should show all routes for admin permission', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userPermission="admin"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  it('should navigate and close drawer on item click', () => {
    const mockOnClose = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={mockOnClose}
        />
      </MemoryRouter>,
    );

    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', undefined);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should sort routes by order property', () => {
    const unorderedRoutes = [
      {
        id: 'third',
        path: 'third',
        label: 'Third',
        linkTo: { to: '/third' },
        order: 3,
      },
      {
        id: 'first',
        path: 'first',
        label: 'First',
        linkTo: { to: '/first' },
        order: 1,
      },
      {
        id: 'second',
        path: 'second',
        label: 'Second',
        linkTo: { to: '/second' },
        order: 2,
      },
    ];

    render(
      <MemoryRouter>
        <Sidebar
          routes={unorderedRoutes}
          currentPath="first"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // Check that routes appear in order
    const labels = screen.getAllByRole('button').map(btn => btn.textContent);
    const routeLabels = labels.filter(
      label => label === 'First' || label === 'Second' || label === 'Third',
    );
    expect(routeLabels).toEqual(['First', 'Second', 'Third']);
  });

  it('should show routes with public permission to everyone', () => {
    const routesWithPublic = [
      {
        id: 'public-route',
        path: 'public',
        label: 'Public Page',
        linkTo: { to: '/public' },
        order: 1,
        permission: 'public' as const,
      },
      ...mockRoutes,
    ];

    render(
      <MemoryRouter>
        <Sidebar
          routes={routesWithPublic}
          currentPath="public"
          open
          onClose={vi.fn()}
          userPermission={undefined}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Public Page')).toBeInTheDocument();
  });

  it('should hide routes marked as showInSidebar false', () => {
    const routesWithHidden = [
      ...mockRoutes,
      {
        id: 'hidden',
        path: 'hidden',
        label: 'Hidden Route',
        linkTo: { to: '/hidden' },
        order: 4,
        showInSidebar: false,
      },
    ];

    render(
      <MemoryRouter>
        <Sidebar
          routes={routesWithHidden}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Hidden Route')).not.toBeInTheDocument();
  });

  it('should render divider routes correctly', () => {
    const routesWithDivider = [
      {
        id: 'route1',
        path: 'route1',
        label: 'Route 1',
        linkTo: { to: '/route1' },
        order: 1,
      },
      {
        id: 'divider',
        path: 'divider',
        label: '', // Label is required but can be empty for dividers
        isDivider: true,
        order: 2,
      },
      {
        id: 'route2',
        path: 'route2',
        label: 'Route 2',
        linkTo: { to: '/route2' },
        order: 3,
      },
    ];

    render(
      <MemoryRouter>
        <Sidebar
          routes={routesWithDivider}
          currentPath="route1"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Route 1')).toBeInTheDocument();
    expect(screen.getByText('Route 2')).toBeInTheDocument();
    // Divider should be rendered (it's an HR element)
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  it('should display user information when provided', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userName="John Doe"
          userEmail="john@example.com"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should display user initials in avatar when no picture is provided', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userName="John Doe"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should display single initial when only first name is provided', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userName="John"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should display ? when no name is provided', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userName=""
          userEmail="john@example.com"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should not display user section when neither name nor email is provided', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // User section should not be present
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
    expect(screen.queryByText('?')).not.toBeInTheDocument();
  });

  it('should render sidebar header with title', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('BAAA Hub')).toBeInTheDocument();
    expect(screen.getByText('Boss Anna Athlete Army')).toBeInTheDocument();
  });

  it('should handle routes without order property', () => {
    const routesWithoutOrder = [
      {
        id: 'no-order',
        path: 'no-order',
        label: 'No Order',
        linkTo: { to: '/no-order' },
      },
      {
        id: 'with-order',
        path: 'with-order',
        label: 'With Order',
        linkTo: { to: '/with-order' },
        order: 1,
      },
    ];

    render(
      <MemoryRouter>
        <Sidebar
          routes={routesWithoutOrder}
          currentPath="with-order"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // Routes without order should be placed at the end
    const labels = screen.getAllByRole('button').map(btn => btn.textContent);
    const routeLabels = labels.filter(
      label => label === 'No Order' || label === 'With Order',
    );
    expect(routeLabels).toEqual(['With Order', 'No Order']);
  });

  it('should handle route without linkTo gracefully', () => {
    const routesWithoutLinkTo = [
      {
        id: 'no-link',
        path: 'no-link',
        label: 'No Link',
        order: 1,
      },
    ];

    const mockOnClose = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar
          routes={routesWithoutLinkTo}
          currentPath="no-link"
          open
          onClose={mockOnClose}
        />
      </MemoryRouter>,
    );

    const noLinkButton = screen.getByText('No Link');
    fireEvent.click(noLinkButton);

    // Should not navigate if no linkTo
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show user with profile picture', () => {
    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
          userName="John Doe"
          userPicture="https://example.com/avatar.jpg"
        />
      </MemoryRouter>,
    );

    // Should not show initials when picture is provided
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
    // Name should still be displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle app already installed state', () => {
    // Mock window.matchMedia to return true for standalone mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <MemoryRouter>
        <Sidebar
          routes={mockRoutes}
          currentPath="dashboard"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // Install prompt should not be visible when app is already installed
    expect(screen.queryByText('Install App')).not.toBeInTheDocument();
  });

  it('should handle routes with no permission defined', () => {
    const routesWithNoPermission = [
      {
        id: 'no-permission',
        path: 'no-permission',
        label: 'No Permission',
        linkTo: { to: '/no-permission' },
        order: 1,
      },
    ];

    render(
      <MemoryRouter>
        <Sidebar
          routes={routesWithNoPermission}
          currentPath="no-permission"
          open
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    // Route without permission should be visible (treated as public)
    expect(screen.getByText('No Permission')).toBeInTheDocument();
  });
});
