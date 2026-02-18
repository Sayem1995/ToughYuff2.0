export type StoreId = 'goldmine' | 'ten2ten';

export interface Product {
  id: string;
  storeId?: StoreId; // Optional for migration compatibility but should be required
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


  // Highlights & Content
  battery?: string; // e.g. "650mAh"
  isRechargeable?: boolean;
  aboutText?: string; // Content for "About [Brand]"
  flavorText?: string; // Content for "Flavor" section
  features?: string[]; // List of features

  // Metadata
  image: string;
  images?: string[]; // Multiple images
  strength?: string; // e.g. "1860mg"
  count?: string;    // e.g. "30ct"
  channel: 'online' | 'store' | 'both';
  category?: string;
  sku?: string;

  updatedAt?: any; // Firestore Timestamp
  createdAt?: any; // Firestore Timestamp
}

export interface Category {
  id: string;
  storeId: StoreId;
  name: string; // e.g., "DISPOSABLE VAPE"
  order: number;
  slug: string; // url-friendly
}

export interface Brand {
  id: string;
  storeId?: StoreId;
  name: string;
  tagline: string;
  puffRange: string; // e.g., "8000 Puffs"
  description: string;
  image: string;
  category?: string; // slug of the category
}

export type FlavorProfile = 'Fruity' | 'Menthol' | 'Dessert' | 'Tobacco' | 'Ice' | 'Drink' | 'Candy';

export interface FilterState {
  brand: string | 'all';
  flavorProfile: FlavorProfile | 'all';
  nicotine: 'all' | 'nicotine' | 'zero';
  availability: boolean; // true for in-stock only
}
