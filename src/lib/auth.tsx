import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as jose from "jose";

const SECRET_KEY = new TextEncoder().encode("soulsisters-secret-key-2026");
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const WARNING_TIME = 15 * 60 * 1000; // 15 minutes before expiry

interface User {
  id: string;
  username: string;
  role: "admin" | "pos";
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  extendSession: () => void;
  showWarning: boolean;
  timeRemaining: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded users
const USERS = [
  { id: "1", username: "admin", password: "#Admin2026", role: "admin" as const, name: "Administrador" },
  { id: "2", username: "ventas", password: "2026#ventas", role: "pos" as const, name: "Vendedor" },
];

// Rate limiting storage
const loginAttempts: Record<string, { count: number; lockedUntil: number }> = {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);

  const validateToken = useCallback(async (token: string) => {
    try {
      const { payload } = await jose.jwtVerify(token, SECRET_KEY);
      setUser({
        id: payload.sub as string,
        username: payload.username as string,
        role: payload.role as "admin" | "pos",
        name: payload.name as string,
      });
    } catch {
      localStorage.removeItem("auth_token");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setShowWarning(false);
    setTimeRemaining(SESSION_DURATION);
  }, []);

  const extendSession = useCallback(async () => {
    if (!user) return;

    const token = await new jose.SignJWT({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("4h")
      .sign(SECRET_KEY);

    localStorage.setItem("auth_token", token);
    setShowWarning(false);
    setTimeRemaining(SESSION_DURATION);
  }, [user]);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      validateToken(token).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [validateToken]);

  // Re-validate token on location changes to prevent auth loss during navigation
  useEffect(() => {
    if (!user && !isLoading) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        validateToken(token);
      }
    }
  }, [user, isLoading, validateToken]);

  // Session timeout handler
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        logout();
        return;
      }

      try {
        const payload = jose.decodeJwt(token);
        const exp = payload.exp as number;
        const now = Math.floor(Date.now() / 1000);
        const remaining = (exp - now) * 1000;

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          logout();
        } else if (remaining <= WARNING_TIME) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch {
        logout();
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, logout]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check rate limiting
    const now = Date.now();
    const attempts = loginAttempts[username];
    
    if (attempts && attempts.lockedUntil > now) {
      const minutesLeft = Math.ceil((attempts.lockedUntil - now) / 60000);
      return { 
        success: false, 
        error: `Cuenta bloqueada. Intente nuevamente en ${minutesLeft} minutos.` 
      };
    }

    // Find user
    const user = USERS.find((u) => u.username === username && u.password === password);

    if (!user) {
      // Increment failed attempts
      if (!loginAttempts[username]) {
        loginAttempts[username] = { count: 0, lockedUntil: 0 };
      }
      loginAttempts[username].count++;

      if (loginAttempts[username].count >= 5) {
        loginAttempts[username].lockedUntil = now + 5 * 60 * 1000; // 5 minutes
        loginAttempts[username].count = 0;
        return { 
          success: false, 
          error: "Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos." 
        };
      }

      return { success: false, error: "Credenciales inválidas" };
    }

    // Reset attempts on success
    if (loginAttempts[username]) {
      delete loginAttempts[username];
    }

    // Create JWT token
    const token = await new jose.SignJWT({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("4h")
      .sign(SECRET_KEY);

    localStorage.setItem("auth_token", token);
    setUser({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        logout,
        extendSession,
        showWarning,
        timeRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
