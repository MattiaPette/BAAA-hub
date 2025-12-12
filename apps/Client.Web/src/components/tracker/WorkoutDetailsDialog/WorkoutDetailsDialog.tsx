import { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import { useLingui } from '@lingui/react';

import { getWorkoutTypeLabel } from '../../../helpers/workoutTypeLabels/workoutTypeLabels';
import { WorkoutDetailsDialogProps } from './WorkoutDetailsDialog.model';
import { WorkoutType } from '../../../types/tracker';

/**
 * WorkoutDetailsDialog component for viewing and managing workout details
 * Allows users to view, edit, and delete workout events
 */
export const WorkoutDetailsDialog: FC<WorkoutDetailsDialogProps> = ({
  open,
  onClose,
  workout,
  onEdit,
  onDelete,
}) => {
  const { i18n } = useLingui();

  if (!workout) {
    return null;
  }

  const handleEdit = () => {
    onEdit(workout);
    onClose();
  };

  const handleDelete = () => {
    onDelete(workout.id);
    onClose();
  };

  const startTime = `${String(workout.startHour).padStart(2, '0')}:${String(workout.startMinute).padStart(2, '0')}`;
  const endTime = `${String(workout.endHour).padStart(2, '0')}:${String(workout.endMinute).padStart(2, '0')}`;

  // Map lingui locale to date-fns locale
  const dateFnsLocale = i18n.locale === 'it' ? it : enUS;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="workout-details-dialog-title"
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
          '&:hover': {
            backgroundColor: theme => theme.palette.action.hover,
          },
        }}
        aria-label={t`Close dialog`}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle id="workout-details-dialog-title">
        <Trans>Workout Details</Trans>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Date */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Trans>Date</Trans>
            </Typography>
            <Typography variant="body1">
              {format(workout.date, 'PPP', { locale: dateFnsLocale })}
            </Typography>
          </Box>

          <Divider />

          {/* Workout Type */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Trans>Workout Type</Trans>
            </Typography>
            <Typography variant="body1">
              {getWorkoutTypeLabel(workout.type)}
            </Typography>
          </Box>

          <Divider />

          {/* Time */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Trans>Time</Trans>
            </Typography>
            <Typography variant="body1">
              {startTime} - {endTime}
            </Typography>
          </Box>

          {/* Cycling Details - Only shown for CYCLING type */}
          {workout.type === WorkoutType.CYCLING && workout.cyclingDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <Trans>Cycling Details</Trans>
                </Typography>
                <Stack spacing={1}>
                  {workout.cyclingDetails.distance !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Distance:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.distance} km
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.averageSpeed !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Average Speed:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.averageSpeed} km/h
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.elevationGain !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Elevation Gain:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.elevationGain} m
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.averageHeartRate !== undefined && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Average Heart Rate:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.averageHeartRate} bpm
                      </Typography>
                    </Box>
                  )}
                  {workout.cyclingDetails.notes && (
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        <Trans>Notes:</Trans>
                      </Typography>
                      <Typography variant="body2">
                        {workout.cyclingDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', margin: 2 }}>
        <Button
          onClick={handleDelete}
          startIcon={<DeleteIcon />}
          color="error"
          variant="text"
          sx={{
            color: theme => theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme => theme.palette.error.main,
              color: theme => theme.palette.error.contrastText,
            },
          }}
        >
          <Trans>Delete</Trans>
        </Button>

        <Button
          onClick={handleEdit}
          startIcon={<EditIcon />}
          color="primary"
          variant="text"
          sx={{
            color: theme => theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.main,
              color: theme => theme.palette.primary.contrastText,
            },
          }}
        >
          <Trans>Edit</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
