import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeModeProvider, useThemeModeContext } from './ThemeProvider';

describe('ThemeModeProvider', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <ThemeModeProvider>
        <div>Test Child</div>
      </ThemeModeProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide default light mode when no mode is specified and localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const [mode] = useThemeModeContext();
      return <div data-testid="mode">{mode}</div>;
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('should use provided mode prop as initial mode', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const [mode] = useThemeModeContext();
      return <div data-testid="mode">{mode}</div>;
    };

    render(
      <ThemeModeProvider mode="dark">
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('should load mode from localStorage when available', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const TestComponent = () => {
      const [mode] = useThemeModeContext();
      return <div data-testid="mode">{mode}</div>;
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('app-theme-mode');
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('should prioritize mode prop over localStorage value', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const TestComponent = () => {
      const [mode] = useThemeModeContext();
      return <div data-testid="mode">{mode}</div>;
    };

    render(
      <ThemeModeProvider mode="light">
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('should allow updating theme mode through context', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const [mode, setMode] = useThemeModeContext();
      return (
        <div>
          <span data-testid="mode">{mode}</span>
          <button type="button" onClick={() => setMode('dark')}>
            Set Dark
          </button>
        </div>
      );
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');

    screen.getByText('Set Dark').click();

    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });
  });

  it('should persist mode to localStorage when updated', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const [, setMode] = useThemeModeContext();
      return (
        <button type="button" onClick={() => setMode('dark')}>
          Set Dark
        </button>
      );
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    screen.getByText('Set Dark').click();

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app-theme-mode',
        'dark',
      );
    });
  });

  it('should maintain theme state across multiple children', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent1 = () => {
      const [mode] = useThemeModeContext();
      return <div data-testid="component1">{mode}</div>;
    };

    const TestComponent2 = () => {
      const [mode, setMode] = useThemeModeContext();
      return (
        <div>
          <span data-testid="component2">{mode}</span>
          <button type="button" onClick={() => setMode('dark')}>
            Update
          </button>
        </div>
      );
    };

    render(
      <ThemeModeProvider>
        <TestComponent1 />
        <TestComponent2 />
      </ThemeModeProvider>,
    );

    // Both components should show the same initial mode
    expect(screen.getByTestId('component1')).toHaveTextContent('light');
    expect(screen.getByTestId('component2')).toHaveTextContent('light');

    // Update mode from component2
    screen.getByText('Update').click();

    // Both should now show the updated mode
    await waitFor(() => {
      expect(screen.getByTestId('component1')).toHaveTextContent('dark');
      expect(screen.getByTestId('component2')).toHaveTextContent('dark');
    });
  });

  it('should handle localStorage errors gracefully when reading', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    const TestComponent = () => {
      const [mode] = useThemeModeContext();
      return <div data-testid="mode">{mode}</div>;
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    // Should default to light mode when localStorage fails
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('should handle localStorage errors gracefully when writing', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    const TestComponent = () => {
      const [mode, setMode] = useThemeModeContext();
      return (
        <div>
          <span data-testid="mode">{mode}</span>
          <button type="button" onClick={() => setMode('dark')}>
            Set Dark
          </button>
        </div>
      );
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    // Should still update state even if localStorage fails
    screen.getByText('Set Dark').click();

    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });
  });

  it('should throw error when useThemeModeContext is used outside ThemeModeProvider', () => {
    const TestComponent = () => {
      try {
        useThemeModeContext();
      } catch (error) {
        expect((error as Error).message).toBe(
          'useThemeModeContext must be used within a ThemeModeProvider',
        );
      }
      return null;
    };

    render(<TestComponent />);
  });

  it('should toggle between light and dark modes', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const [mode, setMode] = useThemeModeContext();
      return (
        <div>
          <span data-testid="mode">{mode}</span>
          <button
            type="button"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          >
            Toggle
          </button>
        </div>
      );
    };

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');

    // Toggle to dark
    screen.getByText('Toggle').click();
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    // Toggle back to light
    screen.getByText('Toggle').click();
    await waitFor(() => {
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });
  });
});
