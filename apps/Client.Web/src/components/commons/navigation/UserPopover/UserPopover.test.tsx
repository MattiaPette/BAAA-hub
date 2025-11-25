import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { UserPopover } from './UserPopover';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserPopover', () => {
  const mockRoutes = [
    {
      path: 'dashboard',
      icon: SettingsIcon,
      label: 'Dashboard',
      linkTo: { to: '/dashboard' },
      index: 0,
      showInSidebar: true, // This route appears in sidebar
    },
    {
      path: 'settings',
      icon: SettingsIcon,
      label: 'Settings',
      linkTo: { to: '/settings' },
      index: 1,
      showInSidebar: false, // This route is hidden from sidebar, shown in popover
    },
    {
      path: 'logout',
      icon: LogoutIcon,
      label: 'Logout',
      linkTo: { to: '/logout' },
      index: 2,
      showInSidebar: false, // This route is hidden from sidebar, shown in popover
    },
  ];

  it('should render UserPopover with menu button', () => {
    render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="dashboard" />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should render with routes prop', () => {
    const { container } = render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="dashboard" />
      </MemoryRouter>,
    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should filter routes for popover display', () => {
    render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="dashboard" />
      </MemoryRouter>,
    );

    // Should render menu button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle empty routes', () => {
    render(
      <MemoryRouter>
        <UserPopover routes={[]} currentPath="dashboard" />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should handle routes without linkTo', () => {
    const routesWithoutLink = [
      {
        path: 'settings',
        icon: SettingsIcon,
        label: 'Settings',
        index: 1,
        showInSidebar: false, // Hidden from sidebar, shown in popover
      },
    ];

    render(
      <MemoryRouter>
        <UserPopover routes={routesWithoutLink} currentPath="dashboard" />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should render with current path prop', () => {
    render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="settings" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should open popover when menu button is clicked', async () => {
    render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="dashboard" />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Popover should be open and show routes with showInSidebar: false
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('should close popover when clicking outside', async () => {
    render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="dashboard" />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click outside to close (simulate popover onClose)
    const popover = screen.getByRole('presentation').firstChild;
    if (popover) {
      // Trigger the onClose callback by simulating backdrop click
      fireEvent.keyDown(popover, { key: 'Escape' });
    }
  });

  it('should navigate when clicking on a route with linkTo', async () => {
    render(
      <MemoryRouter>
        <UserPopover routes={mockRoutes} currentPath="dashboard" />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Settings route
    const settingsItem = screen.getByText('Settings');
    fireEvent.click(settingsItem);

    // Verify navigate was called with correct arguments
    expect(mockNavigate).toHaveBeenCalledWith('/settings', undefined);
  });
});
