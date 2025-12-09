import { FC } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
} from '@mui/material';
import { Trans } from '@lingui/react/macro';

import { CalendarSidebarProps } from './CalendarSidebar.model';

/**
 * CalendarSidebar component for selecting between different user calendars
 * Displays a list of available calendars (mocked users/trainees)
 */
export const CalendarSidebar: FC<CalendarSidebarProps> = ({
  calendars,
  selectedCalendarId,
  onCalendarSelect,
}) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      minWidth: { xs: 0, md: 240 },
    }}
    elevation={1}
  >
    <Typography variant="h6" gutterBottom>
      <Trans>Available Calendars</Trans>
    </Typography>
    <List>
      {calendars.map(calendar => (
        <ListItem key={calendar.id} disablePadding>
          <ListItemButton
            selected={calendar.id === selectedCalendarId}
            onClick={() => onCalendarSelect(calendar.id)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme => theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme => theme.palette.action.selected,
                },
              },
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: calendar.color,
                mr: 2,
              }}
              aria-hidden="true"
            />
            <ListItemText
              primary={calendar.name}
              primaryTypographyProps={{
                fontWeight: calendar.id === selectedCalendarId ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Paper>
);
