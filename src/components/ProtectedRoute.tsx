import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"admin" | "pos">;
}

  export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  // Show loading while validating token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </motion.div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </motion.div>
      </div>
    );
  }

  // Check if user has permission
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">
            No tiene permisos para acceder a esta página.
          </p>
        <button
          onClick={() => window.location.href = "/"}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Volver al inicio
        </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
