import { useAuth } from "../../lib/auth";
import { Sparkles, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

export function POSHeader() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="h-16 bg-background border-b border-border px-4 flex items-center justify-between">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">Soulsisters</h1>
              <p className="text-xs text-muted-foreground">Punto de Venta</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {user?.role === "admin" ? "Admin" : "Vendedor"}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
