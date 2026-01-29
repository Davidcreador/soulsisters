import { useStats } from "../hooks/useInventory";
import { Package, TrendingUp, DollarSign, AlertCircle, ShoppingBag, Box } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export function Dashboard() {
  const stats = useStats();

  const statCards = [
    {
      title: "Total Productos",
      value: stats?.totalProducts ?? 0,
      icon: Box,
      color: "bg-blue-500",
    },
    {
      title: "En Stock",
      value: stats?.totalAvailable ?? 0,
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "Vendidos",
      value: stats?.totalSold ?? 0,
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
    {
      title: "Stock Bajo",
      value: stats?.lowStockCount ?? 0,
      icon: AlertCircle,
      color: "bg-orange-500",
    },
    {
      title: "Valor Inventario",
      value: formatCurrency(stats?.totalInventoryValue ?? 0),
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      title: "Ganancias",
      value: formatCurrency(stats?.totalProfit ?? 0),
      icon: TrendingUp,
      color: "bg-pink-500",
    },
  ];

  if (stats === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
