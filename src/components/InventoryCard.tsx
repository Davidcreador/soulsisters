import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Package,
  AlertCircle
} from "lucide-react";
import { formatCurrency, getCategoryLabel, getStatusLabel, getStatusColor } from "../lib/utils";
import type { Product } from "../types";

interface InventoryCardProps {
  product: Product;
  onSell: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const categoryColors: Record<string, string> = {
  necklaces: "bg-rose-100 text-rose-800 border-rose-200",
  earrings: "bg-purple-100 text-purple-800 border-purple-200",
  bracelets: "bg-blue-100 text-blue-800 border-blue-200",
  rings: "bg-amber-100 text-amber-800 border-amber-200",
  sets: "bg-emerald-100 text-emerald-800 border-emerald-200",
  other: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export function InventoryCard({ product, onSell, onEdit, onDelete }: InventoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isUncategorized = product.category === "other";
  const categoryColor = categoryColors[product.category] || categoryColors.other;

  return (
    <motion.div
      layout
      className="relative bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-3"
    >
      {/* Main Content - Always Visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="w-[60px] h-[60px] rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate pr-2">
                {product.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Priority Info */}
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="font-medium text-foreground">
                {formatCurrency(product.storePrice)}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className={`font-medium ${
                product.quantity === 0 
                  ? "text-red-600" 
                  : product.quantity <= 2 
                    ? "text-orange-600" 
                    : "text-green-600"
              }`}>
                {product.quantity} unidades
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          {product.status !== "sold" && product.quantity > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSell(product);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm active:scale-95 transition-transform min-h-[44px]"
            >
              <ShoppingCart className="w-4 h-4" />
              Vender
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm active:scale-95 transition-transform min-h-[44px]"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="border-t border-border bg-muted/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-3">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categoría</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isUncategorized 
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                    : categoryColor
                }`}>
                  {isUncategorized && <AlertCircle className="w-3 h-3" />}
                  {getCategoryLabel(product.category)}
                </span>
              </div>

              {/* Sale Price */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Precio Venta</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(product.suggestedPrice)}
                </span>
              </div>

              {/* Profit */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ganancia</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {product.profitPercentage}%
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {getStatusLabel(product.status)}
                </span>
              </div>

              {/* Notes */}
              {product.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Notas</span>
                  <p className="text-sm text-foreground">{product.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
