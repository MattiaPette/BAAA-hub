import { RunWorkoutDetails } from '../../../types/tracker';

export interface RunWorkoutFormProps {
  value: RunWorkoutDetails | undefined;
  onChange: (details: Readonly<RunWorkoutDetails>) => void;
}
