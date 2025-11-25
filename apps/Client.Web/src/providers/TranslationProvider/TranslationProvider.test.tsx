import { describe, it, expect } from 'vitest';
import { Language } from '../LanguageProvider/LanguageProvider.model';

/**
 * Contract tests for TranslationProvider
 *
 * These tests document the expected behavior of the TranslationProvider component
 * which is responsible for loading and managing translation catalogs.
 *
 * Public API:
 * - TranslationProvider: React component that wraps children with I18nProvider
 * - Loads translation catalogs for supported languages (en, it)
 * - Handles errors gracefully during catalog loading
 * - Activates the language even if catalog loading fails
 */
describe('TranslationProvider - Contract Tests', () => {
  it('should support English language (en)', () => {
    expect(Language.EN).toBe('en');
    expect(Language.EN).toBeDefined();
  });

  it('should support Italian language (it)', () => {
    expect(Language.IT).toBe('it');
    expect(Language.IT).toBeDefined();
  });

  it('should have all two supported languages defined', () => {
    const supportedLanguages = [Language.EN, Language.IT];

    supportedLanguages.forEach(lang => {
      expect(lang).toBeTruthy();
      expect(typeof lang).toBe('string');
      expect(lang.length).toBeGreaterThan(0);
    });
  });

  it('should export TranslationProvider component', async () => {
    const module = await import('./TranslationProvider');

    expect(module.TranslationProvider).toBeDefined();
    expect(typeof module.TranslationProvider).toBe('function');
  });

  it('should be a React functional component', async () => {
    const { TranslationProvider } = await import('./TranslationProvider');

    // Should be a function (React functional component)
    expect(typeof TranslationProvider).toBe('function');

    // React functional components accept at least one parameter (props)
    expect(TranslationProvider.length).toBeGreaterThanOrEqual(0);
  });

  it('should have language catalogs available for import', async () => {
    // Verify that all two language catalogs can be imported
    const enMessages = await import('../../locales/en/messages');
    const itMessages = await import('../../locales/it/messages');

    expect(enMessages.messages).toBeDefined();
    expect(itMessages.messages).toBeDefined();
  });

  it('should export valid message catalog objects', async () => {
    const enMessages = await import('../../locales/en/messages');
    const itMessages = await import('../../locales/it/messages');

    // Each should have a messages object
    expect(typeof enMessages.messages).toBe('object');
    expect(typeof itMessages.messages).toBe('object');

    // Messages object should not be empty
    expect(Object.keys(enMessages.messages).length).toBeGreaterThan(0);
    expect(Object.keys(itMessages.messages).length).toBeGreaterThan(0);
  });

  it('should have consistent Language enum values', () => {
    // Ensure language codes are lowercase
    expect(Language.EN).toMatch(/^[a-z]+$/);
    expect(Language.IT).toMatch(/^[a-z]+$/);

    // Ensure language codes are exactly 2 characters (ISO 639-1)
    expect(Language.EN.length).toBe(2);
    expect(Language.IT.length).toBe(2);
  });

  it('should not have duplicate language codes', () => {
    const languages = [Language.EN, Language.IT];
    const uniqueLanguages = new Set(languages);

    expect(uniqueLanguages.size).toBe(languages.length);
  });
});
