import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ThemeProvider } from "../lib/theme";
import { ToastProvider } from "../components/ui/ToastProvider";
import { motion } from "framer-motion";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <ToastProvider>
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
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
