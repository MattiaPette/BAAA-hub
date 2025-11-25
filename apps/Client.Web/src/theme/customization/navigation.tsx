import { Theme, Components } from '@mui/material/styles';

/**
 * Material-UI component customizations specific to navigation elements.
 * Provides style overrides for drawer components to match the application's design system.
 *
 * @constant
 * @type {Components<Theme>}
 */
export const navigationCustomizations: Components<Theme> = {
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        borderRight: `none`,
      }),
    },
  },
};
