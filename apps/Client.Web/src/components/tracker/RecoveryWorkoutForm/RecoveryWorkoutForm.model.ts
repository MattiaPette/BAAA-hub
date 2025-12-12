import { RecoveryWorkoutDetails } from '../../../types/tracker';

export interface RecoveryWorkoutFormProps {
  value: RecoveryWorkoutDetails | undefined;
  onChange: (details: Readonly<RecoveryWorkoutDetails>) => void;
}
