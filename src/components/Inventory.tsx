import { useState, useMemo, useEffect } from "react";
import { useProducts, useDeleteProduct, useSellProduct } from "../hooks/useInventory";
import { Search, Plus, Filter, Edit2, Trash2, ShoppingCart, AlertCircle, Image as ImageIcon, Package } from "lucide-react";
import { formatCurrency, getCategoryLabel, getStatusLabel, getStatusColor } from "../lib/utils";
import { ProductModal } from "./ProductModal";
import { ConfirmModal } from "./ConfirmModal";
import { InventoryCard } from "./InventoryCard";
import { motion, AnimatePresence } from "framer-motion";
import { useToastContext } from "./ui/ToastProvider";
import PullToRefresh from "react-pull-to-refresh";

const categories = [
  { value: "all", label: "Todos" },
  { value: "uncategorized", label: "Sin Categoría", special: true },
  { value: "necklaces", label: "Collares" },
  { value: "earrings", label: "Aretes" },
  { value: "bracelets", label: "Pulseras" },
  { value: "rings", label: "Anillos" },
  { value: "sets", label: "Sets" },
  { value: "other", label: "Otros" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function Inventory() {
  const products = useProducts();
  const deleteProduct = useDeleteProduct();
  const sellProduct = useSellProduct();
  const { addToast } = useToastContext();

  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [confirmSell, setConfirmSell] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
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

  const uncategorizedCount = useMemo(() => {
    if (!products) return 0;
    return products.filter((p) => p.category === "other").length;
  }, [products]);

  const filteredData = useMemo(() => {
    if (!products) return [];
    let data = products;
    
    // Apply category filter
    if (categoryFilter === "uncategorized") {
      data = data.filter((p) => p.category === "other");
    } else if (categoryFilter !== "all") {
      data = data.filter((p) => p.category === categoryFilter);
    }
    
    // Apply search filter
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      data = data.filter((p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    return data;
  }, [products, categoryFilter, globalFilter]);

  const handleRefresh = async () => {
    // Force re-fetch by invalidating the query
    window.location.reload();
  };

  const handleSell = async () => {
    if (confirmSell) {
      try {
        await sellProduct({ id: confirmSell._id, quantity: 1 });
        setConfirmSell(null);
        addToast({
          title: "Venta exitosa",
          description: `${confirmSell.name} ha sido vendido`,
          type: "success",
        });
      } catch (error) {
        console.error("Error selling product:", error);
        addToast({
          title: "Error",
          description: "No se pudo completar la venta",
          type: "error",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteProduct({ id: confirmDelete._id });
        setConfirmDelete(null);
        addToast({
          title: "Producto eliminado",
          description: `${confirmDelete.name} ha sido eliminado`,
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          type: "error",
        });
      }
    }
  };

  const handleCardSell = (product: any) => {
    setConfirmSell(product);
    addToast({
      title: "Desliza para vender",
      description: `Desliza ${product.name} a la izquierda para vender rápidamente`,
      type: "info",
    });
  };

  const handleCardEdit = (product: any) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
    addToast({
      title: "Editando producto",
      description: `Abriendo ${product.name} para editar`,
      type: "info",
    });
  };

  const handleCardDelete = (product: any) => {
    setConfirmDelete(product);
  };

  if (products === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="h-16 bg-muted animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24 md:pb-0"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">Gestiona tus productos de joyería</p>
        </div>
        
        {/* Desktop Add Button */}
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="hidden md:flex btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          Agregar Producto
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              categoryFilter === cat.value
                ? cat.special 
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-primary text-primary-foreground shadow-md"
                : cat.special
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.label}
            {cat.value === "uncategorized" && uncategorizedCount > 0 && (
              <span className="ml-1.5 bg-white text-yellow-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                {uncategorizedCount}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Uncategorized Alert */}
      {categoryFilter === "uncategorized" && uncategorizedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">
              Tienes {uncategorizedCount} productos sin categoría
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Haz clic en el botón "Editar" para asignar una categoría a cada producto.
            </p>
          </div>
        </motion.div>
      )}

      {/* Mobile Cards with Pull-to-Refresh */}
      {isMobile ? (
        <motion.div variants={itemVariants}>
          <PullToRefresh onRefresh={handleRefresh} className="overflow-visible">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredData.map((product) => (
                  <InventoryCard
                    key={product._id}
                    product={product}
                    onSell={handleCardSell}
                    onEdit={handleCardEdit}
                    onDelete={handleCardDelete}
                  />
                ))}
              </AnimatePresence>
              
              {filteredData.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No se encontraron productos</p>
                  <p className="text-sm text-muted-foreground mt-1">Intenta con otros filtros de búsqueda</p>
                </motion.div>
              )}
            </div>
          </PullToRefresh>
          
          {/* Mobile Floating Action Button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </motion.div>
      ) : (
        /* Desktop Table */
        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Precio Compra</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Precio Venta</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ganancia</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((product) => (
                  <tr key={product._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          {product.notes && (
                            <p className="text-sm text-muted-foreground">{product.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.category === "other"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {product.category === "other" && <AlertCircle className="w-3 h-3" />}
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{product.quantity}</span>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(product.storePrice)}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(product.suggestedPrice)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {product.profitPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {product.status !== "sold" && product.quantity > 0 && (
                          <button
                            onClick={() => setConfirmSell(product)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Vender"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setConfirmDelete(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No se encontraron productos</p>
              <p className="text-sm text-muted-foreground mt-1">Intenta con otros filtros de búsqueda</p>
            </div>
          )}
        </motion.div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
      />

      <ConfirmModal
        isOpen={!!confirmSell}
        onClose={() => setConfirmSell(null)}
        onConfirm={handleSell}
        title="Confirmar Venta"
        message={`¿Desea vender ${confirmSell?.name}?`}
        confirmText="Vender"
        cancelText="Cancelar"
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Desea eliminar ${confirmDelete?.name} permanentemente?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
      />
    </motion.div>
  );
}
