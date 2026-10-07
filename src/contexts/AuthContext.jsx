/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();
const USER_KEY = "bookswap_user";
const TOKEN_KEY = "booktrade_token";

function normalizeUser(user) {
  return {
    ...user,
    id_usuario: Number(user.id_usuario),
    name: user.nome,
    role: user.tipo_usuario === "Administrador" ? "admin" : "user",
  };
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setUser(null);
    };
    window.addEventListener("booktrade:unauthorized", onUnauthorized);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      clearSession();
      return () => window.removeEventListener("booktrade:unauthorized", onUnauthorized);
    }

    api.get("/auth/me")
      .then(({ data }) => {
        const currentUser = normalizeUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(clearSession)
      .finally(() => setAuthLoading(false));

    return () => window.removeEventListener("booktrade:unauthorized", onUnauthorized);
  }, []);

  async function login(email, senha) {
    const { data } = await api.post("/auth/login", { email, senha });
    const currentUser = normalizeUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
    return currentUser;
  }

  async function register(data) {
    await api.post("/usuarios", {
      nome: data.name,
      email: data.email,
      senha: data.password,
    });
    return login(data.email, data.password);
  }

  async function updateProfile(data) {
    const { data: savedUser } = await api.put(`/usuarios/${user.id_usuario}`, {
      nome: data.name,
      email: data.email,
      telefone: data.telefone || null,
    });
    const currentUser = normalizeUser(savedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
  }

  function logout() {
    clearSession();
    setUser(null);
    window.dispatchEvent(new Event("booktrade:logout"));
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
