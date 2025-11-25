import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { PlaceholderText } from './PlaceholderText';

describe('PlaceholderText', () => {
  it('should render with provided text', () => {
    render(<PlaceholderText text="Loading..." />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom placeholder message', () => {
    const customMessage = 'No data available';
    render(<PlaceholderText text={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should display text in a Box container', () => {
    const { container } = render(<PlaceholderText text="Test" />);

    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('should display text in Typography component', () => {
    const { container } = render(<PlaceholderText text="Test" />);

    const typography = container.querySelector('.MuiTypography-root');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveTextContent('Test');
  });
});
