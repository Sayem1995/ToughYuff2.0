import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../src/context/CartContext';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-500 text-sm mb-8">Add some products to get started!</p>
        <Link
          to="/catalog"
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/catalog" className="inline-flex items-center text-slate-500 hover:text-primary text-sm mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
          <p className="text-slate-500 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-600 font-bold uppercase tracking-wider transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all hover:shadow-md">
            {/* Product Image */}
            <Link to={`/product/${product.id}`} className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={product.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </Link>

            {/* Details */}
            <div className="flex-grow min-w-0">
              <Link to={`/product/${product.id}`} className="block">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 truncate">{product.brandName}</p>
              </Link>
              <p className="text-primary font-bold text-sm mt-1">${(product.price || 0).toFixed(2)}</p>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-6 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Subtotal & Remove */}
            <div className="flex flex-col items-end justify-between flex-shrink-0">
              <button
                onClick={() => removeFromCart(product.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ${((product.price || 0) * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h3>
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-2">
          <span>Subtotal ({itemCount} items)</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-4">
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
          <span className="text-lg font-bold text-primary">${getTotal().toFixed(2)}</span>
        </div>
        <p className="mt-4 text-xs text-slate-400 text-center">
          * Visit our store to complete your purchase. Must be 21+ with valid ID.
        </p>
      </div>
    </div>
  );
};

export default Cart;
