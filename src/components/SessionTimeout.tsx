import { useAuth } from "../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";

export function SessionTimeout() {
  const { showWarning, timeRemaining, extendSession, logout } = useAuth();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Sesión por expirar
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tiempo restante: {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Su sesión expirará pronto. Si desea continuar trabajando, 
                    extienda su sesión. De lo contrario, será desconectado 
                    automáticamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={logout}
                  className="flex-1 py-2.5 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Cerrar Sesión
                </button>
                <button
                  onClick={extendSession}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Extender Sesión
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
