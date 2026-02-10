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
  inStock: boolean;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  puffRange: string; // e.g., "8000 Puffs"
  description: string;
}

export type FlavorProfile = 'Fruity' | 'Menthol' | 'Dessert' | 'Tobacco' | 'Ice' | 'Drink' | 'Candy';

export interface FilterState {
  brand: string | 'all';
  flavorProfile: FlavorProfile | 'all';
  nicotine: 'all' | 'nicotine' | 'zero';
  availability: boolean; // true for in-stock only
}
