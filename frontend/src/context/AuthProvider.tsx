import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("cmpc_auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      // parsed could be either the normalized payload or an envelope
      const payload = parsed && parsed.data ? parsed.data : parsed;
      setUser(payload.user || null);
      if (payload.access_token) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${payload.access_token}`;
      }
    }
    setInitialized(true);
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await axios.post("/auth/login", { email, password });
    // backend returns an envelope: { success, statusCode, message, data: { access_token, ... } }
    const envelope = resp.data;
    const payload = envelope && envelope.data ? envelope.data : envelope;
    // persist normalized payload
    localStorage.setItem("cmpc_auth", JSON.stringify(payload));
    if (payload.access_token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${payload.access_token}`;
    }
    setUser(payload.user || null);
    setInitialized(true);
  };

  const logout = () => {
    localStorage.removeItem("cmpc_auth");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // Don't render children until we've checked localStorage to avoid redirect flashes
  if (!initialized) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>Inicializando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
