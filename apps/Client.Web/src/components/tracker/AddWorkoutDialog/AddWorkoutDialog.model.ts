import {
  WorkoutType,
  Workout,
  GymWorkoutDetails,
  RecoveryWorkoutDetails,
} from '../../../types/tracker';

export interface AddWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    workout: Readonly<{
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      type: WorkoutType;
      gymDetails?: GymWorkoutDetails;
      recoveryDetails?: RecoveryWorkoutDetails;
    }>,
  ) => void;
  selectedDate: Date | null;
  editingWorkout?: Workout | null;
  existingWorkouts: Workout[];
}
