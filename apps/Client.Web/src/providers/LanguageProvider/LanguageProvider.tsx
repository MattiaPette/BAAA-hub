import {
  FC,
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import {
  Language,
  LanguageContextValue,
  LanguageProviderProps,
} from './LanguageProvider.model';

const LANGUAGE_STORAGE_KEY = 'app-language';

const LanguageContext = createContext<LanguageContextValue>([
  Language.EN,
  () => undefined,
]);

const [languageCode] = navigator.language.split('-');

/**
 * Component function that provides the language context to its children.
 * Uses the browser's language as the default if no specific language is provided.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.language - The language to use. If not specified, the browser's language is used.
 * @param {ReactNode} props.children - The child components that will have access to the language context.
 *
 * @returns {JSX.Element} A language context Provider component that wraps the child components.
 *
 * @example
 * <LanguageProvider language="en">
 *  <MyComponent />
 * </LanguageProvider>
 */

const parseLanguage = (
  language: string,
  defaultLanguage = Language.EN,
): Language =>
  language.length > 0 &&
  Object.values<string>(Language).includes(languageCode.toLowerCase())
    ? (language as Language)
    : defaultLanguage;

const browserLanguage = parseLanguage(languageCode.toLowerCase());

/**
 * Component function that provides the language context to its children.
 * Uses the browser's language as the default if no specific language is provided.
 * Persists language preference in localStorage.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.language - The language to use. If not specified, uses stored preference or browser's language.
 * @param {ReactNode} props.children - The child components that will have access to the language context.
 *
 * @returns {JSX.Element} A language context Provider component that wraps the child components.
 *
 * @example
 * <LanguageProvider language="en">
 *   <MyComponent />
 * </LanguageProvider>
 */
export const LanguageProvider: FC<LanguageProviderProps> = ({
  language = '',
  children,
}) => {
  const getInitialLanguage = (): Language => {
    if (language) return parseLanguage(language, browserLanguage);

    try {
      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        return parseLanguage(storedLanguage, browserLanguage);
      }
    } catch {
      // localStorage not available
    }

    return browserLanguage;
  };

  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(getInitialLanguage());

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch {
      // localStorage not available
    }
  }, [currentLanguage]);

  const value: LanguageContextValue = useMemo(
    () => [currentLanguage, setCurrentLanguage],
    [currentLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook that provides access to the current language context.
 * Must be used within a `LanguageProvider`, otherwise it throws an error.
 *
 * @function
 * @name useLanguageContext
 *
 * @returns {NonNullable<LanguageContextValue>} The current value of the language context.
 *
 * @throws {Error} If used outside of a `LanguageProvider`.
 *
 * @example
 * const { language, setLanguage } = useLanguageContext();
 */
export const useLanguageContext = (): NonNullable<LanguageContextValue> => {
  const context = useContext(LanguageContext);

  if (!context) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error(
      'useLanguageContext must be used within a LanguageProvider',
    );
  }

  return context;
};
