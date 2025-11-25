import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { FormDialog } from './FormDialog';

describe('FormDialog', () => {
  it('should render dialog when open is true', () => {
    render(
      <FormDialog open title="Test Dialog">
        <div>Dialog content</div>
      </FormDialog>,
    );

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    render(
      <FormDialog open={false} title="Test Dialog">
        <div>Dialog content</div>
      </FormDialog>,
    );

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('should render title as h2', () => {
    render(
      <FormDialog open title="My Title">
        <div>Content</div>
      </FormDialog>,
    );

    const title = screen.getByText('My Title');
    expect(title.tagName).toBe('H2');
  });

  it('should render children content', () => {
    render(
      <FormDialog open title="Dialog">
        <div data-testid="custom-content">Custom content</div>
      </FormDialog>,
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should render children in dialog', () => {
    render(
      <FormDialog open title="Dialog">
        <div>Content</div>
      </FormDialog>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
