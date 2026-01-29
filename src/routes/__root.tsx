import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, Settings, Sparkles } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Soulsisters
                </h1>
                <p className="text-xs text-gray-500">Inventario de Joyeria</p>
              </div>
            </div>

            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                activeProps={{ className: "bg-pink-50 text-pink-700" }}
                inactiveProps={{ className: "text-gray-600 hover:bg-gray-100" }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Resumen
              </Link>

              <Link
                to="/inventario"
                activeProps={{ className: "bg-pink-50 text-pink-700" }}
                inactiveProps={{ className: "text-gray-600 hover:bg-gray-100" }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Package className="w-4 h-4" />
                Inventario
              </Link>

              <Link
                to="/configuracion"
                activeProps={{ className: "bg-pink-50 text-pink-700" }}
                inactiveProps={{ className: "text-gray-600 hover:bg-gray-100" }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configuracion
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link
            to="/"
            activeProps={{ className: "text-pink-600" }}
            inactiveProps={{ className: "text-gray-500" }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Resumen
          </Link>

          <Link
            to="/inventario"
            activeProps={{ className: "text-pink-600" }}
            inactiveProps={{ className: "text-gray-500" }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Package className="w-5 h-5" />
            Inventario
          </Link>

          <Link
            to="/configuracion"
            activeProps={{ className: "text-pink-600" }}
            inactiveProps={{ className: "text-gray-500" }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            Config.
          </Link>
        </div>
      </nav>
    </div>
  );
}
