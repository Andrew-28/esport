// src/containers/Navigation/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { API_BASE_URL } from "../../config/apiConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = !!user && user.role === "admin";   // <-- ось воно

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          const data = await res.json();
          setUser({
            id: data._id || data.id,
            name: data.name,
            email: data.email,
            role: data.role || "user",
          });
        }
      } catch (err) {
        console.error("Помилка при отриманні поточного користувача", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (token, userData) => {
    if (token) {
      localStorage.setItem("token", token);
    }

    if (userData) {
      setUser(userData);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        setUser(null);
      } else {
        const data = await res.json();
        setUser({
          id: data._id || data.id,
          name: data.name,
          email: data.email,
          role: data.role || "user",
        });
      }
    } catch (err) {
      console.error("Помилка при login()/me", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,          // <-- додаємо сюди
        user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
