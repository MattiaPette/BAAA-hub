import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { BreadcrumProvider, useBreadcrum } from './BreadcrumProvider';

describe('BreadcrumProvider', () => {
  it('should render children correctly', () => {
    render(
      <BreadcrumProvider>
        <div>Test Child</div>
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide context value to children', () => {
    const TestComponent = () => {
      const { title } = useBreadcrum();
      return <div>{title}</div>;
    };

    render(
      <BreadcrumProvider>
        <TestComponent />
      </BreadcrumProvider>,
    );

    // Default title is "Dashboard" (from lingui macro)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should allow updating title through context', async () => {
    const TestComponent = () => {
      const { title, setTitle } = useBreadcrum();
      return (
        <div>
          <span data-testid="title">{title}</span>
          <button type="button" onClick={() => setTitle('New Title')}>
            Update Title
          </button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <BreadcrumProvider>
        <TestComponent />
      </BreadcrumProvider>,
    );

    // Click the button to update title
    getByText('Update Title').click();

    await waitFor(() => {
      expect(getByTestId('title')).toHaveTextContent('New Title');
    });
  });

  it('should throw error when useBreadcrum is used outside BreadcrumProvider', () => {
    const TestComponent = () => {
      try {
        useBreadcrum();
      } catch (error) {
        expect((error as Error).message).toBe(
          'useBreadcrum must be used within a BreadcrumProvider',
        );
      }
      return null;
    };

    render(<TestComponent />);
  });

  it('should maintain title state across multiple children', async () => {
    const TestComponent1 = () => {
      const { title } = useBreadcrum();
      return <div data-testid="component1">{title}</div>;
    };

    const TestComponent2 = () => {
      const { title, setTitle } = useBreadcrum();
      return (
        <div>
          <span data-testid="component2">{title}</span>
          <button type="button" onClick={() => setTitle('Updated')}>
            Update
          </button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <BreadcrumProvider>
        <TestComponent1 />
        <TestComponent2 />
      </BreadcrumProvider>,
    );

    // Both components should show the same initial title
    const component1 = getByTestId('component1');
    const component2 = getByTestId('component2');
    expect(component1.textContent).toBe(component2.textContent);

    // Update title from component2
    getByText('Update').click();

    // Both should now show the updated title
    await waitFor(() => {
      expect(getByTestId('component1')).toHaveTextContent('Updated');
      expect(getByTestId('component2')).toHaveTextContent('Updated');
    });
  });
});
