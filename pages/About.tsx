import React from 'react';
import { ShieldCheck, Layers, Ban } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="pt-20 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="h-[500px] bg-card-bg border-2 border-dashed border-gold/30 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <span className="text-gold font-bold text-xl">TooughYuff</span>
              <p className="text-text-tertiary mt-2">Store Interior / Team Photo Placeholder</p>
            </div>
          </div>

          <div>
             <h1 className="text-4xl md:text-5xl font-bold mb-6">Built for <span className="text-gold">Flavor Hunters</span></h1>
             <p className="text-lg text-text-secondary mb-6 leading-relaxed">
               TooughYuff was created to solve a simple problem: knowing what's in stock before you walk in the door. We aren't just another vape shop; we are a curated gallery of the market's best disposable devices.
             </p>
             <p className="text-lg text-text-secondary mb-10 leading-relaxed">
               Our mission is to provide transparency and variety. Whether you are looking for the newest 25k puff device or a zero-nicotine alternative to help you quit, our digital shelf reflects our physical inventory.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-surface p-6 rounded-xl border border-white/5">
                 <Layers className="text-gold mb-4 w-8 h-8" />
                 <h3 className="font-bold text-white mb-2">Multi-Brand Catalog</h3>
                 <p className="text-sm text-text-tertiary">We stock the top rated brands globally, ensuring quality and consistency.</p>
               </div>
               <div className="bg-surface p-6 rounded-xl border border-white/5">
                 <Ban className="text-accent-blue mb-4 w-8 h-8" />
                 <h3 className="font-bold text-white mb-2">Zero Nicotine Options</h3>
                 <p className="text-sm text-text-tertiary">A dedicated selection for those reducing their nicotine intake.</p>
               </div>
               <div className="bg-surface p-6 rounded-xl border border-white/5 md:col-span-2">
                 <ShieldCheck className="text-gold mb-4 w-8 h-8" />
                 <h3 className="font-bold text-white mb-2">21+ Compliance</h3>
                 <p className="text-sm text-text-tertiary">We strictly adhere to all local and federal regulations. ID verification is required for all in-store purchases.</p>
               </div>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
