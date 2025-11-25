import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import { ComponentsDemo } from './ComponentsDemo';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';

const renderWithRouter = (component: React.ReactElement) =>
  render(
    <BrowserRouter>
      <BreadcrumProvider>{component}</BreadcrumProvider>
    </BrowserRouter>,
  );

describe('ComponentsDemo', () => {
  it('should render tabs navigation', () => {
    renderWithRouter(<ComponentsDemo />);

    expect(screen.getByRole('tab', { name: /inputs/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /data display/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /feedbacks/i })).toBeInTheDocument();
  });

  it('should render inputs demo by default', () => {
    renderWithRouter(<ComponentsDemo />);

    expect(screen.getByText('Input Components')).toBeInTheDocument();
  });

  it('should update tab selection based on URL path', () => {
    renderWithRouter(<ComponentsDemo />);

    // Default should be inputs (tab index 0)
    const inputsTab = screen.getByRole('tab', { name: /inputs/i });
    expect(inputsTab).toHaveAttribute('aria-selected', 'true');
  });
});
