import {
  FC,
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { PaletteMode } from '@mui/material';

import {
  ThemeModeContextValue,
  ThemeModeProviderProps,
} from './ThemeProvider.model';

const THEME_STORAGE_KEY = 'app-theme-mode';

const ThemeModeContext = createContext<ThemeModeContextValue>([
  'light',
  () => undefined,
]);

/**
 * Component function that provides the theme mode context to its children.
 * Persists theme mode preference in localStorage.
 *
 * @param {object} props - The component's properties.
 * @param {PaletteMode} props.mode - The theme mode to use. If not specified, defaults to stored preference or 'dark'.
 * @param {ReactNode} props.children - The child components that will have access to the theme mode context.
 *
 * @returns {JSX.Element} A theme mode context Provider component that wraps the child components.
 *
 * @example
 * <ThemeModeProvider mode="light">
 *   <MyComponent />
 * </ThemeModeProvider>
 */
export const ThemeModeProvider: FC<ThemeModeProviderProps> = ({
  mode,
  children,
}) => {
  const getInitialMode = (): PaletteMode => {
    if (mode) return mode;

    try {
      const storedMode = localStorage.getItem(
        THEME_STORAGE_KEY,
      ) as PaletteMode | null;
      return storedMode || 'light';
    } catch {
      return 'light';
    }
  };

  const [themeMode, setThemeMode] = useState<PaletteMode>(getInitialMode());

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // localStorage not available
    }
  }, [themeMode]);

  const value: ThemeModeContextValue = useMemo(
    () => [themeMode, setThemeMode],
    [themeMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

/**
 * Custom hook that provides access to the current theme mode context.
 * Must be used within a `ThemeModeProvider`, otherwise it throws an error.
 *
 * @function
 * @name useThemeModeContext
 *
 * @returns {NonNullable<ThemeModeContextValue>} The current value of the theme mode context.
 *
 * @throws {Error} If used outside of a `ThemeModeProvider`.
 *
 * @example
 * const [mode, setMode] = useThemeModeContext();
 * // Toggle theme
 * setMode(mode === 'dark' ? 'light' : 'dark');
 */
export const useThemeModeContext = (): NonNullable<ThemeModeContextValue> => {
  const context = useContext(ThemeModeContext);

  if (!context) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error(
      'useThemeModeContext must be used within a ThemeModeProvider',
    );
  }

  return context;
};
