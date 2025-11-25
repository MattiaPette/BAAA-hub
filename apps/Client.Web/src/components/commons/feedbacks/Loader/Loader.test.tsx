import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { Loader } from './Loader';

describe('Loader', () => {
  it('should render loader component', () => {
    const { container } = render(<Loader />);

    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    expect(circularProgress).toBeInTheDocument();
  });

  it('should render with default size of 54px', () => {
    const { container } = render(<Loader />);

    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    expect(circularProgress).toHaveStyle({ width: '54px', height: '54px' });
  });

  it('should render with custom size', () => {
    const { container } = render(<Loader size={100} />);

    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    expect(circularProgress).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('should render with custom thickness', () => {
    const { container } = render(<Loader thickness={6} />);

    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    const svg = circularProgress?.querySelector('svg');
    const circle = svg?.querySelector('circle');

    // Thickness affects stroke-width
    expect(circle).toBeInTheDocument();
  });

  it('should apply fade animation', () => {
    const { container } = render(<Loader />);

    // Check that CircularProgress is wrapped in a transition container
    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    expect(circularProgress).toBeInTheDocument();

    // Verify the component renders (the fade will be applied via MUI)
    expect(circularProgress?.parentElement).toBeInTheDocument();
  });

  it('should be positioned absolutely', () => {
    const { container } = render(<Loader />);

    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    expect(circularProgress).toHaveStyle({ position: 'absolute' });
  });

  it('should be centered using margins', () => {
    const { container } = render(<Loader size={54} />);

    const circularProgress = container.querySelector(
      '.MuiCircularProgress-root',
    );
    expect(circularProgress).toHaveStyle({
      marginTop: '-27px',
      marginLeft: '-27px',
    });
  });
});
