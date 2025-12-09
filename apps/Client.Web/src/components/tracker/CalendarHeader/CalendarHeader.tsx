import { FC } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { CalendarHeaderProps } from './CalendarHeader.model';

/**
 * CalendarHeader component for navigating between months
 * Displays the current month/year and navigation arrows
 * Uses date-fns locale for proper month name translation
 */
export const CalendarHeader: FC<CalendarHeaderProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}) => {
  const { i18n } = useLingui();

  // Map lingui locale to date-fns locale
  const dateFnsLocale = i18n.locale === 'it' ? it : enUS;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        px: 1,
      }}
    >
      <IconButton
        onClick={onPreviousMonth}
        aria-label={t`Previous month`}
        sx={{
          '&:hover': {
            backgroundColor: theme => theme.palette.action.hover,
          },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {format(currentMonth, 'MMMM yyyy', { locale: dateFnsLocale })}
      </Typography>

      <IconButton
        onClick={onNextMonth}
        aria-label={t`Next month`}
        sx={{
          '&:hover': {
            backgroundColor: theme => theme.palette.action.hover,
          },
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};
