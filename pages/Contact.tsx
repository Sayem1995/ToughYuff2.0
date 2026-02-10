import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-text-secondary">Questions, brand inquiries, or corrections? Drop us a message.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="bg-surface p-8 rounded-xl border border-white/10 text-center hover:border-gold/30 transition-colors">
              <Mail className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-bold mb-2">Email</h3>
              <a href="mailto:hello@tooughyuff.com" className="text-sm text-text-secondary hover:text-white">hello@tooughyuff.com</a>
           </div>
           <div className="bg-surface p-8 rounded-xl border border-white/10 text-center hover:border-gold/30 transition-colors">
              <MapPin className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-bold mb-2">Visit Us</h3>
              <p className="text-sm text-text-secondary">123 Vapor Lane<br/>Metro City, ST 90210</p>
           </div>
           <div className="bg-surface p-8 rounded-xl border border-white/10 text-center hover:border-gold/30 transition-colors">
              <Phone className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-bold mb-2">Call</h3>
              <p className="text-sm text-text-secondary">(555) 123-4567</p>
           </div>
        </div>

        <div className="bg-surface p-8 md:p-12 rounded-2xl border border-white/5">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                <input type="text" className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input type="email" className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
              <textarea rows={5} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-gold text-background font-bold py-4 rounded-lg hover:brightness-110 transition-all">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
