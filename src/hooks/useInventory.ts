import { useQuery, useMutation } from "convex/react";
import { api } from "../lib/convex";

// Hook para obtener todos los productos
export const useProducts = () => {
  return useQuery(api.products.getAll);
};

// Hook para obtener un producto específico
export const useProduct = (id: string | undefined) => {
  return useQuery(api.products.getById, id ? { id: id as any } : "skip");
};

// Hook para obtener estadísticas
export const useStats = () => {
  return useQuery(api.products.getStats);
};

// Hook para obtener productos por categoría
export const useProductsByCategory = (category: string) => {
  return useQuery(
    api.products.getByCategory,
    category !== "all" ? { category: category as any } : "skip"
  );
};

// Hook para buscar productos
export const useSearchProducts = (query: string) => {
  return useQuery(
    api.products.search,
    query.length > 0 ? { query } : "skip"
  );
};

// Mutación para agregar producto
export const useAddProduct = () => {
  return useMutation(api.products.add);
};

// Mutación para actualizar producto
export const useUpdateProduct = () => {
  return useMutation(api.products.update);
};

// Mutación para eliminar producto
export const useDeleteProduct = () => {
  return useMutation(api.products.remove);
};

// Mutación para vender producto
export const useSellProduct = () => {
  return useMutation(api.products.sell);
};

// Mutación para generar URL de upload
export const useGenerateUploadUrl = () => {
  return useMutation(api.products.generateUploadUrl);
};

// Hook para obtener URL de imagen desde storage ID
export const useImageUrl = (storageId: string | undefined) => {
  return useQuery(
    api.products.getImageUrl,
    storageId ? { storageId: storageId as any } : "skip"
  );
};
