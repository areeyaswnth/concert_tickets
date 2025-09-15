"use client";

import { API_BASE_URL } from "@/config/api";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

type AuthContextType = {
  token: string | null;
  role: "guest" | "user" | "admin";
  user: User | null;
  loading: boolean;
  setAuth: (token: string, role: "user" | "admin", user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"guest" | "user" | "admin">("guest");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role") as "user" | "admin" | null;

    if (savedToken) {
      setToken(savedToken);
      setRole(savedRole ?? "guest");

      fetch(`${API_BASE_URL}/user/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          const apiUser = await res.json();

          const userForContext: User = {
            _id: apiUser.id,
            name: apiUser.name || "",
            email: apiUser.email,
            role: apiUser.role,
          };
          setUser(userForContext);
        })
        .catch((err) => {
          console.error("Failed to parse user from /me:", err);
          logout(); 
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setAuth = (newToken: string, newRole: "user" | "admin", newUser: User) => {
    setToken(newToken);
    setRole(newRole);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setRole("guest");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, role, user, loading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
