import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { User } from '@baaa-hub/shared-types';
import { useAuth } from '../AuthProvider/AuthProvider';
import { checkProfileStatus } from '../../services/userService';

/**
 * User context value interface
 */
interface UserContextValue {
  user: User | null;
  hasProfile: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/**
 * User context for profile state
 */
const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider - manages user profile state across the application
 */
export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!token?.idToken || !isAuthenticated) {
      setUser(null);
      setHasProfile(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await checkProfileStatus(token.idToken);
      setHasProfile(response.hasProfile);
      setUser(response.user || null);
    } catch (err) {
      console.error('Failed to check profile status:', err);
      setError('Failed to load profile');
      setHasProfile(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  // Check profile status when authentication changes
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      hasProfile,
      isLoading,
      error,
      refreshUser,
      setUser,
    }),
    [user, hasProfile, isLoading, error, refreshUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Hook to access user context
 */
export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);

  if (!context) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
