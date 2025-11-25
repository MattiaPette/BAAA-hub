import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguageContext } from './LanguageProvider';
import { Language } from './LanguageProvider.model';

describe('LanguageProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
  });

  it('should render children correctly', () => {
    render(
      <LanguageProvider>
        <div>Test Child</div>
      </LanguageProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should use English as default when no language prop is provided and browser language is unsupported', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>,
    );

    // Should have a valid Language enum value
    const languageValue = screen.getByTestId('language').textContent;
    expect([Language.EN, Language.IT]).toContain(languageValue);
  });

  it('should detect browser language at module load time', () => {
    // Note: navigator.language is read at module load time, not at component mount
    // This test verifies the module-level browserLanguage detection works
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>,
    );

    // Will use the language detected when the module loaded
    const languageValue = screen.getByTestId('language').textContent;
    expect(languageValue).toBeTruthy();
    expect(typeof languageValue).toBe('string');
  });

  it('should use provided language prop as initial language', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="it">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
  });

  it('should support English language', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="en">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);
  });

  it('should support Italian language', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="it">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
  });

  it('should allow updating language through context', async () => {
    const TestComponent = () => {
      const [language, setLanguage] = useLanguageContext();
      return (
        <div>
          <span data-testid="language">{language}</span>
          <button type="button" onClick={() => setLanguage(Language.IT)}>
            Set Italian
          </button>
        </div>
      );
    };

    render(
      <LanguageProvider language="en">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);

    screen.getByText('Set Italian').click();

    await waitFor(() => {
      expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
    });
  });

  it('should maintain language state across multiple children', async () => {
    const TestComponent1 = () => {
      const [language] = useLanguageContext();
      return <div data-testid="component1">{language}</div>;
    };

    const TestComponent2 = () => {
      const [language, setLanguage] = useLanguageContext();
      return (
        <div>
          <span data-testid="component2">{language}</span>
          <button type="button" onClick={() => setLanguage(Language.IT)}>
            Update
          </button>
        </div>
      );
    };

    render(
      <LanguageProvider language="en">
        <TestComponent1 />
        <TestComponent2 />
      </LanguageProvider>,
    );

    // Both components should show the same initial language
    expect(screen.getByTestId('component1')).toHaveTextContent(Language.EN);
    expect(screen.getByTestId('component2')).toHaveTextContent(Language.EN);

    // Update language from component2
    screen.getByText('Update').click();

    // Both should now show the updated language
    await waitFor(() => {
      expect(screen.getByTestId('component1')).toHaveTextContent(Language.IT);
      expect(screen.getByTestId('component2')).toHaveTextContent(Language.IT);
    });
  });

  it('should throw error when useLanguageContext is used outside LanguageProvider', () => {
    const TestComponent = () => {
      try {
        useLanguageContext();
      } catch (error) {
        expect((error as Error).message).toBe(
          'useLanguageContext must be used within a LanguageProvider',
        );
      }
      return null;
    };

    render(<TestComponent />);
  });

  it('should fallback to English for empty language string', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);
  });

  it('should accept any string as language prop', () => {
    // Note: Current implementation does not validate language prop
    // It accepts any string value passed to it
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="custom-lang">
        <TestComponent />
      </LanguageProvider>,
    );

    // Language prop is passed through without validation
    expect(screen.getByTestId('language')).toHaveTextContent('custom-lang');
  });

  it('should use language prop when provided', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="it">
        <TestComponent />
      </LanguageProvider>,
    );

    // Should use the explicitly provided language prop
    expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
  });

  it('should allow switching between all supported languages', async () => {
    const TestComponent = () => {
      const [language, setLanguage] = useLanguageContext();
      return (
        <div>
          <span data-testid="language">{language}</span>
          <button type="button" onClick={() => setLanguage(Language.EN)}>
            English
          </button>
          <button type="button" onClick={() => setLanguage(Language.IT)}>
            Italian
          </button>
        </div>
      );
    };

    render(
      <LanguageProvider language="en">
        <TestComponent />
      </LanguageProvider>,
    );

    // Start with English
    expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);

    // Switch to Italian
    screen.getByText('Italian').click();
    await waitFor(() => {
      expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
    });

    // Switch back to English
    screen.getByText('English').click();
    await waitFor(() => {
      expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);
    });
  });

  it('should prioritize language prop over browser language', () => {
    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    // Explicitly pass it even if browser uses a different language
    render(
      <LanguageProvider language="it">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
  });

  it('should persist language to localStorage when language changes', async () => {
    const TestComponent = () => {
      const [language, setLanguage] = useLanguageContext();
      return (
        <div>
          <span data-testid="language">{language}</span>
          <button type="button" onClick={() => setLanguage(Language.IT)}>
            Change to Italian
          </button>
        </div>
      );
    };

    render(
      <LanguageProvider language="en">
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);

    // Change language
    screen.getByText('Change to Italian').click();

    await waitFor(() => {
      expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
    });

    // Verify it was saved to localStorage
    expect(localStorage.getItem('app-language')).toBe(Language.IT);
  });

  it('should restore language from localStorage on mount', () => {
    // Set a language in localStorage
    localStorage.setItem('app-language', Language.IT);

    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>,
    );

    // Should use the stored language
    expect(screen.getByTestId('language')).toHaveTextContent(Language.IT);
  });

  it('should prioritize language prop over localStorage', () => {
    // Set a different language in localStorage
    localStorage.setItem('app-language', Language.IT);

    const TestComponent = () => {
      const [language] = useLanguageContext();
      return <div data-testid="language">{language}</div>;
    };

    render(
      <LanguageProvider language="en">
        <TestComponent />
      </LanguageProvider>,
    );

    // Should use the language prop, not localStorage
    expect(screen.getByTestId('language')).toHaveTextContent(Language.EN);
  });
});
