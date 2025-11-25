import { FC, ReactNode, useEffect } from 'react';

import { i18n } from '@lingui/core';

import { I18nProvider } from '@lingui/react';

import { useLanguageContext } from '../LanguageProvider/LanguageProvider';

import { Language } from '../LanguageProvider/LanguageProvider.model';

import { messages as enMessages } from '../../locales/en/messages';
import { messages as itMessages } from '../../locales/it/messages';

/**
 * Language catalog mapping with explicit imports for static analysis.
 * Maps each Language enum value to its corresponding message catalog.
 */
const languageCatalogs = {
  [Language.EN]: enMessages,
  [Language.IT]: itMessages,
} as const;

/**
 * Loads the specified language catalogs. This function is synchronous.
 *
 * @param {Language} language - The Language object that specifies the language of the catalog to load.
 * @returns {void}
 * @throws {Error} If loading the language catalog fails, an error is logged.
 *
 * @example
 * loadCatalogs(Language.EN);
 * console.log('English language catalog loaded successfully');
 */
const loadCatalogs = (language: Language): void => {
  try {
    const messages = languageCatalogs[language];
    i18n.load(language, messages);
  } catch (e) {
    console.error(`Failed to load language: '${language}'.`, e);
  } finally {
    i18n.activate(language);
  }
};

/**
 * Component function that provides translation for its children. It uses the language context to get the current language and loads the corresponding translation catalogs. Finally, it wraps its children with an I18nProvider to supply the translations.
 *
 * @param {Object} props - The component's properties.
 * @param {ReactNode} props.children - The component's children that require translation.
 * @returns {JSX.Element} An I18nProvider component that wraps the children, providing translations.
 *
 * @example
 * <TranslationProvider>
 *   <MyComponent />
 * </TranslationProvider>
 */
export const TranslationProvider: FC<Readonly<{ children: ReactNode }>> = ({
  children,
}) => {
  const [language] = useLanguageContext();
  loadCatalogs(language);

  useEffect(() => {
    loadCatalogs(language);
  }, [language]);

  return (
    // I18nProvider did not render. A call to i18n.activate still needs to happen or forceRenderOnLocaleChange must be set to false.
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  );
};
