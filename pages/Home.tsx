import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Wind, Ban } from 'lucide-react';
import { FloatingGallery } from '../components/FloatingGallery';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Entrance
    gsap.from('.hero-stagger', {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2
    });

    // Manifesto Scroll
    gsap.from('.manifesto-text', {
      scrollTrigger: {
        trigger: '.manifesto-container',
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Brand Cards Scroll (using batch to handle dynamic grids)
    ScrollTrigger.batch('.brand-card', {
      onEnter: elements => {
        gsap.from(elements, {
          autoAlpha: 0,
          y: 60,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out'
        });
      },
      start: 'top 85%'
    });
  }, { scope: containerRef });

  return (
    <div className="overflow-hidden" ref={containerRef}>
      {/* SECTION 1: HERO (THE OPENING SHOT) */}
      <section className="min-h-[100dvh] pt-32 pb-20 relative bg-background flex items-center bg-gradient-to-t from-background via-background/80 to-transparent">
        {/* Cinematic dark overlay pattern could go here, but background colors handle it */}
        <div className="absolute inset-0 bg-white/40 z-0"></div>
        <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-end z-10 h-full pb-20">

          {/* Left Column - Pushed to bottom-left third */}
          <div className="z-10 mt-auto">
            <div className="hero-stagger inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-bold tracking-[0.2em] uppercase mb-8">
              Premium Vape Showcase - 21+ Only
            </div>

            <h1 className="hero-stagger text-[3rem] md:text-[6rem] font-sans font-black leading-[1.1] tracking-tighter mb-2 text-text-primary uppercase whitespace-nowrap">
              Premium <span className="text-gold">Vapes</span>
            </h1>

            <h2 className="hero-stagger text-[4rem] md:text-[7rem] font-serif italic leading-[1] tracking-tight mb-8 text-black/90">
              Tough Yuff.
            </h2>

            <p className="hero-stagger text-text-secondary text-lg leading-relaxed max-w-[540px] mb-10">
              Welcome to Tough Yuff. We bring together the most popular disposable vapes and zero-nicotine options from top brands – all inside a meticulously curated digital showroom.
            </p>

            <div className="hero-stagger flex flex-wrap gap-4">
              <Link to="/catalog" className="bg-gold text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden relative group">
                <span className="relative z-10">Browse All Brands</span>
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="hero-stagger relative h-[600px] md:h-[800px] hidden lg:block opacity-60 mix-blend-darken">
            <FloatingGallery />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PHILOSOPHY / MANIFESTO */}
      <section className="py-32 bg-[#FFFFFF] relative manifesto-container border-y border-black/5">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <p className="manifesto-text text-xl md:text-2xl text-text-tertiary font-sans mb-6">
            Most vape shops focus on: <span className="text-text-secondary line-through">cluttered menus and overwhelming choices.</span>
          </p>
          <p className="manifesto-text text-4xl md:text-6xl font-serif italic text-text-primary leading-tight">
            We focus on: <span className="text-gold">high-fidelity curation.</span>
          </p>
        </div>
      </section>

      {/* SECTION 3: FEATURED BRANDS (Interactive Artifacts) */}
      <section className="py-32 bg-background relative brands-grid">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-serif italic mb-4 text-text-primary">
              Featured Brands
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto rounded-full mix-blend-screen"></div>
          </div>

          <div className="space-y-24">
            {Object.entries(groupedBrands).map(([groupName, groupBrands]) => (
              <div key={groupName}>
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-10 text-text-tertiary flex items-center gap-4">
                  <span>{groupName}</span>
                  <div className="flex-1 h-px bg-black/5"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {groupBrands.map((brand) => (
                    <Link to={`/catalog?brand=${brand.id}`} key={brand.id} className="brand-card group relative bg-surface border border-black/5 rounded-2xl p-5 transition-all duration-500 hover:scale-[1.02] hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden">
                      {/* Hover Slide Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0"></div>

                      <div className="relative z-10">
                        {brand.image && (
                          <div className="h-40 bg-gradient-to-br from-black/5 to-transparent rounded-xl mb-6 overflow-hidden flex items-center justify-center border border-black/5 shadow-inner">
                            <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-6 mix-blend-darken opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                          </div>
                        )}
                        <div className="mb-6">
                          <h3 className="text-3xl font-serif italic text-text-primary mb-3">{brand.name}</h3>
                          <p className="text-text-secondary text-sm leading-relaxed h-10">{brand.tagline}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="bg-black/5 text-gold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold/20 backdrop-blur-md font-mono">{brand.puffRange}</span>
                          {brand.id.includes('nonic') && (
                            <span className="bg-black/5 text-accent-blue text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-accent-blue/20 backdrop-blur-md font-mono">0% Nicotine</span>
                          )}
                        </div>

                        <div className="flex items-center text-text-primary text-xs tracking-widest uppercase font-bold group-hover:gap-3 transition-all relative">
                          <span className="group-hover:text-gold transition-colors">Access Terminal</span> <ArrowRight className="w-4 h-4 ml-2 text-gold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
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
