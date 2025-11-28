import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useLanguageContext } from '../../providers/LanguageProvider/LanguageProvider';
import { Language } from '../../providers/LanguageProvider/LanguageProvider.model';
import { useThemeModeContext } from '../../providers/ThemeProvider/ThemeProvider';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';

/**
 * Settings page component that allows users to configure application preferences.
 * Includes theme mode switcher (light/dark) and language selector.
 *
 * @returns {JSX.Element} The settings page with theme and language controls.
 *
 * @example
 * <Settings />
 */
export const Settings: FC = () => {
  const [language, setLanguage] = useLanguageContext();
  const [mode, setMode] = useThemeModeContext();
  const { enqueueSnackbar } = useSnackbar();
  const { setTitle } = useBreadcrum();
  const { i18n } = useLingui();

  useEffect(() => {
    setTitle(t`Settings`);
  }, [setTitle, i18n.locale]);

  const handleThemeToggle = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    enqueueSnackbar(
      newMode === 'light'
        ? t`Switched to light theme`
        : t`Switched to dark theme`,
      { variant: 'success' },
    );
  };

  const handleLanguageChange = (event: Readonly<SelectChangeEvent<string>>) => {
    const newLanguage = event.target.value as Language;
    setLanguage(newLanguage);
    enqueueSnackbar(
      newLanguage === Language.EN
        ? t`Language changed to English`
        : t`Language changed to Italian`,
      { variant: 'success' },
    );
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        {t`Settings`}
      </Typography>

      <Stack spacing={3} sx={{ marginTop: 3 }}>
        {/* Theme Mode Switcher */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Theme`}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'light'}
                  onChange={handleThemeToggle}
                  color="primary"
                />
              }
              label={mode === 'light' ? t`Light Mode` : t`Dark Mode`}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t`Switch between light and dark theme`}
            </Typography>
          </CardContent>
        </Card>

        {/* Language Selector */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Language`}
            </Typography>
            <FormControl fullWidth sx={{ marginTop: 2 }}>
              <InputLabel id="language-select-label">{t`Select Language`}</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                label={t`Select Language`}
                onChange={handleLanguageChange}
              >
                <MenuItem value={Language.EN}>English</MenuItem>
                <MenuItem value={Language.IT}>Italiano</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t`Choose your preferred language`}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
