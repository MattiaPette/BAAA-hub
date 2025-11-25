import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { TopBarTitle } from './TopbarTitle';

describe('TopBarTitle', () => {
  it('should render with provided title', () => {
    render(<TopBarTitle title="Activity Tracker" />);

    expect(screen.getByText('Activity Tracker')).toBeInTheDocument();
  });

  it('should render title as h1 variant', () => {
    render(<TopBarTitle title="Test Title" />);

    const title = screen.getByText('Test Title');
    expect(title.tagName).toBe('H1');
  });

  it('should render logo avatar', () => {
    const { container } = render(<TopBarTitle title="Test" />);

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
  });

  it('should render logo as square variant', () => {
    const { container } = render(<TopBarTitle title="Test" />);

    const avatar = container.querySelector('.MuiAvatar-square');
    expect(avatar).toBeInTheDocument();
  });

  it('should render vertical divider', () => {
    const { container } = render(<TopBarTitle title="Test" />);

    const divider = container.querySelector('.MuiDivider-root');
    expect(divider).toBeInTheDocument();
  });

  it('should render as a ListItem', () => {
    const { container } = render(<TopBarTitle title="Test" />);

    const listItem = container.querySelector('.MuiListItem-root');
    expect(listItem).toBeInTheDocument();
  });
});
