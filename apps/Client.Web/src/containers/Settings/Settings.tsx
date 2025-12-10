import { FC, useEffect, useState, SyntheticEvent } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import NoEncryptionIcon from '@mui/icons-material/NoEncryption';
import PaletteIcon from '@mui/icons-material/Palette';
import LockIcon from '@mui/icons-material/Lock';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useSnackbar } from 'notistack';

import { MfaType } from '@baaa-hub/shared-types';
import { useLanguageContext } from '../../providers/LanguageProvider/LanguageProvider';
import { Language } from '../../providers/LanguageProvider/LanguageProvider.model';
import { useThemeModeContext } from '../../providers/ThemeProvider/ThemeProvider';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { useUser } from '../../providers/UserProvider/UserProvider';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import {
  getMfaTypeLabels,
  getMfaTypeDescriptions,
} from '../../helpers/mfaLabels';
import { TrainingGoals } from '../../components/settings/TrainingGoals/TrainingGoals';

/**
 * TabPanel component for rendering tab content
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

/**
 * Settings page component that allows users to configure application preferences.
 * Includes theme mode switcher (light/dark), language selector, and security settings.
 * Security settings are only visible when the user is authenticated.
 *
 * @returns {JSX.Element} The settings page with theme, language, and security controls.
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
  const { user } = useUser();
  const { isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Get translated MFA labels
  const mfaTypeLabels = getMfaTypeLabels();
  const mfaTypeDescriptions = getMfaTypeDescriptions();

  useEffect(() => {
    setTitle(t`Settings`);
  }, [setTitle, i18n.locale]);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label={t`Settings tabs`}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<PaletteIcon />}
            iconPosition="start"
            label={t`Appearance`}
            id="settings-tab-0"
            aria-controls="settings-tabpanel-0"
          />
          <Tab
            icon={<LockIcon />}
            iconPosition="start"
            label={t`Account Security`}
            id="settings-tab-1"
            aria-controls="settings-tabpanel-1"
            disabled={!isAuthenticated}
          />
          <Tab
            icon={<FitnessCenterIcon />}
            iconPosition="start"
            label={t`Training Goals`}
            id="settings-tab-2"
            aria-controls="settings-tabpanel-2"
            disabled={!isAuthenticated}
          />
        </Tabs>
      </Box>

      {/* Appearance Tab */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
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
      </TabPanel>

      {/* Account Security Tab */}
      <TabPanel value={tabValue} index={1}>
        {!isAuthenticated ? (
          <Alert severity="info">
            <Trans>Please log in to access account security settings.</Trans>
          </Alert>
        ) : (
          <Stack spacing={3}>
            {/* Security Section */}
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <SecurityIcon color="primary" />
                  <Typography variant="h6">{t`Security`}</Typography>
                </Stack>

                {/* MFA Status Display */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t`Two-Factor Authentication (2FA)`}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    {user?.mfaEnabled ? (
                      <>
                        <Chip
                          icon={<SecurityIcon />}
                          label={mfaTypeLabels[user.mfaType]}
                          color="success"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {mfaTypeDescriptions[user.mfaType]}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Chip
                          icon={<NoEncryptionIcon />}
                          label={t`Not Enabled`}
                          color="default"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t`Your account does not have two-factor authentication enabled.`}
                        </Typography>
                      </>
                    )}
                  </Stack>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <Trans>
                        Two-factor authentication adds an extra layer of
                        security to your account. To enable or manage 2FA, you
                        will be prompted during your next login, or you can
                        contact an administrator for assistance.
                      </Trans>
                    </Typography>
                  </Alert>

                  {/* MFA Options Explanation */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t`Available MFA Methods:`}
                    </Typography>
                    <Stack spacing={1} sx={{ pl: 2 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          component="span"
                        >
                          {mfaTypeLabels[MfaType.TOTP]}
                        </Typography>
                        <Chip
                          label={t`Recommended`}
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {mfaTypeDescriptions[MfaType.TOTP]}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {mfaTypeLabels[MfaType.EMAIL]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mfaTypeDescriptions[MfaType.EMAIL]}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>

                {/* Email Verification Status */}
                <Box
                  sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t`Email Verification`}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {user?.isEmailVerified ? (
                      <Chip label={t`Verified`} color="success" size="small" />
                    ) : (
                      <Chip
                        label={t`Not Verified`}
                        color="warning"
                        size="small"
                      />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {user?.isEmailVerified
                        ? t`Your email address has been verified.`
                        : t`Please verify your email address for enhanced security.`}
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        )}
      </TabPanel>

      {/* Training Goals Tab */}
      <TabPanel value={tabValue} index={2}>
        {!isAuthenticated ? (
          <Alert severity="info">
            <Trans>Please log in to access training goals settings.</Trans>
          </Alert>
        ) : (
          <TrainingGoals />
        )}
      </TabPanel>
    </Box>
  );
};
