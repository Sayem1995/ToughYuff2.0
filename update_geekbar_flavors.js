import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function updateGeekBarPulseFlavors() {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef);
        const snapshot = await getDocs(q);

        let updatedCount = 0;

        for (const document of snapshot.docs) {
            const data = document.data();
            const brandId = (data.brandId || '').toLowerCase();
            const brandName = (data.brandName || '').toLowerCase();
            const name = (data.name || '');

            // Check if it's a Geek Bar Pulse product
            if (brandId.includes('geek-bar-pulse') || brandName.includes('geek bar pulse')) {
                // Find matching flavor in our new list
                const matchingFlavor = newFlavors.find(f => name.toLowerCase().includes(f.name.toLowerCase()));

                if (matchingFlavor) {
                    console.log(`Updating product: ${name} (${document.id}) with flavor text: ${matchingFlavor.description}`);
                    await updateDoc(doc(db, 'products', document.id), {
                        flavorText: matchingFlavor.description,
                        name: matchingFlavor.name // Normalize name to our list if matched
                    });
                    updatedCount++;
                }
            }
        }

        console.log(`Successfully updated ${updatedCount} Geek Bar Pulse products with new flavors!`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating products:", error);
        process.exit(1);
    }
}

updateGeekBarPulseFlavors();
