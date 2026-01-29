import { useLocation, Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "/": "Resumen",
  "/inventario": "Inventario",
  "/configuracion": "Configuración",
};

export function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Don't show breadcrumb on home or ventas page
  if (pathname === "/" || pathname === "/ventas") return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Inicio</span>
      </Link>
      
      <ChevronRight className="w-4 h-4" />
      
      <span className="text-foreground font-medium">
        {routeNames[pathname] || pathname}
      </span>
    </nav>
  );
}
