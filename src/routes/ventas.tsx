import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useProducts, useSellProduct } from "../hooks/useInventory";
import { formatCurrency } from "../lib/utils";
import { useToastContext } from "../components/ui/ToastProvider";
import { Search, Grid3X3, List, Package, WifiOff, Check, Plus, Minus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "../components/ProtectedRoute";

const categories = [
  { value: "all", label: "Todos" },
  { value: "necklaces", label: "Collares" },
  { value: "earrings", label: "Aretes" },
  { value: "bracelets", label: "Pulseras" },
  { value: "rings", label: "Anillos" },
  { value: "sets", label: "Sets" },
  { value: "other", label: "Otros" },
];

interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  timestamp: number;
  synced: boolean;
}

export const Route = createFileRoute("/ventas")({
  component: VentasWithAuth,
});

function VentasWithAuth() {
  return (
    <ProtectedRoute allowedRoles={["admin", "pos"]}>
      <Ventas />
    </ProtectedRoute>
  );
}

function Ventas() {
  const products = useProducts();
  const sellProduct = useSellProduct();
  const { addToast } = useToastContext();

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [undoSale, setUndoSale] = useState<SaleRecord | null>(null);
  const [undoTimer, setUndoTimer] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Undo timer countdown
  useEffect(() => {
    if (undoSale && undoTimer > 0) {
      const timer = setInterval(() => {
        setUndoTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (undoTimer === 0) {
      setUndoSale(null);
      setUndoTimer(10);
    }
  }, [undoSale, undoTimer]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by availability
    if (showOnlyAvailable) {
      filtered = filtered.filter((p) => p.quantity > 0);
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery, selectedCategory, showOnlyAvailable]);

  const handleSellClick = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsSellModalOpen(true);
  };

  const handleConfirmSale = async () => {
    if (!selectedProduct) return;

    try {
      await sellProduct({ id: selectedProduct._id, quantity });

      const saleRecord: SaleRecord = {
        id: Math.random().toString(36).substring(7),
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        quantity,
        timestamp: Date.now(),
        synced: !isOffline,
      };

      setUndoSale(saleRecord);
      setUndoTimer(10);

      addToast({
        title: "¡Venta exitosa!",
        description: `${quantity}x ${selectedProduct.name} vendidos`,
        type: "success",
      });

      setIsSellModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error selling product:", error);
      addToast({
        title: "Error",
        description: "No se pudo completar la venta",
        type: "error",
      });
    }
  };

  const handleUndo = async () => {
    if (!undoSale) return;

    addToast({
      title: "Venta anulada",
      description: `Se restauró ${undoSale.quantity}x ${undoSale.productName}`,
      type: "info",
    });

    setUndoSale(null);
    setUndoTimer(10);
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return "bg-red-100 text-red-800 border-red-200";
    if (quantity <= 2) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStockLabel = (quantity: number) => {
    if (quantity === 0) return "Agotado";
    if (quantity <= 2) return `Stock: ${quantity}`;
    return `Stock: ${quantity}`;
  };

  if (products === undefined) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 bg-muted rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-2 sticky top-0 z-50"
          >
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              Modo sin conexión - Las ventas se sincronizarán cuando vuelva la conexión
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Title and View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Punto de Venta</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} productos
                </p>
              </div>
            </div>

            {/* View Toggle - Desktop Only */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-input"
              />
              Solo disponibles
            </label>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron productos
            </h3>
            <p className="text-muted-foreground">
              Intenta con otros términos de búsqueda o filtros
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile Cards */
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border border-border rounded-xl overflow-hidden ${
                  product.quantity === 0 ? "opacity-60" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate mb-1">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-foreground mb-2">
                        {formatCurrency(product.suggestedPrice)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getStockColor(
                          product.quantity
                        )}`}
                      >
                        {getStockLabel(product.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Sell Button - Full Width on Mobile */}
                  <button
                    onClick={() => handleSellClick(product)}
                    disabled={product.quantity === 0}
                    className={`w-full mt-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] ${
                      product.quantity === 0
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                    }`}
                  >
                    {product.quantity === 0 ? "Agotado" : "Vender"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : viewMode === "grid" ? (
          /* Desktop Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-card border border-border rounded-xl overflow-hidden ${
                  product.quantity === 0 ? "opacity-60" : ""
                }`}
              >
                {/* Image */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-medium text-foreground truncate mb-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-foreground mb-2">
                    {formatCurrency(product.suggestedPrice)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getStockColor(
                        product.quantity
                      )}`}
                    >
                      {getStockLabel(product.quantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSellClick(product)}
                    disabled={product.quantity === 0}
                    className={`w-full mt-3 py-2 rounded-lg font-medium transition-colors ${
                      product.quantity === 0
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {product.quantity === 0 ? "Agotado" : "Vender"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Desktop List */
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 ${
                  product.quantity === 0 ? "opacity-60" : ""
                }`}
              >
                {/* Image */}
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(product.suggestedPrice)}
                  </p>
                </div>

                {/* Stock */}
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getStockColor(
                    product.quantity
                  )}`}
                >
                  {getStockLabel(product.quantity)}
                </span>

                {/* Sell Button */}
                <button
                  onClick={() => handleSellClick(product)}
                  disabled={product.quantity === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    product.quantity === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {product.quantity === 0 ? "Agotado" : "Vender"}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sell Modal - Bottom Sheet Style */}
      <AnimatePresence>
        {isSellModalOpen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setIsSellModalOpen(false)}
          >
            <motion.div
              initial={isMobile ? { y: "100%" } : { scale: 0.9, y: 20 }}
              animate={isMobile ? { y: 0 } : { scale: 1, y: 0 }}
              exit={isMobile ? { y: "100%" } : { scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-card w-full ${
                isMobile 
                  ? "rounded-t-3xl max-h-[90vh] overflow-y-auto" 
                  : "rounded-2xl max-w-md"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Handle Bar */}
              {isMobile && (
                <div className="sticky top-0 bg-card pt-3 pb-2 px-6 z-10">
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Confirmar Venta</h2>
                    <button
                      onClick={() => setIsSellModalOpen(false)}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 pt-2">
                {!isMobile && (
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    Confirmar Venta
                  </h2>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center">
                    {selectedProduct.image ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-3xl font-bold text-foreground">
                      {formatCurrency(selectedProduct.suggestedPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock disponible: {selectedProduct.quantity}
                    </p>
                  </div>
                </div>

                {/* Quantity Selector - Mobile Optimized */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Cantidad (máx. 5)
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-14 h-14 rounded-2xl bg-muted text-foreground flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <span className="text-4xl font-bold text-foreground w-20 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(5, selectedProduct.quantity, quantity + 1))
                      }
                      disabled={quantity >= selectedProduct.quantity || quantity >= 5}
                      className="w-14 h-14 rounded-2xl bg-muted text-foreground flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-muted rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-lg">Total</span>
                    <span className="text-3xl font-bold text-foreground">
                      {formatCurrency(selectedProduct.suggestedPrice * quantity)}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  {!isMobile && (
                    <button
                      onClick={() => setIsSellModalOpen(false)}
                      className="flex-1 py-4 rounded-xl bg-muted text-foreground font-semibold text-lg"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={handleConfirmSale}
                    className="flex-1 py-4 rounded-xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 active:scale-95 transition-transform"
                  >
                    Confirmar Venta
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Toast - Mobile Optimized */}
      <AnimatePresence>
        {undoSale && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed ${
              isMobile ? "bottom-4 left-4 right-4" : "bottom-6 left-1/2 transform -translate-x-1/2"
            } bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Venta completada</p>
                <p className="text-sm text-background/70">{undoSale.quantity}x {undoSale.productName}</p>
              </div>
            </div>
            <button
              onClick={handleUndo}
              className="px-4 py-2 bg-background/20 rounded-xl text-sm font-semibold hover:bg-background/30 transition-colors whitespace-nowrap"
            >
              Deshacer ({undoTimer}s)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
