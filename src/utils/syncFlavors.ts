import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../../types";

const newFlavors = [
    { name: 'Watermelon Ice', description: 'sweet, juicy watermelon with a medium–strong menthol/ice' },
    { name: 'Blue Razz Ice', description: 'blue raspberry candy (sweet + tart), plus a clear icy exhale.' },
    { name: 'Miami Mint', description: 'clean peppermint + a bit of spearmint, smooth but very cool, like mint gum.' },
    { name: 'Strawberry B-Pop', description: 'strawberry candy/lollipop with some bubblegum sweetness and light ice.' },
    { name: 'Fcuking FAB', description: 'mixed berry candy with a “mystery” sweet note, more candy than realistic fruit.' },
    { name: 'Juicy Peach', description: 'sweet ripe peach, slightly tangy, low or no ice (depends on batch/retailer).' },
    { name: 'Mexico Mango', description: 'rich tropical mango, a bit honey-like, sometimes light cooling.' },
    { name: 'Sour Apple Ice', description: 'green apple candy with strong sour note; “Ice” adds menthol.' },
    { name: 'Tropical Rainbow Blast', description: 'mixed tropical fruits (pineapple, mango, passion fruit style) with a punch/candy vibe.' },
    { name: 'California Cherry', description: 'sweet cherry with light tartness, cherry candy more than realistic.' },
    { name: 'Strawberry Mango', description: 'juicy strawberry plus tropical mango, mid-sweet, light to medium ice.' },
    { name: 'Strawberry Banana', description: 'smoothie-style, creamy banana plus sweet strawberry, usually softer ice or none.' },
    { name: 'Dragon Melon', description: 'dragon fruit + melon (often honeydew), soft tropical, sweeter finish.' },
    { name: 'Black Cherry', description: 'darker cherry profile, deeper sweetness and mild tart finish.' },
    { name: 'Berry Bliss', description: 'mixed berries (strawberry, blueberry, raspberry) balanced sweet/tart.' },
    { name: 'White Gummy Ice', description: 'tastes like white gummy bear candy; very sweet, slightly tangy; “Ice” adds menthol.' },
    { name: 'OMG Blow Pop', description: 'lollipop + bubblegum core; fruit changes (mixed fruit, grape, sour apple), sweetness is high, some have light ice.' },
    { name: 'Cherry Bomb', description: 'strong cherry candy, starts sweet then more intense, sometimes a tiny “fizz” candy feel.' },
    { name: 'Frozen Watermelon', description: 'classic sweet watermelon but with a very cold inhale/exhale.' },
    { name: 'Frozen Blackberry Fab', description: 'sweet–tart blackberry candy with big ice layer.' },
    { name: 'Frozen Pina Colada', description: 'pineapple + coconut cocktail with strong coolness.' },
    { name: 'Frozen Strawberry', description: 'sweet ripe strawberry with heavy menthol.' },
    { name: 'Frozen Cherry Apple', description: 'tart apple + sweet cherry plus icy finish.' },
    { name: 'Frozen White Grape', description: 'light, slightly floral white grape with a crisp ice hit.' },
    { name: 'Sour Strawberry', description: 'sweet strawberry with strong sour candy coating.' },
    { name: 'Sour Watermelon Drop', description: 'juicy watermelon with tangy sour belt/powder candy vibe.' },
    { name: 'Sour Blue Dust', description: 'blue raspberry powder-candy/”dust,” very sour and sweet.' },
    { name: 'Sour Cranapple', description: 'cranberry + apple sour candy blend, tart and sharp.' },
    { name: 'Sour Gush', description: 'mixed sour fruit candy, like gusher/soft candy style.' },
    { name: 'Blue Mint', description: 'peppermint + blueberry sweetness, quite cool.' },
    { name: 'BlackMintz', description: 'different mint bases (peppermint/spearmint/stone mint) with varying strength of menthol and slight sweetness.' },
    { name: 'Orange Creamsicle', description: 'orange popsicle plus vanilla cream, light ice.' },
    { name: 'Grape Lemon', description: 'grape candy plus tart lemon, lemonade-style.' },

    // Pulse X Flavors
    { name: 'Banana Taffy Freeze', description: 'Sweet banana taffy candy with a creamy note and a strong icy finish.' },
    { name: 'Berry Cherry Lime (Platinum Edition)', description: 'Mixed berry and cherry candy with a squeeze of lime, sweet-tart and slightly icy.' },
    { name: 'Blackberry Blueberry', description: 'Dark blackberry and sweet blueberry mix with light cooling.' },
    { name: 'Blackberry B-Pop', description: 'Bold sweet blackberry “soda/candy” style flavor, juicy and vibrant with little or no ice.' },
    { name: 'Blue Rancher', description: 'Blue raspberry hard-candy profile, sweet and tangy with light or no ice.' },
    { name: 'Blueberry Jam', description: 'Sticky blueberry jam vibe, rich and sweet, minimal cooling.' },
    { name: 'Cherry Lemon', description: 'Sweet cherry plus sharp lemon, like sour cherry candy with a citrus edge.' },
    { name: 'Cola Slush', description: 'Fizzy cola soda slushy with caramel-cola notes and strong ice.' },
    { name: 'Cool Mint', description: 'Clean mint/menthol, lightly sweet for cold freshness.' },
    { name: 'Dragon Fruit Lemonade', description: 'Exotic dragon fruit blended into tart lemonade, tropical and refreshing.' },
    { name: 'Grape Ice Jam / Grape Ice', description: 'Grape candy soda style with a smooth, sweet icy finish.' },
    { name: 'Grapefruit Refresher', description: 'Bright grapefruit citrus mix, tart and slightly sweet, very refreshing.' },
    { name: 'Kiwi Passionfruit Guava', description: 'Tropical trio of tangy kiwi, fragrant passionfruit and soft guava.' },
    { name: 'Lemon Heads', description: 'Sharp lemon candy sweetness with a noticeable tart bite.' },
    { name: 'Lemon Tart', description: 'Lemon dessert with a pastry/cream vibe, sweet and bakery-style.' },
    { name: 'Lime Berry Orange', description: 'Lime-forward citrus with mixed berries and orange, bright and sweet-sour.' },
    { name: 'Orange Fcuking Fab', description: 'Bold orange plus mixed tropical fruits, juicy and candy-like.' },
    { name: 'Orange Slush', description: 'Orange soda slushy, sweet and tangy with a strong icy texture.' },
    { name: 'Peach Berry Lime Ice / Raspberry Peach Lime', description: 'Peach and berries with a lime kick, zesty with a medium cool finish.' },
    { name: 'Peach Perfect Slush', description: 'Ripe peach slushy, juicy and sweet with heavy ice.' },
    { name: 'Pineapple Ice', description: 'Bright pineapple juice flavor with a clear, cold menthol finish.' },
    { name: 'Sour Fcuking Fab', description: 'Tropical fruit base with a strong sour candy twist, intense and loud.' },
    { name: 'Sour Mango Pineapple', description: 'Mango and pineapple base with sour candy and a refreshing chill.' },
    { name: 'Sour Pink Dust (Platinum Edition)', description: 'Pink candy sherbet style with a heavy sour sugar vibe.' },
    { name: 'Sour Straws', description: 'Rainbow sour candy straw style, mixed fruit with strong tartness.' },
    { name: 'Strawberry Banana Ice', description: 'Smooth strawberry-banana smoothie vibe with a cool exhale.' },
    { name: 'Strawberry Colada', description: 'Strawberry layered into a creamy pineapple + coconut mix.' },
    { name: 'Strawberry Jam', description: 'Rich dessert-style strawberry jam, sweet with minimal cooling.' },
    { name: 'Strawberry Kiwi Ice', description: 'Sweet strawberry with tangy kiwi and a noticeable icy finish.' },
    { name: 'Strawberry Watermelon', description: 'Sweet watermelon juice/candy mix with a clean, cold menthol finish.' },
    { name: 'White Peach Raspberry', description: 'Soft white peach with tart raspberry, refined and lightly cooled.' },
    { name: 'Wild Cherry Slush', description: 'Bold cherry slushy flavor, sweet with a slush-style icy kick.' }
];

export const syncGeekBarFlavors = async (products: Product[]) => {
    console.log("DEBUG: syncGeekBarFlavors started with", products.length, "products.");
    try {
        let updatedCount = 0;
        let checkedCount = 0;

        for (const product of products) {
            const brandId = (product.brandId || '').toLowerCase();
            const brandName = (product.brandName || '').toLowerCase();
            const name = (product.name || '');

            // Check if it's a Geek Bar Pulse or Pulse X product
            const isPulse = brandId.includes('geekbar-pulse') || brandId.includes('geek-bar-pulse') || brandName.includes('geek bar pulse');
            const isPulseX = brandId.includes('pulsex') || brandName.includes('pulse x');

            if (isPulse || isPulseX) {
                checkedCount++;
                const matchingFlavor = newFlavors.find(f => {
                    const normalizedName = name.toLowerCase();
                    const normalizedFlavor = f.name.toLowerCase();
                    return normalizedName.includes(normalizedFlavor);
                });

                if (matchingFlavor) {
                    console.log(`DEBUG: Matching product found: "${name}". Updating to: "${matchingFlavor.name}"`);
                    if (!product.id) {
                        console.error("DEBUG: Product missing ID!", product);
                        continue;
                    }

                    const updateData: any = {
                        flavorText: matchingFlavor.description,
                        name: matchingFlavor.name,
                        battery: '650 mAh',
                        nicotine: '5%',
                        isRechargeable: true,
                        updatedAt: new Date()
                    };

                    // Add specific features for Pulse X
                    if (isPulseX) {
                        updateData.features = [
                            'Up to 25,000 puffs (Regular Mode)',
                            'Pulse Mode for a powerful hit',
                            'World’s first 3D curved screen',
                            'Dual mesh coil for consistent vapor',
                            'Fast charging & pre-filled',
                            'Sleek premium tech design'
                        ];
                    }

                    await updateDoc(doc(db, 'products', product.id), updateData);
                    updatedCount++;
                } else {
                    console.log(`DEBUG: No specific flavor match for: "${name}"`);
                }
            }
        }

        console.log(`DEBUG: Sync finished. Checked: ${checkedCount}, Updated: ${updatedCount}`);
        return { success: true, count: updatedCount };
    } catch (error) {
        console.error("DEBUG: Sync utility caught error:", error);
        return { success: false, error };
    }
};
