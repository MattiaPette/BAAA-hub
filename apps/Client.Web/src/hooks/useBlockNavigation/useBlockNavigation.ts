import { useEffect } from 'react';

/**
 * Hook that blocks user navigation (e.g., page refresh or use of browser "back" buttons)
 * when the `shouldBlock` property is set to `true`.
 * Uses the `beforeunload` event to prevent page closure or navigation.
 *
 * @param {boolean} shouldBlock - Indicates whether navigation should be blocked.
 * @returns {void} Does not return any value.
 *
 * @throws {Error} If the browser does not support the `beforeunload` event.
 *
 * @example
 * // To block navigation
 * useBlockNavigation(true);
 *
 * @example
 * // To allow navigation
 * useBlockNavigation(false);
 */
export const useBlockNavigation = (shouldBlock: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: Readonly<BeforeUnloadEvent>) => {
      if (shouldBlock) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock]);
};
