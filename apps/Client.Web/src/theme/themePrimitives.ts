import { PaletteMode } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';

import '@fontsource/open-sans/400.css';

// Extend the Palette interface to include accent color
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      dark: '#3f51b5',
    },
    secondary: {
      main: '#e91e63',
    },
    accent: {
      main: '#1976d2',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Open Sans',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {},
    },
  },
};

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
      dark: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    accent: {
      main: '#1976d2',
    },
    background: {
      default: '#212121',
      paper: '#212020ff',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'open sans',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {},
    },
  },
};

export const getDesignTokens = (mode: PaletteMode) =>
  mode === 'light' ? lightThemeOptions : darkThemeOptions;
