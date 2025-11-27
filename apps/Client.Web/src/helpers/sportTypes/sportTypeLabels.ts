import { t } from '@lingui/core/macro';
import { SportType } from '@baaa-hub/shared-types';

/**
 * Get translated sport type labels for display
 * This function must be called at runtime to ensure proper translation
 */
export const getSportTypeLabel = (sport: SportType): string => {
  const labels: Record<SportType, string> = {
    [SportType.RUNNING]: t`Running`,
    [SportType.CYCLING]: t`Cycling`,
    [SportType.SWIMMING]: t`Swimming`,
    [SportType.TRIATHLON]: t`Triathlon`,
    [SportType.TRAIL_RUNNING]: t`Trail Running`,
    [SportType.HIKING]: t`Hiking`,
    [SportType.WALKING]: t`Walking`,
    [SportType.GYM]: t`Gym`,
    [SportType.CROSS_FIT]: t`CrossFit`,
    [SportType.OTHER]: t`Other`,
  };

  return labels[sport] || sport;
};

/**
 * Get all translated sport type labels as a record
 * This function must be called at runtime to ensure proper translation
 */
export const getSportTypeLabels = (): Record<SportType, string> => ({
  [SportType.RUNNING]: t`Running`,
  [SportType.CYCLING]: t`Cycling`,
  [SportType.SWIMMING]: t`Swimming`,
  [SportType.TRIATHLON]: t`Triathlon`,
  [SportType.TRAIL_RUNNING]: t`Trail Running`,
  [SportType.HIKING]: t`Hiking`,
  [SportType.WALKING]: t`Walking`,
  [SportType.GYM]: t`Gym`,
  [SportType.CROSS_FIT]: t`CrossFit`,
  [SportType.OTHER]: t`Other`,
});
