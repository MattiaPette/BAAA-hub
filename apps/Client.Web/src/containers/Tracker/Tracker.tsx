import { FC, useState, useMemo, useEffect } from 'react';
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
import { useLingui } from '@lingui/react';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { CalendarHeader } from '../../components/tracker/CalendarHeader/CalendarHeader';
import { CalendarView } from '../../components/tracker/CalendarView/CalendarView';
import { CalendarSidebar } from '../../components/tracker/CalendarSidebar/CalendarSidebar';
import { AddWorkoutDialog } from '../../components/tracker/AddWorkoutDialog/AddWorkoutDialog';
import { WorkoutDetailsDialog } from '../../components/tracker/WorkoutDetailsDialog/WorkoutDetailsDialog';
import {
  mockCalendars,
  mockWorkouts as initialMockWorkouts,
} from '../../data/mockTrackerData';
import { WorkoutType, Workout } from '../../types/tracker';

/**
 * Tracker container component
 * Displays a monthly calendar view for tracking workouts
 * Uses mocked data with working add/edit/delete functionality
 *
 * NOTE: This component uses date-fns (MIT licensed) for date manipulation
 * https://github.com/date-fns/date-fns/blob/main/LICENSE.md
 */
export const Tracker: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setTitle } = useBreadcrum();
  const { i18n } = useLingui();

  // Set breadcrumb title
  useEffect(() => {
    setTitle(t`Tracker`);
  }, [setTitle, i18n.locale]);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(
    mockCalendars[0].id,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [workouts, setWorkouts] = useState<Workout[]>(initialMockWorkouts);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] =
    useState<boolean>(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Filter workouts by selected calendar
  const filteredWorkouts = useMemo(
    () => workouts.filter(workout => workout.calendarId === selectedCalendarId),
    [workouts, selectedCalendarId],
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingWorkout(null);
    setIsDialogOpen(true);
  };

  const handleWorkoutClick = (workout: Readonly<Workout>) => {
    setSelectedWorkout(workout);
    setIsDetailsDialogOpen(true);
  };

  const handleAddWorkout = (
    newWorkoutData: Readonly<{
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      type: WorkoutType;
    }>,
  ) => {
    if (!selectedDate) return;

    if (editingWorkout) {
      // Update existing workout
      setWorkouts(prev =>
        prev.map(w =>
          w.id === editingWorkout.id
            ? {
                ...w,
                startHour: newWorkoutData.startHour,
                startMinute: newWorkoutData.startMinute,
                endHour: newWorkoutData.endHour,
                endMinute: newWorkoutData.endMinute,
                type: newWorkoutData.type,
              }
            : w,
        ),
      );
    } else {
      // Add new workout
      const newWorkout: Workout = {
        id: `workout-${Date.now()}`,
        date: selectedDate,
        startHour: newWorkoutData.startHour,
        startMinute: newWorkoutData.startMinute,
        endHour: newWorkoutData.endHour,
        endMinute: newWorkoutData.endMinute,
        type: newWorkoutData.type,
        calendarId: selectedCalendarId,
      };
      setWorkouts(prev => [...prev, newWorkout]);
    }
  };

  const handleEditWorkout = (workout: Readonly<Workout>) => {
    setSelectedDate(workout.date);
    setEditingWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
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
          onWorkoutClick={handleWorkoutClick}
        />
      </Box>

      {/* Add/Edit Workout Dialog */}
      <AddWorkoutDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingWorkout(null);
        }}
        onSubmit={handleAddWorkout}
        selectedDate={selectedDate}
        editingWorkout={editingWorkout}
        existingWorkouts={workouts}
      />

      {/* Workout Details Dialog */}
      <WorkoutDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        workout={selectedWorkout}
        onEdit={handleEditWorkout}
        onDelete={handleDeleteWorkout}
      />
    </Box>
  );
};
