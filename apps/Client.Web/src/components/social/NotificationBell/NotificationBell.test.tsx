import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NotificationType } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../../test-utils';
import { NotificationBell } from './NotificationBell';
import * as socialService from '../../../services/socialService';

// Mock the social service
vi.mock('../../../services/socialService', () => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth provider
vi.mock('../../../providers/AuthProvider/AuthProvider', async () => {
  const actual = await vi.importActual<
    typeof import('../../../providers/AuthProvider/AuthProvider')
  >('../../../providers/AuthProvider/AuthProvider');
  return {
    ...actual,
    useAuth: () => ({
      token: {
        accessToken: 'mock-token',
      },
      isAuthenticated: true,
    }),
  };
});

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render notification bell icon', () => {
    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByLabelText(/notifications/i);
    expect(bellButton).toBeInTheDocument();
  });

  it('should show badge when there are unread notifications', async () => {
    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: NotificationType.NEW_FOLLOWER,
          isRead: false,
          data: {
            followerId: 'user-2',
            followerNickname: 'jane_doe',
            followerName: 'Jane',
            followerSurname: 'Doe',
          },
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should not show badge when there are no unread notifications', async () => {
    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalled();
    });

    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('should open dropdown when clicking the bell icon', async () => {
    const user = userEvent.setup({ delay: null });

    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: NotificationType.NEW_FOLLOWER,
          isRead: false,
          data: {
            followerId: 'user-2',
            followerNickname: 'jane_doe',
            followerName: 'Jane',
            followerSurname: 'Doe',
          },
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalled();
    });

    const bellButton = screen.getByLabelText(/notifications/i);
    await user.click(bellButton);

    // Dropdown should be visible
    await waitFor(() => {
      expect(
        screen.getByText(/@jane_doe.*is now following you/i),
      ).toBeInTheDocument();
    });
  });

  it('should mark notification as read when clicked', async () => {
    const user = userEvent.setup({ delay: null });

    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: NotificationType.NEW_FOLLOWER,
          isRead: false,
          data: {
            followerId: 'user-2',
            followerNickname: 'jane_doe',
            followerName: 'Jane',
            followerSurname: 'Doe',
          },
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      unreadCount: 1,
    });

    vi.spyOn(socialService, 'markNotificationAsRead').mockResolvedValue({
      notification: {
        id: 'notif-1',
        userId: 'user-1',
        type: NotificationType.NEW_FOLLOWER,
        isRead: true,
        data: {
          followerId: 'user-2',
          followerNickname: 'john_doe',
          followerName: 'John',
          followerSurname: 'Doe',
        },
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalled();
    });

    const bellButton = screen.getByLabelText(/notifications/i);
    await user.click(bellButton);

    await waitFor(() => {
      expect(
        screen.getByText(/@jane_doe.*is now following you/i),
      ).toBeInTheDocument();
    });

    const notificationItem = screen
      .getByText(/@jane_doe.*is now following you/i)
      .closest('li');
    if (notificationItem) {
      await user.click(notificationItem);
    }

    expect(socialService.markNotificationAsRead).toHaveBeenCalledWith(
      'notif-1',
      'mock-token',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/user/user-2');
  });

  it('should poll for new notifications every 30 seconds', async () => {
    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });

    render(<NotificationBell />);

    // Initial call
    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalledTimes(1);
    });

    // Advance time by 30 seconds
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalledTimes(2);
    });

    // Advance time by another 30 seconds
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalledTimes(3);
    });
  });

  it('should show empty state when there are no notifications', async () => {
    const user = userEvent.setup({ delay: null });

    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalled();
    });

    const bellButton = screen.getByLabelText(/notifications/i);
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  it('should handle notification fetch errors gracefully', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.spyOn(socialService, 'getNotifications').mockRejectedValue(
      new Error('Failed to fetch notifications'),
    );

    render(<NotificationBell />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch notifications:',
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should cleanup polling on unmount', async () => {
    vi.spyOn(socialService, 'getNotifications').mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });

    const { unmount } = render(<NotificationBell />);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Advance time - should not call again after unmount
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(socialService.getNotifications).toHaveBeenCalledTimes(1);
    });
  });
});
