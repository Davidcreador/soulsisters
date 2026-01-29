import { useState } from "react";
import { useStats, useProducts } from "../hooks/useInventory";
import { getCategoryLabel } from "../lib/utils";
import { motion } from "framer-motion";
import { ProductModal } from "./ProductModal";
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ShoppingBag,
  Box,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useNavigate } from "@tanstack/react-router";

const COLORS = ["#f43f5e", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#6b7280"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={value}
      className="text-3xl font-bold text-foreground"
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Background decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-10`} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trendUp ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </motion.div>
  );
}

function CategoryChart({ products }: { products: any[] }) {
  const categoryData = products?.reduce((acc, product) => {
    const category = product.category;
    const existing = acc.find((item: any) => item.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, []) || [];

  const data = categoryData.map((item: any) => ({
    name: getCategoryLabel(item.name),
    value: item.value,
  }));

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl bg-card border border-border p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Distribución por Categoría</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface QuickActionsProps {
  onAddProduct: () => void;
}

function QuickActions({ onAddProduct }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 p-6 text-white shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={onAddProduct}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
        >
          <Package className="w-5 h-5" />
          <span>Agregar Producto</span>
        </button>
        <button 
          onClick={() => navigate({ to: "/inventario" })}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Registrar Venta</span>
        </button>
        <button 
          onClick={() => navigate({ to: "/configuracion" })}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
        >
          <TrendingUp className="w-5 h-5" />
          <span>Ver Reportes</span>
        </button>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const stats = useStats();
  const products = useProducts();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  if (stats === undefined || products === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Productos",
      value: stats.totalProducts,
      icon: Box,
      color: "bg-blue-500",
    },
    {
      title: "En Stock",
      value: stats.totalAvailable,
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "Vendidos",
      value: stats.totalSold,
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockCount,
      icon: AlertCircle,
      color: "bg-orange-500",
    },
    {
      title: "Valor Inventario",
      value: stats.totalInventoryValue,
      icon: DollarSign,
      color: "bg-emerald-500",
      prefix: "₡",
    },
    {
      title: "Ganancias",
      value: stats.totalProfit,
      icon: TrendingUp,
      color: "bg-rose-500",
      prefix: "₡",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ¡Bienvenida de vuelta! 👋
        </h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tu inventario de joyería
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryChart products={products} />
        </div>
        <div>
          <QuickActions onAddProduct={() => setIsProductModalOpen(true)} />
        </div>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={null}
      />
    </motion.div>
  );
}
