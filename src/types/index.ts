export interface Product {
  _id: string;
  _creationTime: number;
  name: string;
  quantity: number;
  storePrice: number;
  suggestedPrice: number;
  profitPercentage: number;
  category: Category;
  status: 'available' | 'sold' | 'low-stock';
  notes?: string;
  dateAdded: string;
  image?: string;
}

export type Category = 
  | 'necklaces' 
  | 'earrings' 
  | 'bracelets' 
  | 'rings' 
  | 'sets' 
  | 'other';

export interface InventoryStats {
  totalProducts: number;
  totalSold: number;
  totalAvailable: number;
  totalInventoryValue: number;
  totalRevenue: number;
  totalProfit: number;
  lowStockCount: number;
}
