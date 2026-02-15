import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ACCOUNTS } from '../constants';
import { Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedStore, setSelectedStore] = useState<'goldmine' | 'ten2ten'>('goldmine');
  const [email, setEmail] = useState('goldmine@tooughyuff.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStoreSelect = (store: 'goldmine' | 'ten2ten') => {
    setSelectedStore(store);
    setEmail(`${store}@tooughyuff.com`);
    setPassword(''); // Clear password for security/convenience balance
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow manual override of email, but default to the store specific one
    const admin = ADMIN_ACCOUNTS.find(a => a.email === email && a.password === password);

    if (admin) {
      // Ensure the admin account actually matches the selected store intention, or just use the admin's assigned store
      localStorage.setItem('toughyuff_admin_store', admin.storeId);
      localStorage.setItem('toughyuff_admin_email', admin.email);
      onLogin();
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane */}
      <div className="hidden lg:flex w-1/2 bg-surface relative items-center justify-center p-12 border-r border-white/5">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 text-center">
          <div className="w-64 h-80 mx-auto bg-background border-2 border-dashed border-gold/30 rounded-xl mb-8 flex items-center justify-center">
            <span className="text-text-tertiary">Admin Visual / Logo</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TooughYuff Admin</h1>
          <p className="text-text-secondary">Product Availability Console</p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-surface rounded-full mb-4 border border-white/5">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Login</h2>
            <p className="text-text-tertiary mt-2">Sign in to manage stock</p>
          </div>

          {/* Store Toggles */}
          <div className="flex bg-surface border border-white/10 rounded-lg p-1 mb-8">
            <button
              onClick={() => handleStoreSelect('goldmine')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${selectedStore === 'goldmine'
                ? 'bg-gold text-black shadow-lg'
                : 'text-text-secondary hover:text-white'
                }`}
            >
              Goldmine
            </button>
            <button
              onClick={() => handleStoreSelect('ten2ten')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${selectedStore === 'ten2ten'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-text-secondary hover:text-white'
                }`}
            >
              TEN 2 TEN
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-gold focus:outline-none"
                placeholder="admin@tooughyuff.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-gold focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-gold text-background font-bold py-3 rounded-lg hover:brightness-110 transition-all">
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-text-tertiary">Protected system. Unauthorized access prohibited.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
