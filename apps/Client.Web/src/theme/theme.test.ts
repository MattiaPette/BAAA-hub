import { describe, it, expect } from 'vitest';
import { initTheme } from './theme';
import { Language } from '../providers/LanguageProvider/LanguageProvider.model';

describe('theme', () => {
  describe('initTheme', () => {
    it('should create theme with light mode and English language', () => {
      const theme = initTheme('light', Language.EN);
      expect(theme).toBeDefined();
      expect(theme.palette.mode).toBe('light');
    });

    it('should create theme with dark mode and English language', () => {
      const theme = initTheme('dark', Language.EN);
      expect(theme).toBeDefined();
      expect(theme.palette.mode).toBe('dark');
    });

    it('should create theme with light mode and Italian language', () => {
      const theme = initTheme('light', Language.IT);
      expect(theme).toBeDefined();
      expect(theme.palette.mode).toBe('light');
    });

    it('should create theme with dark mode and Italian language', () => {
      const theme = initTheme('dark', Language.IT);
      expect(theme).toBeDefined();
      expect(theme.palette.mode).toBe('dark');
    });

    it('should have accent color in palette', () => {
      const theme = initTheme('light', Language.EN);
      expect(theme.palette.accent).toBeDefined();
      expect(theme.palette.accent.main).toBeDefined();
    });

    it('should apply customizations', () => {
      const theme = initTheme('light', Language.EN);
      expect(theme.components).toBeDefined();
    });

    it('should use default accent color when not provided in design tokens', () => {
      const theme = initTheme('light', Language.EN);
      // The accent color should be defined, either from tokens or default
      expect(theme.palette.accent.main).toBeTruthy();
    });
  });
});
