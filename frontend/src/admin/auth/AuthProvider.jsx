import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ensureCsrf } from '@/api/client';
import { authApi } from '../api/resources';
import { adminKeys } from '../api/keys';
import { can as hasPermission } from '../lib/permissions';
import { AuthContext } from './AuthContext';

/** Removes every cached admin response except the (now null) session query. */
const dropAdminData = (queryClient) =>
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] !== 'me' });

/**
 * Session state for the admin app, backed by `GET /auth/me` (Sanctum cookie).
 * Also reacts to the `auth:unauthenticated` event the axios interceptor fires
 * on any 401, so an expired session sends the user back to the login screen.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [sessionExpired, setSessionExpired] = useState(false);

  const meQuery = useQuery({
    queryKey: adminKeys.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
  });
  const user = meQuery.data ?? null;

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const onUnauthenticated = () => {
      if (userRef.current) setSessionExpired(true);
      queryClient.setQueryData(adminKeys.me, null);
      dropAdminData(queryClient);
    };
    window.addEventListener('auth:unauthenticated', onUnauthenticated);
    return () => window.removeEventListener('auth:unauthenticated', onUnauthenticated);
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (authenticated) => {
      setSessionExpired(false);
      queryClient.setQueryData(adminKeys.me, authenticated);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      setSessionExpired(false);
      queryClient.setQueryData(adminKeys.me, null);
      dropAdminData(queryClient);
      // The session was invalidated: fetch a fresh CSRF cookie for the next login.
      await ensureCsrf(true).catch(() => {});
    },
  });

  const login = useCallback((credentials) => loginMutation.mutateAsync(credentials), [loginMutation]);
  const logout = useCallback(() => logoutMutation.mutateAsync().catch(() => {}), [logoutMutation]);
  const refetch = meQuery.refetch;

  const status = meQuery.isPending ? 'loading' : meQuery.isError ? 'error' : user ? 'authenticated' : 'guest';

  const value = useMemo(
    () => ({
      user,
      status,
      sessionExpired,
      login,
      logout,
      isLoggingOut: logoutMutation.isPending,
      refetch,
      can: (permission) => hasPermission(user, permission),
    }),
    [user, status, sessionExpired, login, logout, logoutMutation.isPending, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
