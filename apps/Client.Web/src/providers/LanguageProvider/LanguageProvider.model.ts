import { Dispatch, ReactNode, SetStateAction } from 'react';

/**
 * Supported languages in the application.
 */
export enum Language {
  /** English */
  EN = 'en',
  /** Italian */
  IT = 'it',
}

/**
 * Value provided by the language context.
 * A tuple containing the current language and a function to update it.
 *
 * @property {Language} 0 - The current active language
 * @property {Dispatch<SetStateAction<Language>>} 1 - Function to update the current language
 */
export type LanguageContextValue = readonly [
  Language,
  Dispatch<SetStateAction<Language>>,
];

/**
 * Props for the LanguageProvider component.
 *
 * @property {string} [language] - Optional initial language code. If not provided, uses browser language or defaults to English
 * @property {ReactNode} children - React components to be wrapped by the language provider
 */
export type LanguageProviderProps = Readonly<{
  language?: string;
  children: ReactNode;
}>;
