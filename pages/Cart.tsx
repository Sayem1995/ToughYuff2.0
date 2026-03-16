import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '../src/context/CartContext';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal, itemCount } = useCart();
  const navigate = useNavigate();

  /* ── Empty State ── */
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 text-sm mb-8">Add some products to get started!</p>
        <Link
          to="/catalog"
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-primary/25"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= 250;
  const shipping = isFreeShipping ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 flex items-center bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-200 justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex size-12 shrink-0 items-center justify-start text-slate-900 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-slate-900 text-lg font-bold uppercase tracking-widest flex-1 text-center">Your Cart</h1>
        <div className="flex w-12 items-center justify-end">
          <button
            onClick={clearCart}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Cart Items */}
        <div className="space-y-6">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md"
            >
              {/* Product Image */}
              <Link
                to={`/product/${product.id}`}
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-24 shrink-0 bg-slate-100"
                style={{ backgroundImage: `url(${product.image || 'https://via.placeholder.com/96x96?text=No+Image'})` }}
              />

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <Link to={`/product/${product.id}`}>
                      <p className="text-slate-900 text-base font-semibold leading-tight">{product.name}</p>
                    </Link>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{product.brandName}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-primary font-bold text-lg">${((product.price || 0) * quantity).toFixed(2)}</p>
                  <div className="flex items-center gap-3 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="text-slate-500 hover:text-primary transition-colors flex h-6 w-6 items-center justify-center rounded-full"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="text-slate-500 hover:text-primary transition-colors flex h-6 w-6 items-center justify-center rounded-full"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Shipping Info ── */}
        <div className="mt-10 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-primary" />
            <p className="text-slate-900 font-semibold text-sm">Shipping Information</p>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Standard shipping (3-5 business days). {isFreeShipping
              ? 'Free shipping applied!'
              : `Free shipping on orders over $250 — add $${(250 - subtotal).toFixed(2)} more to qualify.`}
          </p>
        </div>

        {/* ── Order Summary ── */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-slate-900 text-lg font-bold tracking-tight mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-600">
              <span className="text-sm">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
              <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-sm">Shipping</span>
              <span className={`text-sm font-medium ${isFreeShipping ? 'text-green-600' : ''}`}>
                {isFreeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-sm">Estimated Tax</span>
              <span className="text-sm font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Checkout Button ── */}
        <div className="mt-8 mb-24">
          <Link to="/checkout" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-center text-slate-400 text-[10px] mt-4 uppercase tracking-[0.2em]">
            * Visit our store to complete your purchase. Must be 21+ with valid ID.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Cart;
