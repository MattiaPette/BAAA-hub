import { createTheme, Theme, ThemeOptions, PaletteMode } from '@mui/material';

import { itIT as muiItalian, enUS as muiEnglish } from '@mui/material/locale';
import {
  itIT as datagridItalian,
  enUS as datagridEnglish,
} from '@mui/x-data-grid/locales';

import { getDesignTokens } from './themePrimitives';
import { customizations } from './customization';

import { Language } from '../providers/LanguageProvider/LanguageProvider.model';

const themeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
  },
};

/**
 * Creates a custom theme based on the mode and language.
 *
 * @param {PaletteMode} mode - Theme mode ('light' or 'dark'). Default is 'dark'.
 * @param {Language} [language] - Theme language (e.g., 'IT' or 'EN'). If not specified, the default is 'EN'.
 *
 * @returns {Theme} A custom Theme object with typography options, design tokens, and navigation customizations.
 *
 * @example
 * // Create a dark theme in Italian
 * const theme = initTheme('dark', 'IT');
 */
export const initTheme = (
  mode: PaletteMode = 'dark',
  language?: Language,
): Theme => {
  const designTokens = getDesignTokens(mode);

  // First pass: create base theme to get augmentColor function
  const baseTheme = createTheme(designTokens);

  // Get the accent main color from design tokens
  const accentMain =
    (designTokens.palette?.accent as { main?: string })?.main || '#1976d2';

  // Augment the accent color properly
  const themeWithAccent = createTheme(baseTheme, {
    palette: {
      accent: baseTheme.palette.augmentColor({
        color: {
          main: accentMain,
        },
        name: 'accent',
      }),
    },
  });

  // Final pass: merge with other options and locales
  return createTheme(
    {
      ...themeOptions,
      ...themeWithAccent,
      components: {
        ...customizations,
      },
    },
    language === Language.IT ? muiItalian : muiEnglish,
    language === Language.IT ? datagridItalian : datagridEnglish,
  );
};
