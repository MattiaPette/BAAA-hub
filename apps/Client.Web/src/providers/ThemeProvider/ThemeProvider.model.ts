import { Dispatch, ReactNode, SetStateAction } from 'react';
import { PaletteMode } from '@mui/material';

/**
 * Value provided by the theme mode context.
 * A tuple containing the current theme mode and a function to update it.
 *
 * @property {PaletteMode} 0 - The current theme mode ('light' or 'dark')
 * @property {Dispatch<SetStateAction<PaletteMode>>} 1 - Function to update the theme mode
 */
export type ThemeModeContextValue = readonly [
  PaletteMode,
  Dispatch<SetStateAction<PaletteMode>>,
];

/**
 * Props for the ThemeModeProvider component.
 *
 * @property {PaletteMode} [mode] - Optional initial theme mode. If not provided, uses stored preference or defaults to 'light'
 * @property {ReactNode} children - React components to be wrapped by the theme mode provider
 */
export type ThemeModeProviderProps = Readonly<{
  mode?: PaletteMode;
  children: ReactNode;
}>;
