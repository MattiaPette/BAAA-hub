import { FC, useCallback, useState } from 'react';

import { IconButton, Stack, ThemeProvider, Typography } from '@mui/material';

import ReplayIcon from '@mui/icons-material/Replay';

import { Trans } from '@lingui/react/macro';
import { initTheme } from '../../../../theme/theme';

import { Layout } from '../../layouts/Layout/Layout';

import logo from '../../../../assets/vite.svg';

import { RootErrorFallbackProps } from './RootErrorFallback.model';
import { useLanguageContext } from '../../../../providers/LanguageProvider/LanguageProvider';

const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Fallback function to handle errors at the root level of the application.
 * This function displays an error message and a button to reset the application.
 *
 * @param {object} props - The properties passed to the function.
 * @param {Error} props.error - The error object that caused the fallback.
 * @param {Function} props.resetErrorBoundary - Function to reset the application after an error.
 *
 * @returns {JSX.Element} A JSX element representing the error fallback page.
 */
export const RootErrorFallback: FC<RootErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const [language] = useLanguageContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    setIsLoading(true);
    resetErrorBoundary();
  }, [resetErrorBoundary]);

  console.error(error);

  return (
    <ThemeProvider theme={initTheme('dark', language)}>
      <Stack
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Layout
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          endAdornment={
            <Typography
              color="textPrimary"
              variant="body2"
              sx={{
                opacity: 0.75,
                /**
                 * Funzione che restituisce lo spazio del tema specificato.
                 * Questa funzione è comunemente usata per ottenere lo spazio coerente in base al tema corrente.
                 *
                 * @param {Object} theme - L'oggetto tema da cui ottenere lo spazio.
                 * @returns {number} Lo spazio del tema specificato.
                 *
                 * @example
                 * // Ritorna 4 se il tema ha uno spazio di 4
                 * theme => theme.spacing(4)
                 */
                margin: 'auto',
                padding: theme => theme.spacing(4),
              }}
            >
              &copy;{new Date().getFullYear()} COPYRIGHT
            </Typography>
          }
        >
          <Stack
            spacing={4}
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <img src={logo} alt="Logo" />

            <Typography color="textPrimary" variant="h5">
              <Trans>Oh no! Something went wrong...</Trans>
            </Typography>

            <IconButton loading={isLoading} size="large" onClick={handleClick}>
              <ReplayIcon />
            </IconButton>

            {IS_DEVELOPMENT && (
              <Stack
                component="pre"
                /**
                 * Funzione che ritorna il valore di spaziatura del tema corrente.
                 * Questa funzione è tipicamente usata per ottenere la spaziatura coerente in base al tema attuale.
                 *
                 * @param {Object} theme - L'oggetto tema da cui ottenere la spaziatura.
                 * @returns {number} Il valore di spaziatura del tema.
                 * @example
                 * const spacing = theme => theme.spacing(2);
                 */
                sx={{
                  /**
                   * Funzione che restituisce il colore di sfondo predefinito del tema.
                   *
                   * @param {object} theme - L'oggetto tema da cui estrarre il colore di sfondo.
                   * @returns {string} Il colore di sfondo predefinito del tema.
                   *
                   * @example
                   * const backgroundColor = theme => theme.palette.background.default;
                   */
                  padding: theme => theme.spacing(2),
                  /**
                   * Funzione che restituisce il colore principale del tema.
                   *
                   * @param {object} theme - L'oggetto tema da cui estrarre il colore principale.
                   * @returns {string} Il colore principale del tema.
                   * @example
                   * // Ritorna il colore principale del tema
                   * theme => theme.palette.primary.main
                   */
                  backgroundColor: theme => theme.palette.background.default,
                  color: theme => theme.palette.primary.main,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {`${error.message}\n\n${error.stack}`}
              </Stack>
            )}
          </Stack>
        </Layout>
      </Stack>
    </ThemeProvider>
  );
};
