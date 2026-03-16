import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Shield, Lock, ChevronRight } from 'lucide-react';
import { useCart } from '../src/context/CartContext';

type PaymentMethod = 'card' | 'apple' | 'google';

const Checkout: React.FC = () => {
  const { items, getTotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= 250;
  const shipping = isFreeShipping ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Format card number with spaces
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry as MM/YY
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Enter a valid card number';
      if (!cardName.trim()) newErrors.cardName = 'Name on card is required';
      if (expiry.length < 5) newErrors.expiry = 'Enter valid expiry';
      if (cvv.length < 3) newErrors.cvv = 'Enter valid CVV';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearCart();
    navigate('/order-confirmation', { state: { total, itemCount, orderId: `TY-${Date.now().toString(36).toUpperCase()}` } });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
        <p className="text-slate-500 text-sm mb-4">Your cart is empty.</p>
        <Link to="/catalog" className="text-primary font-bold text-sm hover:underline">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-200 justify-between">
        <button onClick={() => navigate('/cart')} className="flex size-12 shrink-0 items-center justify-start text-slate-900 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-slate-900 text-lg font-bold uppercase tracking-widest flex-1 text-center">Checkout</h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-28">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider hidden sm:block">Cart</span>
          </div>
          <div className="w-8 h-px bg-primary" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider hidden sm:block">Payment</span>
          </div>
          <div className="w-8 h-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Done</span>
          </div>
        </div>

        {/* Contact Information */}
        <section className="mb-8">
          <h3 className="text-slate-900 font-bold text-base mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-slate-200'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </section>

        {/* Payment Method Selection */}
        <section className="mb-8">
          <h3 className="text-slate-900 font-bold text-base mb-4">Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary' : 'text-slate-400'}`} />
              <span className={`text-xs font-semibold ${paymentMethod === 'card' ? 'text-primary' : 'text-slate-500'}`}>Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('apple')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'apple'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Smartphone className={`w-6 h-6 ${paymentMethod === 'apple' ? 'text-primary' : 'text-slate-400'}`} />
              <span className={`text-xs font-semibold ${paymentMethod === 'apple' ? 'text-primary' : 'text-slate-500'}`}>Apple Pay</span>
            </button>
            <button
              onClick={() => setPaymentMethod('google')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'google'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Smartphone className={`w-6 h-6 ${paymentMethod === 'google' ? 'text-primary' : 'text-slate-400'}`} />
              <span className={`text-xs font-semibold ${paymentMethod === 'google' ? 'text-primary' : 'text-slate-500'}`}>Google Pay</span>
            </button>
          </div>
        </section>

        {/* Card Details (only for card payment) */}
        {paymentMethod === 'card' && (
          <section className="mb-8 animate-in">
            <h3 className="text-slate-900 font-bold text-base mb-4">Card Details</h3>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.cardNumber ? 'border-red-400' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-12`}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                </div>
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Name on Card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.cardName ? 'border-red-400' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
                />
                {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.expiry ? 'border-red-400' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
                  />
                  {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">CVV</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.cvv ? 'border-red-400' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10`}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                  {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Apple/Google Pay placeholder */}
        {paymentMethod !== 'card' && (
          <section className="mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center text-center">
              <Smartphone className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-900 font-semibold text-sm mb-1">
                {paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}
              </p>
              <p className="text-slate-500 text-xs">
                You'll be redirected to complete payment with {paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}.
              </p>
            </div>
          </section>
        )}

        {/* Order Summary */}
        <section className="border-t border-slate-200 pt-6 mb-6">
          <h3 className="text-slate-900 font-bold text-base mb-4">Order Summary</h3>
          <div className="space-y-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate max-w-[60%]">{product.name} × {quantity}</span>
                <span className="text-slate-900 font-medium">${((product.price || 0) * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span className={isFreeShipping ? 'text-green-600 font-medium' : 'font-medium'}>{isFreeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-slate-400">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">256-bit SSL Encrypted • Secure Checkout</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleCheckout}
          disabled={processing}
          className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all mb-20 ${
            processing
              ? 'bg-slate-300 text-slate-500 cursor-wait'
              : 'bg-primary hover:bg-primary/90 text-white'
          }`}
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay ${total.toFixed(2)}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </main>
    </div>
  );
};

export default Checkout;
