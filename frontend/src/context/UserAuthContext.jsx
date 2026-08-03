import { useCallback, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../utils/api";
import { UserAuthContext } from "./user-auth-context";

const TOKEN_KEY = "portfolio_user_token";
const USER_KEY = "portfolio_user_data";

// Separate from the admin/employee AuthContext under src/admin — this one
// is for public site visitors who register to rate & review employees and
// projects. Deliberately its own localStorage key so a signed-in admin
// session in another tab is never confused with a visitor session.
export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  }, [user]);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    window.localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    window.localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user, login, register, logout]
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}
