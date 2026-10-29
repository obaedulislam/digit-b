import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/** `{ user, status: 'loading'|'authenticated'|'guest'|'error', sessionExpired, login, logout, refetch, can }` */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}
