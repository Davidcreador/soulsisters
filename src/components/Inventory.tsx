import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useProducts, useDeleteProduct, useSellProduct } from "../hooks/useInventory";
import { Search, Plus, Filter, Edit2, Trash2, ShoppingCart, AlertCircle, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { formatCurrency, getCategoryLabel, getStatusLabel, getStatusColor } from "../lib/utils";
import { ProductModal } from "./ProductModal";
import { ConfirmModal } from "./ConfirmModal";
import { motion } from "framer-motion";
import { useToastContext } from "./ui/ToastProvider";

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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [confirmSell, setConfirmSell] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const uncategorizedCount = useMemo(() => {
    if (!products) return 0;
    return products.filter((p) => p.category === "other").length;
  }, [products]);

  const filteredData = useMemo(() => {
    if (!products) return [];
    if (categoryFilter === "all") return products;
    if (categoryFilter === "uncategorized") {
      return products.filter((p) => p.category === "other");
    }
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            {row.original.image ? (
              <img 
                src={row.original.image} 
                alt={row.original.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            {row.original.notes && (
              <p className="text-sm text-muted-foreground">{row.original.notes}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }: { row: any }) => {
        const isUncategorized = row.original.category === "other";
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isUncategorized 
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            {isUncategorized && <AlertCircle className="w-3 h-3" />}
            {getCategoryLabel(row.original.category)}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }: { row: any }) => (
        <span className="font-medium text-foreground">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "storePrice",
      header: "Precio Compra",
      cell: ({ row }: { row: any }) => (
        <span className="text-foreground">{formatCurrency(row.original.storePrice)}</span>
      ),
    },
    {
      accessorKey: "suggestedPrice",
      header: "Precio Venta",
      cell: ({ row }: { row: any }) => (
        <span className="font-medium text-foreground">{formatCurrency(row.original.suggestedPrice)}</span>
      ),
    },
    {
      accessorKey: "profitPercentage",
      header: "Ganancia",
      cell: ({ row }: { row: any }) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.original.profitPercentage}%
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.original.status)}`}>
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center justify-end gap-1">
          {row.original.status !== "sold" && row.original.quantity > 0 && (
            <button
              onClick={() => setConfirmSell(row.original)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Vender"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(row.original);
              setIsProductModalOpen(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setConfirmDelete(row.original)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">Gestiona tus productos de joyería</p>
        </div>
        
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="btn btn-primary"
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

      {/* Table */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No se encontraron productos</p>
            <p className="text-sm text-muted-foreground mt-1">Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)}{" "}
              de {table.getPrePaginationRowModel().rows.length} productos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-muted-foreground px-2">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="input w-20 py-1"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

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
