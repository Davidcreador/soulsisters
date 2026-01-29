import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Store,
  Package,
  Clock,
  Check,
  Lock
} from "lucide-react";
import { useToastContext } from "../components/ui/ToastProvider";

export const Route = createFileRoute("/configuracion")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Settings />
    </ProtectedRoute>
  ),
});

// Hardcoded users with state for password changes
const USERS_DATA = [
  { id: "1", username: "admin", role: "admin", name: "Administrador" },
  { id: "2", username: "ventas", role: "pos", name: "Vendedor" },
];

function Settings() {
  const { addToast } = useToastContext();
  const [activeTab, setActiveTab] = useState("users");
  
  // Password change state
  const [passwords, setPasswords] = useState({
    admin: { current: "", new: "", confirm: "" },
    ventas: { current: "", new: "", confirm: "" },
  });
  
  // System settings state
  const [settings, setSettings] = useState({
    lowStockThreshold: 2,
    sessionTimeout: 4,
    maxQuantityPerSale: 5,
  });

  const handlePasswordChange = (user: "admin" | "ventas") => {
    const userData = passwords[user];
    
    if (userData.new !== userData.confirm) {
      addToast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        type: "error",
      });
      return;
    }
    
    if (userData.new.length < 6) {
      addToast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
      return;
    }
    
    // In a real app, this would update the backend
    addToast({
      title: "Éxito",
      description: `Contraseña de ${user} actualizada correctamente`,
      type: "success",
    });
    
    setPasswords(prev => ({
      ...prev,
      [user]: { current: "", new: "", confirm: "" }
    }));
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soulsisters-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addToast({
      title: "Exportación exitosa",
      description: "Los datos han sido exportados correctamente",
      type: "success",
    });
  };

  const handleClearData = () => {
    if (confirm("¿Está seguro de que desea eliminar TODOS los datos? Esta acción no se puede deshacer.")) {
      addToast({
        title: "Datos eliminados",
        description: "Todos los datos han sido eliminados del sistema",
        type: "success",
      });
    }
  };

  const tabs = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "system", label: "Sistema", icon: Store },
    { id: "data", label: "Datos", icon: Package },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Configuración</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </h2>
            
            {USERS_DATA.map((user) => (
              <div key={user.id} className="border-b border-border last:border-0 pb-6 mb-6 last:pb-0 last:mb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">Usuario: {user.username}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      user.role === "admin" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role === "admin" ? "Administrador" : "Vendedor"}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Cambiar Contraseña
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="password"
                      placeholder="Contraseña actual"
                      value={passwords[user.username as "admin" | "ventas"].current}
                      onChange={(e) => setPasswords(prev => ({
                        ...prev,
                        [user.username]: { ...prev[user.username as "admin" | "ventas"], current: e.target.value }
                      }))}
                      className="px-3 py-2 bg-background border border-input rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={passwords[user.username as "admin" | "ventas"].new}
                      onChange={(e) => setPasswords(prev => ({
                        ...prev,
                        [user.username]: { ...prev[user.username as "admin" | "ventas"], new: e.target.value }
                      }))}
                      className="px-3 py-2 bg-background border border-input rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar contraseña"
                      value={passwords[user.username as "admin" | "ventas"].confirm}
                      onChange={(e) => setPasswords(prev => ({
                        ...prev,
                        [user.username]: { ...prev[user.username as "admin" | "ventas"], confirm: e.target.value }
                      }))}
                      className="px-3 py-2 bg-background border border-input rounded-lg text-sm"
                    />
                  </div>
                  
                  <button
                    onClick={() => handlePasswordChange(user.username as "admin" | "ventas")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md hover:opacity-90 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    Actualizar Contraseña
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Configuración del Sistema
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Umbral de Stock Bajo</h3>
                    <p className="text-sm text-muted-foreground">
                      Cantidad mínima antes de marcar como stock bajo
                    </p>
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 2 }))}
                  className="w-20 px-3 py-2 bg-background border border-input rounded-lg text-center"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Duración de Sesión</h3>
                    <p className="text-sm text-muted-foreground">
                      Horas antes de expirar la sesión
                    </p>
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 4 }))}
                  className="w-20 px-3 py-2 bg-background border border-input rounded-lg text-center"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Cantidad Máxima por Venta</h3>
                    <p className="text-sm text-muted-foreground">
                      Límite de unidades por transacción
                    </p>
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxQuantityPerSale}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxQuantityPerSale: parseInt(e.target.value) || 5 }))}
                  className="w-20 px-3 py-2 bg-background border border-input rounded-lg text-center"
                />
              </div>
            </div>
            
              <button
                onClick={() => addToast({
                  title: "Configuración guardada",
                  description: "Los cambios han sido aplicados correctamente",
                  type: "success",
                })}
                className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md hover:opacity-90 transition-all"
              >
                <Check className="w-4 h-4" />
                Guardar Cambios
              </button>
          </div>
        </motion.div>
      )}

      {/* Data Tab */}
      {activeTab === "data" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestión de Datos
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium">Exportar Datos</h3>
                    <p className="text-sm text-muted-foreground">
                      Descargar copia de seguridad de todos los datos
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg text-sm font-medium shadow-md hover:opacity-90 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Importar Datos</h3>
                    <p className="text-sm text-muted-foreground">
                      Restaurar datos desde un archivo de respaldo
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:opacity-90 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Importar
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={() => addToast({
                      title: "Importación",
                      description: "Función de importación en desarrollo",
                      type: "info",
                    })}
                  />
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-900">Zona de Peligro</h3>
                    <p className="text-sm text-red-700">
                      Eliminar todos los datos permanentemente
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-md hover:opacity-90 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Eliminar Todo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
