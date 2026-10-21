import React, { useState, useEffect } from 'react';
import { 
  X, 
  PackagePlus, 
  IndianRupee, 
  AlertTriangle, 
  Tag, 
  CheckCircle2 
} from 'lucide-react';
import { saveItem } from '../services/inventoryService';

export function AddEditItemModal({ 
  isOpen, 
  onClose, 
  editItem, 
  lang, 
  t, 
  onSuccess 
}) {
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [category, setCategory] = useState('Staples');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('10');
  const [costPrice, setCostPrice] = useState('20');
  const [sellingPrice, setSellingPrice] = useState('25');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [barcode, setBarcode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '');
      setNameHi(editItem.nameHi || '');
      setCategory(editItem.category || 'Staples');
      setUnit(editItem.unit || 'kg');
      setStock((editItem.stock || 0).toString());
      setCostPrice((editItem.costPrice || 0).toString());
      setSellingPrice((editItem.sellingPrice || 0).toString());
      setMinStockAlert((editItem.minStockAlert || 5).toString());
      setBarcode(editItem.barcode || '');
      setErrorMsg('');
    } else {
      setName('');
      setNameHi('');
      setCategory('Staples');
      setUnit('kg');
      setStock('10');
      setCostPrice('20');
      setSellingPrice('25');
      setMinStockAlert('5');
      setBarcode('');
      setErrorMsg('');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया सामान का नाम दर्ज करें।' : 'Please enter product name.');
      return;
    }

    const parsedStock = parseFloat(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMsg(lang === 'hi' ? 'स्टॉक 0 या उससे अधिक होना चाहिए।' : 'Stock quantity must be >= 0.');
      return;
    }

    try {
      await saveItem({
        id: editItem ? editItem.id : undefined,
        name,
        nameHi,
        category,
        unit,
        stock: parsedStock,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        minStockAlert: parseFloat(minStockAlert) || 0,
        barcode,
        status: 'active'
      });
      onSuccess();
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
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {editItem 
                  ? (lang === 'hi' ? 'सामान का विवरण बदलें' : 'Edit Product Details') 
                  : t.addItem}
              </h3>
              <p className="text-[11px] text-slate-500">{t.addItemSub}</p>
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
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Name in English */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.itemName} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sugar 1kg or Tata Salt"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Name in Hindi */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.itemHindiName}
            </label>
            <input
              type="text"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              placeholder="उदा. चीनी 1 किलो / टाटा नमक"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Staples">Staples (अनाज व आटा)</option>
                <option value="Oils">Oils (तेल व घी)</option>
                <option value="Pulses">Pulses (दालें)</option>
                <option value="Spices">Spices (मसाले व नमक)</option>
                <option value="Beverages">Beverages (चाय व कॉफ़ी)</option>
                <option value="Snacks">Snacks (नाश्ता व बिस्कुट)</option>
                <option value="Dairy">Dairy (डेयरी उत्पाद)</option>
                <option value="Household">Household (सफ़ाई व घरेलू)</option>
                <option value="Mobile">Mobile (मोबाइल एक्सेसरीज)</option>
                <option value="General">General (सामान्य)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.unit}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="kg">kg (किलो)</option>
                <option value="g">g (ग्राम)</option>
                <option value="pkt">pkt (पैकेट)</option>
                <option value="ltr">ltr (लीटर)</option>
                <option value="pcs">pcs (पीस)</option>
                <option value="doz">doz (दर्जन)</option>
                <option value="box">box (पेटी/डिब्बा)</option>
              </select>
            </div>
          </div>

          {/* Current Stock & Alert Threshold */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.stockQty} ({unit}) *
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.minStockAlert} ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Pricing: Cost & Selling Price */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.costPrice}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.sellingPrice} *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold text-blue-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
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
              <span>{t.saveItem}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
