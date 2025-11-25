import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { renderWithProviders as render } from '../../../../test-utils';
import { UserInformations } from './UserInformations';

describe('UserInformations', () => {
  const defaultProps = {
    open: true,
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    userRoles: [],
    userRoutes: [],
  };

  it('should render user information when open', () => {
    render(<UserInformations {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should render user initials in avatar', () => {
    render(<UserInformations {...defaultProps} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render with closed state', () => {
    render(<UserInformations {...defaultProps} open={false} userRoles={[]} />);

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('should render with picture source', () => {
    const { container } = render(
      <UserInformations
        {...defaultProps}
        pictureSrc="/avatar.jpg"
        userRoles={[]}
      />,
    );

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
  });

  it('should handle user with middle name', () => {
    render(
      <UserInformations
        {...defaultProps}
        name="John Samuel"
        surname="Doe"
        userRoles={[]}
      />,
    );

    expect(screen.getByText('JSD')).toBeInTheDocument();
  });

  it('should handle user with no surname', () => {
    render(
      <UserInformations
        {...defaultProps}
        name="John"
        surname=""
        userRoles={[]}
      />,
    );

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render UserPopover when userRoutes exist', () => {
    const routes = [{ path: '/settings', label: 'Settings', index: 0 }];

    const { container } = render(
      <BrowserRouter>
        <UserInformations
          {...defaultProps}
          userRoutes={routes}
          userRoles={[]}
        />
      </BrowserRouter>,
    );

    expect(container).toBeInTheDocument();
  });

  it('should call onAvatarClick when avatar is clicked in closed state', () => {
    const onAvatarClick = vi.fn();
    const { container } = render(
      <UserInformations
        {...defaultProps}
        open={false}
        onAvatarClick={onAvatarClick}
        userRoles={[]}
      />,
    );

    const avatar = container.querySelector('.MuiAvatar-root');
    if (avatar) {
      (avatar as HTMLElement).click();
      expect(onAvatarClick).toHaveBeenCalled();
    }
  });
});
