import { FC, useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { addMonths, subMonths } from 'date-fns';
import { t } from '@lingui/core/macro';

import { CalendarHeader } from '../../components/tracker/CalendarHeader/CalendarHeader';
import { CalendarView } from '../../components/tracker/CalendarView/CalendarView';
import { CalendarSidebar } from '../../components/tracker/CalendarSidebar/CalendarSidebar';
import { AddWorkoutDialog } from '../../components/tracker/AddWorkoutDialog/AddWorkoutDialog';
import { mockCalendars, mockWorkouts } from '../../data/mockTrackerData';
import { WorkoutType } from '../../types/tracker';

/**
 * Tracker container component
 * Displays a monthly calendar view for tracking workouts
 * Uses only mocked data - no backend integration
 *
 * NOTE: This component uses date-fns (MIT licensed) for date manipulation
 * https://github.com/date-fns/date-fns/blob/main/LICENSE.md
 */
export const Tracker: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(
    mockCalendars[0].id,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Filter workouts by selected calendar
  const filteredWorkouts = useMemo(
    () =>
      mockWorkouts.filter(workout => workout.calendarId === selectedCalendarId),
    [selectedCalendarId],
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleAddWorkout = (
    _workout: Readonly<{
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      type: WorkoutType;
    }>,
  ) => {
    // In a real app, this would add the workout to the backend
    // For now, this is just a UI prototype with mocked data
    // Workout data would be: { ..._workout, date: selectedDate }
  };

  const sidebar = (
    <CalendarSidebar
      calendars={mockCalendars}
      selectedCalendarId={selectedCalendarId}
      onCalendarSelect={setSelectedCalendarId}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <IconButton
          onClick={() => setIsSidebarOpen(true)}
          sx={{
            position: 'fixed',
            top: 72,
            left: 16,
            zIndex: 1200,
            backgroundColor: theme => theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme => theme.palette.action.hover,
            },
          }}
          aria-label={t`Open calendar list`}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar - Drawer on mobile, permanent on desktop */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              pt: 8,
            },
          }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            p: 2,
            borderRight: theme => `1px solid ${theme.palette.divider}`,
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Main calendar area */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          overflow: 'auto',
        }}
      >
        <CalendarHeader
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        <CalendarView
          currentMonth={currentMonth}
          workouts={filteredWorkouts}
          onDayClick={handleDayClick}
        />
      </Box>

      {/* Add Workout Dialog */}
      <AddWorkoutDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddWorkout}
        selectedDate={selectedDate}
      />
    </Box>
  );
};
