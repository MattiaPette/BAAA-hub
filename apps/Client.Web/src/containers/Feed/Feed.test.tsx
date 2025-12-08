import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Feed } from './Feed';
import { renderWithProviders as render } from '../../test-utils';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock social service
vi.mock('../../services/socialService', () => ({
  searchUsers: vi.fn(),
}));

describe('Feed', () => {
  it('should render Feed component', () => {
    const { getByText } = render(
      <BreadcrumProvider>
        <Feed />
      </BreadcrumProvider>,
    );

    expect(getByText(/feed/i)).toBeInTheDocument();
  });
});
