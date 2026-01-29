import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, InventoryStats } from '../types';
import { initialInventory } from '../data/initialInventory';

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'dateAdded'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sellProduct: (id: string, quantity?: number) => void;
  getStats: () => InventoryStats;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (query: string) => Product[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'soulsisters-inventory';

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return initialInventory;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id' | 'dateAdded'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const sellProduct = (id: string, quantity: number = 1) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newQuantity = Math.max(0, p.quantity - quantity);
          return {
            ...p,
            quantity: newQuantity,
            status: newQuantity === 0 ? 'sold' : newQuantity <= 2 ? 'low-stock' : 'available',
          };
        }
        return p;
      })
    );
  };

  const getStats = (): InventoryStats => {
    const totalProducts = products.length;
    const totalSold = products.filter(p => p.status === 'sold').length;
    const totalAvailable = products.filter(p => p.status === 'available').length;
    const lowStockCount = products.filter(p => p.status === 'low-stock').length;
    
    const totalInventoryValue = products
      .filter(p => p.status !== 'sold')
      .reduce((sum, p) => sum + p.storePrice * p.quantity, 0);
    
    const totalRevenue = products
      .filter(p => p.status === 'sold')
      .reduce((sum, p) => sum + p.suggestedPrice, 0);
    
    const totalProfit = products
      .filter(p => p.status === 'sold')
      .reduce((sum, p) => sum + (p.suggestedPrice - p.storePrice), 0);

    return {
      totalProducts,
      totalSold,
      totalAvailable,
      totalInventoryValue,
      totalRevenue,
      totalProfit,
      lowStockCount,
    };
  };

  const getProductsByCategory = (category: string) => {
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
  };

  const searchProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.notes?.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        sellProduct,
        getStats,
        getProductsByCategory,
        searchProducts,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
