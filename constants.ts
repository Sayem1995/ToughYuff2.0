import { Brand, Product } from './types';

export const BRANDS: Brand[] = [
  { id: 'cali-ul8000', name: 'Cali UL 8000', tagline: 'Silky smooth hits with silicone tip', puffRange: '8000 Puffs', description: 'Known for its comfortable silicone mouthpiece and consistent flavor delivery.' },
  { id: 'cali-20000', name: 'Cali 20000', tagline: 'Massive capacity for extended use', puffRange: '20000 Puffs', description: 'A powerhouse device designed for longevity without sacrificing flavor intensity.' },
  { id: 'cali-40000', name: 'Cali 40000', tagline: 'The ultimate endurance disposable', puffRange: '40000 Puffs', description: 'Industry-leading puff count with dual mesh coil technology.' },
  { id: 'geekbar-pulse', name: 'Geek Bar Pulse', tagline: 'World’s first full screen disposable', puffRange: '15000 Puffs', description: 'Features Pulse Mode for enhanced airflow and flavor, plus a large display.' },
  { id: 'geekbar-pulsex', name: 'Geekbar Pulse X', tagline: 'Next gen pulse technology', puffRange: '25000 Puffs', description: 'Curved screen display and starry sky UI with faster charging.' },
  { id: 'flair-ultra', name: 'Flair Ultra', tagline: 'Compact premium design', puffRange: '2500 Puffs', description: 'Sleek, portable, and packed with intense flavor profiles.' },
  { id: 'airbar-diamond', name: 'Airbar Diamond', tagline: 'Jewel-inspired elegance', puffRange: '500 Puffs', description: 'A classic, stylish choice with a hard shell design and smooth draw.' },
  { id: 'unc-nic', name: 'UNC Nicotine', tagline: 'Pure tobacco leaf extraction', puffRange: '5000 Puffs', description: 'Focused on authentic tobacco and straightforward blends.' },
  { id: 'unc-nonic', name: 'UNC No Nicotine', tagline: 'Zero nicotine, full flavor', puffRange: '5000 Puffs', description: 'The perfect choice for those who want the sensation without the nicotine.' },
];

const FLAVOR_ADJECTIVES = ['Frozen', 'Icy', 'Cool', 'Sweet', 'Tangy', 'Sour', 'Fresh', 'Juicy'];
const FRUITS = ['Apple', 'Watermelon', 'Blue Raspberry', 'Mango', 'Grape', 'Strawberry', 'Peach', 'Lychee', 'Banana', 'Kiwi'];
const DESSERTS = ['Vanilla Custard', 'Strawberry Ice Cream', 'Lemon Tart', 'Mint Chocolate'];
const BASICS = ['Mint', 'Tobacco', 'Clear', 'Menthol'];

// Helper to generate products
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let idCounter = 1;

  BRANDS.forEach(brand => {
    const isNicFree = brand.id.includes('nonic');
    const nicStrength = isNicFree ? '0 mg (No Nicotine)' : '5%';

    // Generate ~10 flavors per brand
    const brandFlavors = [
      ...FRUITS.map(f => `${FLAVOR_ADJECTIVES[Math.floor(Math.random() * FLAVOR_ADJECTIVES.length)]} ${f}`),
      ...DESSERTS.slice(0, 2),
      ...BASICS.slice(0, 2)
    ];

    brandFlavors.forEach(flavorName => {
        const isIce = flavorName.includes('Ice') || flavorName.includes('Frozen') || flavorName.includes('Cool') || flavorName.includes('Menthol');
        const isDessert = DESSERTS.includes(flavorName) || flavorName.includes('Custard') || flavorName.includes('Cream');
        const isFruity = FRUITS.some(f => flavorName.includes(f));
        const isTobacco = flavorName.includes('Tobacco');
        
        const profiles = [];
        if (isIce) profiles.push('Ice');
        if (isDessert) profiles.push('Dessert');
        if (isFruity) profiles.push('Fruity');
        if (isTobacco) profiles.push('Tobacco');
        if (profiles.length === 0) profiles.push('Menthol');

        products.push({
            id: `prod-${idCounter++}`,
            brandId: brand.id,
            brandName: brand.name,
            name: flavorName,
            puffCount: parseInt(brand.puffRange.split(' ')[0]) || 5000,
            nicotine: nicStrength,
            isNicotineFree: isNicFree,
            flavorProfile: profiles as any,
            description: `Experience the premium taste of ${flavorName} with the reliability of ${brand.name}. ${brand.description}`,
            inStock: Math.random() > 0.2 // 80% in stock chance
        });
    });
  });

  return products;
};

export const INITIAL_PRODUCTS = generateProducts();

export const ADMIN_CREDENTIALS = {
    email: "admin@tooughyuff.com",
    password: "password123" // Mock password
};
