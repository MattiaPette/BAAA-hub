import { LongRunWorkoutDetails } from '../../../types/tracker';

export interface LongRunWorkoutFormProps {
  value: LongRunWorkoutDetails | undefined;
  onChange: (details: Readonly<LongRunWorkoutDetails>) => void;
}
