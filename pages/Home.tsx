import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Wind, Ban } from 'lucide-react';
import { FloatingGallery } from '../components/FloatingGallery';

interface HomeProps {
  brands?: any[];
  categories?: any[];
}

const Home: React.FC<HomeProps> = ({ brands = [], categories = [] }) => {
  // Use passed brands, or if empty (and loading), maybe show empty or skeleton.
  // For now, let's use what's passed.
  const displayBrands = brands.length > 0 ? brands : [];

  // Group brands by category ID
  const groupedBrands = useMemo(() => {
    const groups: Record<string, typeof brands> = {};
    const uncategorized: typeof brands = [];

    // Pre-deduplicate categories to find the normalized names
    const categoryMap = new Map<string, string>(); // slug/id -> name
    categories.forEach(c => {
      if (c.slug) categoryMap.set(c.slug, c.name);
      if (c.id) categoryMap.set(c.id, c.name);
    });

    displayBrands.forEach(brand => {
      // Default legacy brands with no category to 'disposable-vapes' (or 'disposable-vape' based on whatever slug is used)
      let catId = brand.category;
      if (!catId) catId = 'disposable-vapes';

      let catName = categoryMap.get(catId) || categoryMap.get('disposable-vapes') || 'Disposable Vapes';

      // Normalize plurals for grouping so "Disposable Vape" and "Disposable Vapes" end up in the same group.
      // We'll use the plural "Disposable Vapes" as the standard display name if there's a conflict,
      // but we need to group them together mathematically.
      const normalizedCatName = catName.toLowerCase().trim().endsWith('s')
        ? catName.slice(0, -1).toLowerCase().trim()
        : catName.toLowerCase().trim();

      // Find if we already have a group that matches this normalized name
      let existingGroupKey = Object.keys(groups).find(k => {
        const kNorm = k.toLowerCase().trim().endsWith('s') ? k.slice(0, -1).toLowerCase().trim() : k.toLowerCase().trim();
        return kNorm === normalizedCatName;
      });

      // If we found a matching group, use its exact name key, else use the capitalized one we just got
      const finalGroupName = existingGroupKey || catName;

      if (!groups[finalGroupName]) {
        groups[finalGroupName] = [];
      }
      groups[finalGroupName].push(brand);
    });

    // Deduplicate brands within each group by name
    Object.keys(groups).forEach(key => {
      const seen = new Set();
      groups[key] = groups[key].filter(b => {
        const name = (b.name || '').toLowerCase().trim();
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
    });

    return groups;
  }, [displayBrands, categories]);

  return (
    <div className="overflow-hidden">
      {/* SECTION 2: HERO */}
      <section className="min-h-screen pt-32 pb-20 relative bg-background flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column */}
          <div className="z-10">
            <div className="inline-block px-4 py-1.5 rounded-full border border-gold text-gold text-xs font-bold tracking-[0.1em] uppercase mb-8">
              Premium Vape Showcase - 21+ Only
            </div>

            <h1 className="text-[3rem] md:text-[5rem] font-black leading-[1.1] tracking-tighter mb-4 text-text-primary uppercase whitespace-nowrap">
              <span className="text-gold">Tough</span> Yuff
            </h1>

            <h2 className="text-[2rem] md:text-[3rem] font-bold leading-[1.1] tracking-tight mb-6 text-white/90">
              Discover Flavors <br className="hidden md:block" />
              That Hit Different
            </h2>

            <p className="text-text-secondary text-lg leading-relaxed max-w-[540px] mb-8">
              Welcome to Tough Yuff. We bring together the most popular disposable vapes and zero-nicotine options from top brands – all in one clean, modern gallery.
            </p>

            <div className="flex items-center gap-2 text-sm font-medium text-text-primary mb-10">
              <span>{displayBrands.length}+ Brands</span>
              <span className="text-gold">•</span>
              <span>100+ Flavors</span>
              <span className="text-gold">•</span>
              <span>21+ Adult Audience</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="bg-gold text-background px-8 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                Browse All Brands
              </Link>
              <Link to="/catalog?nicotine=zero" className="border border-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/5 transition-all">
                View Zero Nicotine
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative h-[600px] md:h-[800px] hidden lg:block">
            <FloatingGallery />
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED BRANDS */}
      <section className="py-32 bg-background relative border-t border-black/5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-semibold mb-4 inline-block relative pb-4 text-text-primary">
              Featured Brands
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gold rounded-full"></span>
            </h2>
          </div>

          <div className="space-y-16">
            {Object.entries(groupedBrands).map(([groupName, groupBrands]) => (
              <div key={groupName}>
                <h3 className="text-3xl font-bold mb-8 text-text-primary capitalize">{groupName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupBrands.map((brand) => (
                    <Link to={`/catalog?brand=${brand.id}`} key={brand.id} className="group relative bg-card-bg border border-black/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                      {brand.image && (
                        <div className="h-48 bg-black/5 rounded-xl mb-5 overflow-hidden flex items-center justify-center">
                          <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="text-2xl font-semibold text-text-primary mb-2">{brand.name}</h3>
                        <p className="text-text-secondary text-sm h-10">{brand.tagline}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="bg-elevated text-gold text-xs px-2 py-1 rounded border border-gold/20">{brand.puffRange}</span>
                        {brand.id.includes('nonic') && (
                          <span className="bg-blue-50 text-accent-blue text-xs px-2 py-1 rounded border border-accent-blue/20">Zero Nicotine</span>
                        )}
                      </div>

                      <div className="flex items-center text-gold text-sm font-bold tracking-wide group-hover:gap-2 transition-all">
                        View Products <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FLAVOR SPOTLIGHT */}
      <section className="py-32 bg-surface relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="mb-16">
            <h2 className="text-4xl font-semibold mb-4 text-text-primary">Flavor Spotlight</h2>
            <p className="text-text-secondary text-lg max-w-xl">From fruity ice to rich dessert notes, explore the profiles that match your taste.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Blue Raspberry Lemonade', tags: ['Fruity', 'Drink', 'Ice'], brands: ['Geek Bar', 'Cali'], nic: '5%' },
              { name: 'Frozen Apple Watermelon', tags: ['Fruity', 'Ice'], brands: ['Cali UL 8000'], nic: '5%' },
              { name: 'Cool Mint', tags: ['Menthol', 'Fresh'], brands: ['Flair Ultra', 'UNC'], nic: 'Various' },
              { name: 'Strawberry Ice Cream', tags: ['Dessert', 'Sweet'], brands: ['Geek Bar Pulse'], nic: '5%' }
            ].map((flavor, idx) => (
              <div key={idx} className="bg-elevated border border-black/5 p-8 rounded-2xl hover:border-black/10 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-medium text-text-primary">{flavor.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${flavor.nic === '0 mg' ? 'border-accent-blue text-accent-blue' : 'border-black/10 text-text-tertiary'}`}>
                    {flavor.nic}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {flavor.tags.map(t => (
                    <span key={t} className="text-xs text-text-secondary bg-black/5 px-2 py-1 rounded uppercase tracking-wider">{t}</span>
                  ))}
                </div>

                <div className="text-sm text-text-tertiary">
                  Available in: <span className="text-text-secondary">{flavor.brands.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="py-32 bg-background border-t border-black/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary">Find Your Next Go-To Disposable</h2>
          <p className="text-text-secondary text-lg mb-10">Compare brands, puff counts, and flavor profiles before you hit your local shop.</p>

          <Link to="/catalog" className="inline-block bg-gold text-background px-10 py-5 rounded-lg font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(212,175,55,0.4)]">
            Browse Full Catalog
          </Link>

          <p className="mt-8 text-text-tertiary text-sm flex items-center justify-center gap-2">
            <Ban className="w-4 h-4" />
            Information only – no online sales, 21+ adults only.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
