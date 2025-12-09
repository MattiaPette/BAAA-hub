import { FC } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { CalendarHeaderProps } from './CalendarHeader.model';

/**
 * CalendarHeader component for navigating between months and selecting calendars
 * Displays the current month/year, navigation arrows, and calendar selector
 * Uses date-fns locale for proper month name translation
 */
export const CalendarHeader: FC<CalendarHeaderProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  calendars,
  selectedCalendarId,
  onCalendarSelect,
}) => {
  const { i18n } = useLingui();

  // Map lingui locale to date-fns locale
  const dateFnsLocale = i18n.locale === 'it' ? it : enUS;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Month navigation */}
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

      {/* Calendar selector */}
      <FormControl fullWidth size="small">
        <Select
          value={selectedCalendarId}
          onChange={e => onCalendarSelect(e.target.value)}
          aria-label={t`Select calendar`}
          sx={{
            backgroundColor: theme => theme.palette.background.paper,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            },
          }}
        >
          {calendars.map(calendar => (
            <MenuItem key={calendar.id} value={calendar.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: calendar.color,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <Typography variant="body2">{calendar.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
