import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useProducts, useDeleteProduct, useSellProduct } from "../hooks/useInventory";
import { Search, Plus, Filter, Edit2, Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { formatCurrency, getCategoryLabel, getStatusLabel, getStatusColor } from "../lib/utils";
import { ProductModal } from "./ProductModal";
import { ConfirmModal } from "./ConfirmModal";

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

export function Inventory() {
  const products = useProducts();
  const deleteProduct = useDeleteProduct();
  const sellProduct = useSellProduct();

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmSell, setConfirmSell] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Count uncategorized products
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
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
          {row.original.notes && (
            <p className="text-sm text-gray-500">{row.original.notes}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const isUncategorized = row.original.category === "other";
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isUncategorized 
              ? "bg-yellow-100 text-yellow-800 border border-yellow-300" 
              : "text-gray-700"
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
      cell: ({ row }) => (
        <span className="text-gray-900 font-medium">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "storePrice",
      header: "Precio Compra",
      cell: ({ row }) => (
        <span className="text-gray-900">{formatCurrency(row.original.storePrice)}</span>
      ),
    },
    {
      accessorKey: "suggestedPrice",
      header: "Precio Venta",
      cell: ({ row }) => (
        <span className="text-gray-900 font-medium">{formatCurrency(row.original.suggestedPrice)}</span>
      ),
    },
    {
      accessorKey: "profitPercentage",
      header: "Ganancia",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.original.profitPercentage}%
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.original.status)}`}>
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
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
      } catch (error) {
        console.error("Error selling product:", error);
        alert("Error al vender el producto");
      }
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteProduct({ id: confirmDelete._id });
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  if (products === undefined) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          <Plus className="w-5 h-5" />
          Agregar Producto
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat.value
                ? cat.special 
                  ? "bg-yellow-500 text-white"
                  : "bg-pink-600 text-white"
                : cat.special
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label}
            {cat.value === "uncategorized" && uncategorizedCount > 0 && (
              <span className="ml-1 bg-white text-yellow-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                {uncategorizedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {categoryFilter === "uncategorized" && uncategorizedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">
              Tienes {uncategorizedCount} productos sin categoría
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Haz clic en el botón "Editar" (✏️) para asignar una categoría a cada producto.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
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
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)} de {table.getPrePaginationRowModel().rows.length} productos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Primera
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600 px-2">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Última
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
        message={`Desea vender ${confirmSell?.name}?`}
        confirmText="Vender"
        cancelText="Cancelar"
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminacion"
        message={`Desea eliminar ${confirmDelete?.name} permanentemente?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
      />
    </div>
  );
}
