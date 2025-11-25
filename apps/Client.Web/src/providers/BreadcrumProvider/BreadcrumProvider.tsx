import { FC, createContext, useContext, useMemo, useState } from 'react';

import { t } from '@lingui/core/macro';

import {
  BreadcrumContextValue,
  BreadcrumProviderProps,
} from './BreadcrumProvider.model';

export const BreadcrumContext = createContext<
  BreadcrumContextValue | undefined
>(undefined);

/**
 * Provider component that manages breadcrumb/page title state.
 * Initializes with a default "Dashboard" title and provides context to child components.
 *
 * @param {BreadcrumProviderProps} props - Component props
 * @param {ReactNode} props.children - Child components that will have access to breadcrumb context
 *
 * @returns {JSX.Element} A React context provider for breadcrumb state
 *
 * @example
 * <BreadcrumProvider>
 *   <MyApp />
 * </BreadcrumProvider>
 */
export const BreadcrumProvider: FC<BreadcrumProviderProps> = ({ children }) => {
  const [title, setTitle] = useState<string>(t`Dashboard`);

  const value = useMemo(
    () => ({
      title,
      setTitle,
    }),
    [title, setTitle],
  );

  return (
    <BreadcrumContext.Provider value={value}>
      {children}
    </BreadcrumContext.Provider>
  );
};

/**
 * Custom hook that provides access to the breadcrumb context.
 * Must be used within a BreadcrumProvider.
 *
 * @returns {NonNullable<BreadcrumContextValue>} The breadcrumb context value containing title and setTitle
 *
 * @throws {Error} If used outside of a BreadcrumProvider
 *
 * @example
 * const { title, setTitle } = useBreadcrum();
 * setTitle('New Page Title');
 */
export const useBreadcrum = (): NonNullable<BreadcrumContextValue> => {
  const context = useContext(BreadcrumContext);

  if (!context) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error('useBreadcrum must be used within a BreadcrumProvider');
  }

  return context;
};
