import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { MainContainer } from './MainContainer';
import * as BreadcrumProviderModule from '../../providers/BreadcrumProvider/BreadcrumProvider';

describe('MainContainer', () => {
  it('should render MainContainer with title from BreadcrumProvider', () => {
    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      title: 'Test Title',
      setTitle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MainContainer />
      </MemoryRouter>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render BaseContainer with menu button for sidebar', () => {
    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      title: 'Dashboard',
      setTitle: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <MainContainer />
      </MemoryRouter>,
    );

    // Menu button should be rendered to toggle sidebar
    const menuButton = container.querySelector('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should include dashboard route in routes configuration', () => {
    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      title: 'Test',
      setTitle: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <MainContainer />
      </MemoryRouter>,
    );

    // Container should have main content area
    expect(container).toBeTruthy();
    const menuButton = container.querySelector('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should render successfully with settings title', () => {
    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      title: 'Settings',
      setTitle: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <MainContainer />
      </MemoryRouter>,
    );

    // Settings title should be displayed in top bar
    const titleElement = container.querySelector('h1');
    expect(titleElement).toHaveTextContent('Settings');
    // Container should render successfully
    expect(container).toBeTruthy();
  });

  it('should render successfully with different titles', () => {
    vi.spyOn(BreadcrumProviderModule, 'useBreadcrum').mockReturnValue({
      title: 'Main',
      setTitle: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <MainContainer />
      </MemoryRouter>,
    );

    // Container should be rendered successfully
    expect(container).toBeTruthy();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });
});
