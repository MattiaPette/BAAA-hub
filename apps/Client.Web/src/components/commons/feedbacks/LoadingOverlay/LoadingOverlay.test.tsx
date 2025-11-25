import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('should render overlay when isLoading is true', () => {
    const { container } = render(<LoadingOverlay isLoading />);

    const overlay = container.querySelector('div');
    expect(overlay).toBeInTheDocument();
  });

  it('should not render overlay when isLoading is false', () => {
    const { container } = render(<LoadingOverlay isLoading={false} />);

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should display loader when isLoading is true', () => {
    const { container } = render(<LoadingOverlay isLoading />);

    const loader = container.querySelector('.MuiCircularProgress-root');
    expect(loader).toBeInTheDocument();
  });

  it('should render with fixed position overlay', () => {
    const { container } = render(<LoadingOverlay isLoading />);

    const overlay = container.querySelector('div');
    expect(overlay).toHaveStyle({ position: 'fixed' });
  });

  it('should have proper z-index for overlay', () => {
    const { container } = render(<LoadingOverlay isLoading />);

    const overlay = container.querySelector('div');
    expect(overlay).toHaveStyle({ zIndex: '1300' });
  });
});
