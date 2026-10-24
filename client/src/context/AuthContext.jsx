import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api, tokenStore } from '@/lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.auth
      .me()
      .then((d) => setUser(d.user))
      .catch((e) => { if (e.status === 401) tokenStore.clear(); })
      .finally(() => setReady(true));
  }, []);

  const finish = useCallback((data) => {
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login: async (b) => finish(await api.auth.login(b)),
      register: async (b) => finish(await api.auth.register(b)),
      logout: () => { tokenStore.clear(); setUser(null); },
    }),
    [user, ready, finish]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
