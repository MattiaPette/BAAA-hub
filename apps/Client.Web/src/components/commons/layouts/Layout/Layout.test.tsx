import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders as render } from '../../../../test-utils';
import { Layout } from './Layout';

describe('Layout', () => {
  it('should render children', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render with start adornment', () => {
    render(
      <Layout startAdornment={<div>Start</div>}>
        <div>Content</div>
      </Layout>,
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render with end adornment', () => {
    render(
      <Layout endAdornment={<div>End</div>}>
        <div>Content</div>
      </Layout>,
    );

    expect(screen.getByText('End')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render with custom component', () => {
    render(
      <Layout component="main">
        <div>Test</div>
      </Layout>,
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('should render with maxWidth', () => {
    const { container } = render(
      <Layout maxWidth={false}>
        <div>Test</div>
      </Layout>,
    );

    const layout = container.querySelector('.MuiContainer-root');
    expect(layout).toBeInTheDocument();
  });

  it('should apply custom sx styles', () => {
    const { container } = render(
      <Layout sx={{ padding: '20px' }}>
        <div>Test</div>
      </Layout>,
    );

    const layout = container.querySelector('.MuiContainer-root');
    expect(layout).toBeInTheDocument();
  });

  it('should render with all adornments', () => {
    render(
      <Layout
        startAdornment={<div>Header</div>}
        endAdornment={<div>Footer</div>}
      >
        <div>Main content</div>
      </Layout>,
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
