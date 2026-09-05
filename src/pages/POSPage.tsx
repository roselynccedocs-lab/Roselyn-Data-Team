import * as React from 'react';
import { useState } from 'react';
import { posCatalog, sampleTransactions, POSProduct } from '../data/mockPosData';
import { POSTransaction } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Receipt, 
  RotateCcw,
  Barcode,
  Layers,
  Sparkles,
  User
} from 'lucide-react';

interface CartItem {
  product: POSProduct;
  qty: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<POSProduct[]>(posCatalog);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([
    { product: posCatalog[0], qty: 2 },
    { product: posCatalog[4], qty: 3 }
  ]);
  const [customerName, setCustomerName] = useState('Walk-in Client / Lab Counter');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<POSTransaction[]>(sampleTransactions);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<POSTransaction['paymentMethod']>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>('');
  
  // Completed Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<POSTransaction | null>(null);

  const categories = [
    'ALL',
    'Industrial Solvents',
    'Lab Reagents',
    'Safety Equipment',
    'Sanitation & Disinfectants',
    'Packaging & Containers'
  ];

  // Cart calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const grandTotal = Math.max(rawSubtotal - discountAmount, 0);
  const taxAmount = (grandTotal / 1.12) * 0.12; // 12% VAT Philippines
  const vatableSales = grandTotal - taxAmount;

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (prod: POSProduct) => {
    const existing = cart.find(c => c.product.id === prod.id);
    if (existing) {
      setCart(cart.map(c => c.product.id === prod.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { product: prod, qty: 1 }]);
    }
  };

  const updateQty = (prodId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.product.id === prodId) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : null;
      }
      return c;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (prodId: string) => {
    setCart(cart.filter(c => c.product.id !== prodId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const tendered = parseFloat(amountTendered) || grandTotal;
    const change = Math.max(tendered - grandTotal, 0);

    const tx: POSTransaction = {
      id: `TX-${Math.floor(9000 + Math.random() * 1000)}`,
      receiptNumber: `POS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      cashierName: 'Dr. Arnold Cortina (Cashier 01)',
      customerName: customerName || 'Walk-in Client',
      items: cart.map(c => ({
        productId: c.product.id,
        name: c.product.name,
        sku: c.product.sku,
        price: c.product.price,
        qty: c.qty,
        total: c.product.price * c.qty
      })),
      subtotal: rawSubtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      paymentMethod,
      amountTendered: tendered,
      change,
      timestamp: Date.now()
    };

    setRecentTransactions([tx, ...recentTransactions]);
    setActiveReceipt(tx);
    setShowPaymentModal(false);
    clearCart();
    setAmountTendered('');
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Cloud POS Terminal
            </span>
            <span className="text-xs text-slate-400">• Real-Time Counter & Sales Checkout</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Cloud Point of Sale (POS) System
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Fast, seamless chemical counter transactions, barcode scanning, multi-tender payments, and instant BIR-ready receipt issuing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">Terminal 01: Online</span>
          </div>
        </div>
      </div>

      {/* POS Workspace Layout (Catalog on Left 65%, Active Cart on Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Product Grid & Barcode Search */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Scan barcode or search by chemical name / SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-400">{prod.sku}</span>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                      Stock: {prod.stock} {prod.unit}s
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 line-clamp-2 leading-snug">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{prod.category}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(prod.price)}
                  </span>
                  <button className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Active Transaction Cart & Register Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4 flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Cart Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Order Cart</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs">
                    {totalItemsInCart} items
                  </span>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              {/* Customer Input */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Customer / Account</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer or client name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs">Cart is currently empty.</p>
                    <p className="text-[10px]">Select items from the catalog or scan a barcode.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400">{formatCurrency(item.product.price)} / {item.product.unit}</p>
                      </div>

                      {/* Qty modifier */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="w-5 h-5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-xs">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          className="w-5 h-5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.product.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout Button */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Gross):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(rawSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>12% VAT Included:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Discount:</span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${discountPercent === pct ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <span className="text-rose-600 font-bold ml-1">-{formatCurrency(discountAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-base">
                <span className="font-extrabold text-slate-900 dark:text-white">Grand Total:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xl">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setAmountTendered(grandTotal.toString());
                  setShowPaymentModal(true);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <CreditCard className="w-4 h-4" /> Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table & Register summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily POS Sales Register (Z-Reading Log)</h3>
            <p className="text-xs text-slate-400">Authenticated transaction journals with BIR compliant breakdown</p>
          </div>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600">{tx.receiptNumber}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{tx.customerName}</span>
                  <span className="text-[10px] text-slate-400">• {formatDate(tx.timestamp)}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cashier: {tx.cashierName} • Payment: <strong className="text-slate-700 dark:text-slate-300">{tx.paymentMethod}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{formatCurrency(tx.grandTotal)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">VAT: {formatCurrency(tx.taxAmount)}</p>
                </div>
                <button
                  onClick={() => setActiveReceipt(tx)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5" /> Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Tender Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Process Payment & Tender</h3>
                <p className="text-slate-500">Order Total: <strong>{formatCurrency(grandTotal)}</strong></p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: 'Cash Tender' },
                  { id: 'CARD', label: 'Credit/Debit' },
                  { id: 'GCASH', label: 'GCash QR' },
                  { id: 'MAYA', label: 'Maya Pay' },
                  { id: 'CHARGE_INVOICE', label: 'On Account (30D)' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      paymentMethod === pm.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount Tendered (PHP)</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold outline-none"
                />
              </div>

              {/* Change preview for cash */}
              {paymentMethod === 'CASH' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Customer Change:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
                    {formatCurrency(Math.max((parseFloat(amountTendered) || grandTotal) - grandTotal, 0))}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-colors shadow-sm"
                >
                  Complete & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Thermal Receipt Preview Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-mono">
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
              <h2 className="font-extrabold text-base tracking-wider text-slate-900 dark:text-white">CENTAUR CHEM ENTERPRISE</h2>
              <p className="text-[10px] text-slate-500">BGC Corporate Center, Taguig City, Philippines</p>
              <p className="text-[10px] text-slate-500">VAT REG TIN: 004-982-134-000</p>
              <p className="text-[10px] font-bold text-blue-600 mt-1">OFFICIAL SALES INVOICE</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(activeReceipt.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{activeReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Client:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{activeReceipt.customerName}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-2 space-y-1.5 max-h-48 overflow-y-auto">
              {activeReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.qty} x {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(activeReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>12% VAT:</span>
                <span>{formatCurrency(activeReceipt.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-1">
                <span>TOTAL:</span>
                <span>{formatCurrency(activeReceipt.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1">
                <span>Payment ({activeReceipt.paymentMethod}):</span>
                <span>{formatCurrency(activeReceipt.amountTendered)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Change:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(activeReceipt.change)}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5 border-t border-dashed border-slate-300 dark:border-slate-700">
              <p>Thank you for trusting Centaur Chem Enterprise!</p>
              <p>THIS SERVES AS AN OFFICIAL RECEIPT</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold font-sans"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold font-sans flex items-center justify-center gap-1 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
