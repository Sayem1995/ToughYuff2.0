import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const { total, itemCount, orderId } = (location.state as any) || { total: 0, itemCount: 0, orderId: 'TY-UNKNOWN' };
  const [showContent, setShowContent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Staggered animation
    const t1 = setTimeout(() => setShowContent(true), 400);
    const t2 = setTimeout(() => setShowDetails(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-200 justify-center">
        <h1 className="text-slate-900 text-lg font-bold uppercase tracking-widest">Order Confirmed</h1>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-12 flex flex-col items-center text-center">
        {/* Success Animation */}
        <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="relative mb-8">
            {/* Outer ring pulse */}
            <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            {/* Inner circle */}
            <div className="relative w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Your order has been placed successfully. We'll notify you when it's ready.
          </p>
        </div>

        {/* Order Details */}
        <div className={`w-full mt-10 transition-all duration-700 ease-out delay-300 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Order ID Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</span>
              <span className="text-sm font-bold text-primary tracking-wider">{orderId}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items</span>
              <span className="text-sm font-bold text-slate-900">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid</span>
              <span className="text-xl font-bold text-primary">${(total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order Placed</p>
                  <p className="text-xs text-slate-400">Just now</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Processing</p>
                  <p className="text-xs text-slate-300">Pending</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Ready for Pickup</p>
                  <p className="text-xs text-slate-300">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-20">
            <Link
              to="/"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/catalog"
              className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Browse More Products
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
