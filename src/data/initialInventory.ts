import type { Product } from '../types';

export const initialInventory: Omit<Product, '_id' | '_creationTime'>[] = [
  {
    name: 'Collar 5 flores',
    quantity: 0,
    storePrice: 9500,
    suggestedPrice: 12500,
    profitPercentage: 32,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar 5 corazones globo',
    quantity: 0,
    storePrice: 11000,
    suggestedPrice: 14000,
    profitPercentage: 28,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar corazones con relicarios',
    quantity: 0,
    storePrice: 11000,
    suggestedPrice: 15000,
    profitPercentage: 37,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar corazon maxi blanco',
    quantity: 0,
    storePrice: 12000,
    suggestedPrice: 15000,
    profitPercentage: 25,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar ositos animal print',
    quantity: 0,
    storePrice: 11000,
    suggestedPrice: 14000,
    profitPercentage: 28,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar de perlas',
    quantity: 0,
    storePrice: 5000,
    suggestedPrice: 8500,
    profitPercentage: 70,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar doble ojo rojo',
    quantity: 0,
    storePrice: 7000,
    suggestedPrice: 10000,
    profitPercentage: 43,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Cadena doble',
    quantity: 0,
    storePrice: 5000,
    suggestedPrice: 8000,
    profitPercentage: 60,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar estrella de mar',
    quantity: 0,
    storePrice: 9200,
    suggestedPrice: 12500,
    profitPercentage: 36,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Cadenitas minimalista - Cora blanco/negro',
    quantity: 5,
    storePrice: 5500,
    suggestedPrice: 8500,
    profitPercentage: 55,
    category: 'necklaces',
    status: 'available',
    notes: 'quedan 1 (arcoiris)',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Collar eslabones rojos corazon rojo',
    quantity: 0,
    storePrice: 13000,
    suggestedPrice: 17000,
    profitPercentage: 31,
    category: 'necklaces',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Aretes cherry',
    quantity: 0,
    storePrice: 4000,
    suggestedPrice: 7000,
    profitPercentage: 75,
    category: 'earrings',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Aretes doble flor maxi',
    quantity: 0,
    storePrice: 6500,
    suggestedPrice: 9500,
    profitPercentage: 47,
    category: 'earrings',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Aretes coral',
    quantity: 0,
    storePrice: 6500,
    suggestedPrice: 9500,
    profitPercentage: 47,
    category: 'earrings',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Aretes margaritas blancos',
    quantity: 0,
    storePrice: 6000,
    suggestedPrice: 9000,
    profitPercentage: 50,
    category: 'earrings',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Aretes chunky dorado',
    quantity: 0,
    storePrice: 5000,
    suggestedPrice: 7500,
    profitPercentage: 50,
    category: 'earrings',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Arete mezcla dorado plateado',
    quantity: 0,
    storePrice: 7000,
    suggestedPrice: 9500,
    profitPercentage: 36,
    category: 'earrings',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Pulseras corazon',
    quantity: 2,
    storePrice: 7000,
    suggestedPrice: 9500,
    profitPercentage: 36,
    category: 'bracelets',
    status: 'available',
    notes: 'se vendieron',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Pulsera hombre plateada cruz',
    quantity: 0,
    storePrice: 6000,
    suggestedPrice: 9000,
    profitPercentage: 50,
    category: 'bracelets',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  },
  {
    name: 'Pulsera hombre con tornillo',
    quantity: 0,
    storePrice: 5000,
    suggestedPrice: 8000,
    profitPercentage: 60,
    category: 'bracelets',
    status: 'sold',
    notes: 'se vendio',
    dateAdded: '2025-01-01'
  }
];
