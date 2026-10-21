import React, { useState } from 'react';
import { 
  X, 
  ClipboardList, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ShoppingCart, 
  Package, 
  Search, 
  Sparkles 
} from 'lucide-react';
import { 
  POPULAR_FMCG_CATALOG, 
  formatCurrency, 
  formatQty, 
  addFMCGProductToStock, 
  recordSale 
} from '../services/inventoryService';

export function FMCGCatalogModal({ 
  isOpen, 
  onClose, 
  existingItems = [], 
  lang, 
  t, 
  onSuccess 
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});
  const [actionNotice, setActionNotice] = useState('');

  if (!isOpen) return null;

  // Map existing items by lower-cased name for quick lookup of shop stock
  const stockMap = {};
  existingItems.forEach((i) => {
    stockMap[i.name.toLowerCase()] = i;
  });

  const getQty = (id, def) => quantities[id] !== undefined ? quantities[id] : def;

  const setQty = (id, val) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, parseFloat(val) || 1)
    }));
  };

  const handleStep = (id, def, delta) => {
    const cur = getQty(id, def);
    setQty(id, cur + delta);
  };

  // Add FMCG item to Stock
  const handleAddToStock = async (fmcg) => {
    const qty = getQty(fmcg.id, fmcg.defaultAddQty);
    try {
      const res = await addFMCGProductToStock(fmcg, qty);
      setActionNotice(
        lang === 'hi' 
          ? `✓ '${fmcg.name}' के ${qty} ${fmcg.unit} दुकान के स्टॉक में जोड़े गए!` 
          : `✓ Added ${qty} ${fmcg.unit} of '${fmcg.name}' to shop stock!`
      );
      setTimeout(() => setActionNotice(''), 3000);
      onSuccess();
    } catch (err) {
      alert(err.message);
    }
  };

  // Sell FMCG item directly
  const handleSellNow = async (fmcg) => {
    const existing = stockMap[fmcg.name.toLowerCase()];
    if (!existing || existing.stock < 1) {
      const confirmAdd = window.confirm(
        lang === 'hi'
          ? `'${fmcg.name}' का स्टॉक अभी दुकान में नहीं है। क्या आप पहले 10 ${fmcg.unit} स्टॉक में जोड़कर 1 बेचना चाहते हैं?`
          : `'${fmcg.name}' has 0 stock. Add ${fmcg.defaultAddQty} ${fmcg.unit} to stock and record 1 sale?`
      );
      if (confirmAdd) {
        await addFMCGProductToStock(fmcg, fmcg.defaultAddQty);
        onSuccess();
      } else {
        return;
      }
    }

    try {
      // Find the freshly loaded or existing item
      const itemToSell = stockMap[fmcg.name.toLowerCase()];
      if (itemToSell) {
        await recordSale({
          itemId: itemToSell.id,
          qty: 1,
          paymentMode: 'Cash (नकद)',
          partyName: lang === 'hi' ? 'नकद ग्राहक' : 'Walk-in Customer'
        });
        setActionNotice(
          lang === 'hi'
            ? `✓ '${fmcg.name}' की बिक्री दर्ज हुई! (₹${fmcg.sellingPrice})`
            : `✓ Sold 1 ${fmcg.unit} of '${fmcg.name}'! (₹${fmcg.sellingPrice})`
        );
        setTimeout(() => setActionNotice(''), 3000);
        onSuccess();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const categories = ['All', 'Snacks', 'Household', 'Beverages', 'Spices', 'Dairy', 'Oils'];

  const filteredCatalog = POPULAR_FMCG_CATALOG.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(q) || 
      (item.nameHi && item.nameHi.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 text-slate-800 space-y-3.5 max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>{t.fmcgModalTitle}</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded-full">
                  FMCG
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">{t.fmcgModalSub}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="touch-target p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Success Toast */}
        {actionNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'FMCG सामान खोजें (उदा. Parle-G, Maggi, Dettol)...' : 'Search FMCG product (e.g. Parle-G, Maggi, Dettol)...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg border shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FMCG Catalog Scrollable Cards List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
          {filteredCatalog.map((fmcg) => {
            const existing = stockMap[fmcg.name.toLowerCase()];
            const inStock = existing ? existing.stock : 0;
            const chosenQty = getQty(fmcg.id, fmcg.defaultAddQty);

            return (
              <div 
                key={fmcg.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-3 shadow-xs space-y-2 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {fmcg.name}
                    </h4>
                    {fmcg.nameHi && (
                      <p className="text-[11px] text-slate-500 font-medium">
                        {fmcg.nameHi}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                        {fmcg.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        existing 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {existing ? `${t.inShopStock}: ${formatQty(inStock, fmcg.unit)}` : t.notInShopYet}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 block">
                      {formatCurrency(fmcg.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Cost: {formatCurrency(fmcg.costPrice)}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Qty Stepper + Add to Stock & Sell Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStep(fmcg.id, fmcg.defaultAddQty, -1)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold border border-slate-200"
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={chosenQty}
                      onChange={(e) => setQty(fmcg.id, e.target.value)}
                      className="w-12 text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg py-1 text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(fmcg.id, fmcg.defaultAddQty, 1)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold border border-slate-200"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] text-slate-500 ml-1">{fmcg.unit}</span>
                  </div>

                  {/* Dual Action Buttons: Add Stock / Sell Now */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToStock(fmcg)}
                      className="touch-target bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t.addToStock}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSellNow(fmcg)}
                      className="touch-target bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 border border-slate-200 transition"
                      title="Sell 1 unit now"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.sellNow}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="touch-target bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition"
          >
            {t.cancel}
          </button>
        </div>

      </div>
    </div>
  );
}
