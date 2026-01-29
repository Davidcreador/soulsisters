import type { Product, Category } from "../types";

// Formatear moneda en Colones Costarricenses (CRC)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Formatear fecha en español (DD/MM/YYYY)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Calcular porcentaje de ganancia
export const calculateProfitPercentage = (
  storePrice: number,
  suggestedPrice: number
): number => {
  if (storePrice === 0) return 0;
  return Math.round(((suggestedPrice - storePrice) / storePrice) * 100);
};

// Obtener etiqueta de categoría en español
export const getCategoryLabel = (category: Category): string => {
  const labels: Record<Category, string> = {
    necklaces: "Collares",
    earrings: "Aretes",
    bracelets: "Pulseras",
    rings: "Anillos",
    sets: "Sets",
    other: "Otros",
  };
  return labels[category];
};

// Obtener etiqueta de estado en español
export const getStatusLabel = (status: Product["status"]): string => {
  const labels: Record<Product["status"], string> = {
    available: "Disponible",
    sold: "Vendido",
    "low-stock": "Disponible",
  };
  return labels[status];
};

// Obtener color de estado
export const getStatusColor = (status: Product["status"]): string => {
  const colors: Record<Product["status"], string> = {
    available: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-800",
    "low-stock": "bg-orange-100 text-orange-800",
  };
  return colors[status];
};
