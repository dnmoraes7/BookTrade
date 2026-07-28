/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const USER_KEY = "bookswap_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || "null"));
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  function login(email) {
    const name = email?.split("@")[0] || "Marina";
    setUser({ name: name.replace(/^./, (letter) => letter.toUpperCase()), email: email || "marina@bookswap.com", city: "São Paulo, SP", bio: "Leitora apaixonada por literatura brasileira e boas conversas.", role: email === "admin@bookswap.com" ? "admin" : "user" });
  }

  function register(data) {
    setUser({ name: data.name, email: data.email, city: "São Paulo, SP", bio: "", role: "user" });
  }

  function updateProfile(data) { setUser((current) => ({ ...current, ...data })); }
  function logout() { setUser(null); setNotifications(0); }

  return <AuthContext.Provider value={{ user, login, register, logout, updateProfile, notifications, setNotifications }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
