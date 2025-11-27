import { useQuery } from '@tanstack/react-query';
import { User } from '@baaa-hub/shared-types';
import { getCurrentUser } from '../../services/userService';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';

/**
 * Custom hook to fetch and manage the current user's profile data.
 * Uses TanStack Query for caching and automatic refetching.
 *
 * @returns Query result containing user data, loading state, and error state
 *
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useCurrentUser();
 *
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!user) return null;
 *
 * return <div>{user.name} {user.surname}</div>;
 * ```
 */
export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuth();

  return useQuery<User, Error>({
    queryKey: ['currentUser', token?.idToken],
    queryFn: async () => {
      if (!token?.idToken) {
        throw new Error('No authentication token available');
      }
      return getCurrentUser(token.idToken);
    },
    enabled: isAuthenticated && !!token?.idToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
