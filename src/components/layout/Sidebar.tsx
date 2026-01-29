import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "../../lib/theme";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Resumen" },
  { to: "/inventario", icon: Package, label: "Inventario" },
  { to: "/configuracion", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update CSS variable for sidebar width
  useEffect(() => {
    const width = isMobile ? 0 : (collapsed ? 80 : 260);
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  }, [collapsed, isMobile]);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? (mobileOpen ? 260 : 0) : (collapsed ? 80 : 260),
          x: isMobile ? (mobileOpen ? 0 : -260) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border z-40 flex flex-col overflow-hidden
          ${isMobile ? "shadow-2xl" : ""}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3 overflow-hidden" onClick={() => isMobile && setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-bold text-lg gradient-text whitespace-nowrap">
                  Soulsisters
                </h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Inventario de Joyería
                </p>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-sm">
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Sun className="w-5 h-5 flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="whitespace-nowrap overflow-hidden text-sm">
                {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
              </span>
            )}
          </button>

          {/* Collapse Toggle - Desktop only */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              ) : (
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              )}
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden text-sm">
                  Colapsar
                </span>
              )}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
