import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('should render children', () => {
    render(
      <Tooltip title="Test tooltip">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should render with title prop', () => {
    render(
      <Tooltip title="This is a tooltip">
        <button type="button">Test Button</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should wrap children with MuiTooltip', () => {
    const { container } = render(
      <Tooltip title="Test">
        <span>Content</span>
      </Tooltip>,
    );

    expect(container.querySelector('span')).toBeInTheDocument();
    expect(container.querySelector('span')).toHaveTextContent('Content');
  });
});
