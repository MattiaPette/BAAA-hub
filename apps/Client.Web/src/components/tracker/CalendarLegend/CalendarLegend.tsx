import { FC } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Trans } from '@lingui/react/macro';

import { CalendarLegendProps } from './CalendarLegend.model';

/**
 * CalendarLegend component displays a legend with chips for each calendar
 * Users can click on chips to enable/disable calendars in the combined view
 */
export const CalendarLegend: FC<CalendarLegendProps> = ({
  calendars,
  enabledCalendarIds,
  onToggleCalendar,
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
      <Trans>Calendars</Trans>
    </Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {calendars.map(calendar => {
        const isEnabled = enabledCalendarIds.has(calendar.id);
        return (
          <Chip
            key={calendar.id}
            label={calendar.name}
            onClick={() => onToggleCalendar(calendar.id)}
            sx={{
              backgroundColor: isEnabled ? calendar.color : 'transparent',
              color: isEnabled
                ? theme => theme.palette.getContrastText(calendar.color)
                : theme => theme.palette.text.primary,
              border: theme =>
                isEnabled ? 'none' : `1px solid ${theme.palette.divider}`,
              opacity: isEnabled ? 1 : 0.6,
              cursor: 'pointer',
              '&:hover': {
                opacity: isEnabled ? 0.8 : 1,
              },
            }}
          />
        );
      })}
    </Stack>
  </Box>
);
