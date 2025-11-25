import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { CardComponent } from './Card';

describe('CardComponent', () => {
  it('should render children correctly', () => {
    render(
      <CardComponent>
        <div data-testid="card-content">Test Content</div>
      </CardComponent>,
    );

    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <CardComponent>
        <div>First Child</div>
        <div>Second Child</div>
      </CardComponent>,
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('should render as a MUI Card component', () => {
    const { container } = render(
      <CardComponent>
        <div>Content</div>
      </CardComponent>,
    );

    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });
});
