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
});
