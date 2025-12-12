import { t } from '@lingui/core/macro';
import { WorkoutType } from '../../types/tracker';

/**
 * Get human-readable label for workout type
 * Uses lingui for i18n support
 */
export const getWorkoutTypeLabel = (type: WorkoutType): string => {
  switch (type) {
    case WorkoutType.RUN:
      return t`Run`;
    case WorkoutType.GYM:
      return t`Gym`;
    case WorkoutType.LONG_RUN:
      return t`Long Run`;
    case WorkoutType.RECOVERY:
      return t`Recovery`;
    case WorkoutType.INTERVAL_TRAINING:
      return t`Interval Training`;
    case WorkoutType.CYCLING:
      return t`Cycling`;
    default:
      return t`Unknown`;
  }
};

/**
 * Get all workout type options for select input
 */
export const getWorkoutTypeOptions = (): Array<{
  value: WorkoutType;
  label: string;
}> => [
  { value: WorkoutType.RUN, label: getWorkoutTypeLabel(WorkoutType.RUN) },
  { value: WorkoutType.GYM, label: getWorkoutTypeLabel(WorkoutType.GYM) },
  {
    value: WorkoutType.LONG_RUN,
    label: getWorkoutTypeLabel(WorkoutType.LONG_RUN),
  },
  {
    value: WorkoutType.RECOVERY,
    label: getWorkoutTypeLabel(WorkoutType.RECOVERY),
  },
  {
    value: WorkoutType.INTERVAL_TRAINING,
    label: getWorkoutTypeLabel(WorkoutType.INTERVAL_TRAINING),
  },
  {
    value: WorkoutType.CYCLING,
    label: getWorkoutTypeLabel(WorkoutType.CYCLING),
  },
];
