import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithProviders as render } from '../../../../test-utils';
import { UserSearch } from './UserSearch';
import * as socialService from '../../../services/socialService';

// Mock the social service
vi.mock('../../../services/socialService', () => ({
  searchUsers: vi.fn(),
}));

// Mock the user service for image URLs
vi.mock('../../../services/userService', () => ({
  getUserImageUrl: vi.fn((key?: string) => key || ''),
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

describe('UserSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText(/search users/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should not show results when query is too short', async () => {
    const user = userEvent.setup();
    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'a');

    // Wait for debounce
    await waitFor(() => {
      expect(socialService.searchUsers).not.toHaveBeenCalled();
    });
  });

  it('should search and display results when query is long enough', async () => {
    const user = userEvent.setup();
    const mockUsers = [
      {
        id: '1',
        nickname: 'john_doe',
        name: 'John',
        surname: 'Doe',
      },
      {
        id: '2',
        nickname: 'jane_smith',
        name: 'Jane',
        surname: 'Smith',
      },
    ];

    vi.spyOn(socialService, 'searchUsers').mockResolvedValue({
      users: mockUsers,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    // Wait for debounce and API call
    await waitFor(() => {
      expect(socialService.searchUsers).toHaveBeenCalledWith('john');
    });

    // Results should be displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@john_doe')).toBeInTheDocument();
    });
  });

  it('should navigate to user profile when clicking a result', async () => {
    const user = userEvent.setup();
    const mockUsers = [
      {
        id: 'user-123',
        nickname: 'john_doe',
        name: 'John',
        surname: 'Doe',
      },
    ];

    vi.spyOn(socialService, 'searchUsers').mockResolvedValue({
      users: mockUsers,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const resultItem = screen.getByText('John Doe').closest('li');
    if (resultItem) {
      await user.click(resultItem);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/user/user-123');
  });

  it('should show loading state while searching', async () => {
    const user = userEvent.setup();

    // Create a promise we can control
    let resolveSearch:
      | ((value: Readonly<{ users: UserSearchResult[] }>) => void)
      | undefined;
    const searchPromise = new Promise<Readonly<{ users: UserSearchResult[] }>>(
      resolve => {
        resolveSearch = resolve;
      },
    );

    vi.spyOn(socialService, 'searchUsers').mockReturnValue(searchPromise);

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    // Wait for debounce
    await waitFor(() => {
      expect(socialService.searchUsers).toHaveBeenCalled();
    });

    // Should show loading indicator
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    // Resolve the search
    resolveSearch!({ users: [] });
  });

  it('should handle search errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.spyOn(socialService, 'searchUsers').mockRejectedValue(
      new Error('Search failed'),
    );

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(socialService.searchUsers).toHaveBeenCalled();
    });

    // Should log error to console
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to search users:',
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should close results dropdown when clicking away', async () => {
    const user = userEvent.setup();
    const mockUsers = [
      {
        id: '1',
        nickname: 'john_doe',
        name: 'John',
        surname: 'Doe',
      },
    ];

    vi.spyOn(socialService, 'searchUsers').mockResolvedValue({
      users: mockUsers,
    });

    render(
      <div>
        <UserSearch />
        <button type="button">Outside Button</button>
      </div>,
    );

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click outside
    const outsideButton = screen.getByText('Outside Button');
    await user.click(outsideButton);

    // Results should be hidden
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('should clear results when search query is cleared', async () => {
    const user = userEvent.setup();
    const mockUsers = [
      {
        id: '1',
        nickname: 'john_doe',
        name: 'John',
        surname: 'Doe',
      },
    ];

    vi.spyOn(socialService, 'searchUsers').mockResolvedValue({
      users: mockUsers,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Clear the input
    await user.clear(searchInput);

    // Results should be hidden
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
});
