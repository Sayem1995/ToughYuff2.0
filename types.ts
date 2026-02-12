export interface Product {
  id: string;
  brandId: string;
  name: string; // Flavor name usually
  brandName: string;
  puffCount: number;
  nicotine: string; // "5%", "0 mg", etc.
  isNicotineFree: boolean;
  flavorProfile: string[]; // "Fruity", "Ice", "Dessert"
  description: string;

  // Stock & Inventory
  stockQuantity: number;
  inStock: boolean; // Computed from stockQuantity > 0
  lowStockThreshold: number;

  // Pricing
  price: number;
  costPerUnit?: number;

  // Metadata
  image: string;
  channel: 'online' | 'store' | 'both';
  category?: string;
  sku?: string;

  updatedAt?: any; // Firestore Timestamp
  createdAt?: any; // Firestore Timestamp
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  puffRange: string; // e.g., "8000 Puffs"
  description: string;
  image: string;
}

export type FlavorProfile = 'Fruity' | 'Menthol' | 'Dessert' | 'Tobacco' | 'Ice' | 'Drink' | 'Candy';

export interface FilterState {
  brand: string | 'all';
  flavorProfile: FlavorProfile | 'all';
  nicotine: 'all' | 'nicotine' | 'zero';
  availability: boolean; // true for in-stock only
}
