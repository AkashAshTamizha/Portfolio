import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken, clearToken } from "../api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEmployeeRecord = useCallback(async () => {
    const [me, myEmployee] = await Promise.all([api.get("/auth/me"), api.get("/employees/me")]);
    setUser(me.data);
    setEmployee(myEmployee.data);
    return me.data;
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    loadEmployeeRecord()
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, [loadEmployeeRecord]);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.user.role !== "employee") {
      throw new Error("This login is for employees only.");
    }
    setToken(res.token);
    setUser(res.user);
    const myEmployee = await api.get("/employees/me");
    setEmployee(myEmployee.data);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setEmployee(null);
  }, []);

  const value = useMemo(
    () => ({ user, employee, setEmployee, loading, isAuthenticated: !!user, login, logout }),
    [user, employee, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
