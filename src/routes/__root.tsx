import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { POSHeader } from "../components/pos/POSHeader";
import { SessionTimeout } from "../components/SessionTimeout";
import { ThemeProvider } from "../lib/theme";
import { ToastProvider } from "../components/ui/ToastProvider";
import { AuthProvider, useAuth } from "../lib/auth";
import { motion } from "framer-motion";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const isPOSPage = location.pathname === "/ventas";
  const isLoginPage = location.pathname === "/login";

  // Login page doesn't need any layout
  if (isLoginPage) {
    return <Outlet />;
  }

  // Not authenticated - ProtectedRoute will handle redirect
  if (!isLoading && !isAuthenticated) {
    return <Outlet />;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // POS user - show simplified header, no sidebar
  if (user?.role === "pos" || isPOSPage) {
    return (
      <div className="min-h-screen bg-background">
        <POSHeader />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          <Outlet />
        </motion.main>
        <SessionTimeout />
      </div>
    );
  }

  // Admin user - show full layout with sidebar
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 260px)" }}
      >
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          <Outlet />
        </div>
      </motion.main>
      <SessionTimeout />
    </div>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootContent />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
