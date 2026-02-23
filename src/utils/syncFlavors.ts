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
    { name: 'Grape Lemon', description: 'grape candy plus tart lemon, lemonade-style.' }
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

            // Check if it's a Geek Bar Pulse product
            // We use more flexible checks to catch variations in how brands might be stored
            if (brandId.includes('geekbar-pulse') ||
                brandId.includes('geek-bar-pulse') ||
                brandName.includes('geek bar pulse')) {

                checkedCount++;
                // Find matching flavor in our new list
                // We normalize both strings to find a match
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

                    await updateDoc(doc(db, 'products', product.id), {
                        flavorText: matchingFlavor.description,
                        name: matchingFlavor.name,
                        battery: '650 mAh',
                        nicotine: '5%',
                        isRechargeable: true,
                        updatedAt: new Date()
                    });
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
