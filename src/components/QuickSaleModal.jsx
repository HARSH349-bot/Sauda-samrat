import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  IndianRupee, 
  AlertCircle, 
  CheckCircle2, 
  User 
} from 'lucide-react';
import { formatCurrency, formatQty, recordSale } from '../services/inventoryService';

export function QuickSaleModal({ isOpen, onClose, items, lang, t, onSaleSuccess }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qty, setQty] = useState('1');
  const [partyName, setPartyName] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash (नकद)');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id.toString());
      setQty('1');
      setErrorMsg('');
      setPartyName(lang === 'hi' ? 'नकद ग्राहक' : 'Walk-in Customer');
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id.toString() === selectedItemId);
  const unitPrice = currentItem ? currentItem.sellingPrice : 0;
  const numQty = parseFloat(qty) || 0;
  const totalBill = (unitPrice * numQty).toFixed(2);
  const currentStock = currentItem ? parseFloat(currentItem.stock) || 0 : 0;

  const handleStepQty = (delta) => {
    const current = parseFloat(qty) || 0;
    const next = Math.max(0.25, parseFloat((current + delta).toFixed(2)));
    setQty(next.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentItem) {
      setErrorMsg(lang === 'hi' ? 'कृपया सामान चुनें।' : 'Please select an item.');
      return;
    }

    if (numQty <= 0) {
      setErrorMsg(lang === 'hi' ? 'मात्रा 0 से अधिक होनी चाहिए।' : 'Quantity must be greater than 0.');
      return;
    }

    if (currentStock < numQty) {
      setErrorMsg(
        lang === 'hi'
          ? `अपर्याप्त स्टॉक! दुकान में केवल ${formatQty(currentStock, currentItem.unit)} उपलब्ध है।`
          : `Insufficient stock! Only ${formatQty(currentStock, currentItem.unit)} available.`
      );
      return;
    }

    try {
      await recordSale({
        itemId: currentItem.id,
        qty: numQty,
        paymentMode,
        partyName: partyName.trim() || (lang === 'hi' ? 'नकद ग्राहक' : 'Walk-in Customer')
      });
      onSaleSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t.fastSale}</h3>
              <p className="text-[11px] text-slate-500">{t.fastSaleSub}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="touch-target p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Item Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {lang === 'hi' ? 'सामान चुनें (Item)' : 'Select Product'}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setErrorMsg('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} {i.nameHi ? `(${i.nameHi})` : ''} — {formatCurrency(i.sellingPrice)} [स्टॉक: {formatQty(i.stock, i.unit)}]
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Indicator */}
          {currentItem && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-medium">
                {lang === 'hi' ? 'दुकान में उपलब्ध:' : 'Available in shop:'}
              </span>
              <span className={`font-bold ${currentStock < 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatQty(currentStock, currentItem.unit)}
              </span>
            </div>
          )}

          {/* Decimal Quantity Selector with Stepper Buttons */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.quantity} ({currentItem ? currentItem.unit : ''})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepQty(-0.5)}
                className="touch-target p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-200 active:scale-95 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
                className="flex-1 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => handleStepQty(0.5)}
                className="touch-target p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-200 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-1.5 justify-center">
              {[0.25, 0.5, 1, 2, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQty(preset.toString())}
                  className="px-2.5 py-1 bg-slate-100 text-[10px] text-slate-700 rounded-lg hover:bg-slate-200 font-semibold border border-slate-200"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.customerName}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. रमेश जी या नकद ग्राहक' : 'e.g. Walk-in Customer'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.paymentMode}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash (नकद)', label: t.cash },
                { id: 'UPI / Online', label: t.online },
                { id: 'Khata (उधार)', label: t.credit }
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPaymentMode(mode.id)}
                  className={`touch-target p-2 rounded-xl border text-[11px] font-bold transition text-center ${
                    paymentMode === mode.id
                      ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Calculation Display */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">{t.totalAmount}:</span>
              <span className="text-xl font-extrabold text-blue-700">
                {formatCurrency(totalBill)}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {formatQty(qty, currentItem?.unit)} @ {formatCurrency(unitPrice)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="touch-target flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="touch-target flex-1 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.completeSale}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
