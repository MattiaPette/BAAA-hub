import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router';
import { renderWithProviders as render } from '../../../../test-utils';
import { LinkRouter } from './LinkRouter';

describe('LinkRouter', () => {
  it('should render link with text', () => {
    render(
      <BrowserRouter>
        <LinkRouter to="/test">Test Link</LinkRouter>
      </BrowserRouter>,
    );

    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('should have correct href attribute', () => {
    render(
      <BrowserRouter>
        <LinkRouter to="/dashboard">Dashboard</LinkRouter>
      </BrowserRouter>,
    );

    const link = screen.getByText('Dashboard');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('should have no underline', () => {
    const { container } = render(
      <BrowserRouter>
        <LinkRouter to="/test">Link</LinkRouter>
      </BrowserRouter>,
    );

    const link = container.querySelector('.MuiLink-root');
    expect(link).toHaveClass('MuiLink-underlineNone');
  });

  it('should accept and apply color prop', () => {
    render(
      <BrowserRouter>
        <LinkRouter to="/test" color="primary">
          Primary Link
        </LinkRouter>
      </BrowserRouter>,
    );

    const link = screen.getByText('Primary Link');
    expect(link).toBeInTheDocument();
  });
});
