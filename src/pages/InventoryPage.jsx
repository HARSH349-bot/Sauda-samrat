import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Archive, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Scan, 
  Clock, 
  Coins, 
  Share2 
} from 'lucide-react';
import { 
  formatCurrency, 
  formatQty, 
  softDeleteItem, 
  isLowStock, 
  isDeadStock, 
  getTiedCapital, 
  generateDistributorWhatsAppMessage 
} from '../services/inventoryService';

export function InventoryPage({ 
  items, 
  t, 
  lang, 
  shopName, 
  onOpenAddItem, 
  onEditItem, 
  onRefresh, 
  initialFilter = 'all' 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(initialFilter); // 'all', 'low', 'dead'

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(q) || 
      (item.nameHi && item.nameHi.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.barcode && item.barcode.includes(q));

    if (!matchesSearch) return false;

    if (filterType === 'low') {
      return isLowStock(item);
    }
    if (filterType === 'dead') {
      return isDeadStock(item);
    }
    return true;
  });

  const lowCount = items.filter(isLowStock).length;
  const deadItems = items.filter(isDeadStock);
  const deadCount = deadItems.length;
  const totalDeadCapital = deadItems.reduce((sum, i) => sum + getTiedCapital(i), 0);

  const handleDelete = async (itemId, name) => {
    const confirmMsg = lang === 'hi' 
      ? `क्या आप सचमुच '${name}' को निष्क्रिय (archive) करना चाहते हैं?` 
      : `Are you sure you want to archive '${name}'?`;
    if (window.confirm(confirmMsg)) {
      await softDeleteItem(itemId);
      onRefresh();
    }
  };

  const handleShareDistributorOrder = () => {
    const lowItems = items.filter(isLowStock);
    const msg = generateDistributorWhatsAppMessage(lowItems, shopName);
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Title & Add Action Header (matches reference UI) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.inventory}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.subInventory}
          </p>
        </div>

        <button
          onClick={onOpenAddItem}
          className="touch-target bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.addItem}</span>
        </button>
      </div>

      {/* Search Input Bar with Scan Barcode Icon */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-sm"
        />
        <button 
          type="button"
          onClick={() => alert(lang === 'hi' ? 'बारकोड स्कैनर सक्रिय है।' : 'Barcode scanner camera ready.')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          title="Scan barcode"
        >
          <Scan className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Main Filter Buttons: All Categories | Low Stock | Dead Stock */}
      <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setFilterType('all')}
          className={`touch-target px-4 py-2 rounded-xl transition font-medium border flex items-center gap-1.5 shrink-0 ${
            filterType === 'all'
              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>{t.allCategories}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {items.length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('low')}
          className={`touch-target px-4 py-2 rounded-xl transition font-medium border flex items-center gap-1.5 shrink-0 ${
            filterType === 'low'
              ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>{t.lowStock}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === 'low' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-700 font-bold'}`}>
            {lowCount}
          </span>
        </button>

        <button
          onClick={() => setFilterType('dead')}
          className={`touch-target px-4 py-2 rounded-xl transition font-medium border flex items-center gap-1.5 shrink-0 ${
            filterType === 'dead'
              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.deadStock}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === 'dead' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-700 font-bold'}`}>
            {deadCount}
          </span>
        </button>
      </div>

      {/* Dead Stock Informational Banner when filtered */}
      {filterType === 'dead' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Coins className="w-4 h-4 text-amber-700" />
            <span>{lang === 'hi' ? 'डेड स्टॉक में फंसी कुल पूंजी: ' : 'Total Capital Tied in Dead Stock: '}</span>
            <span className="text-sm font-extrabold text-amber-800">{formatCurrency(totalDeadCapital)}</span>
          </div>
          <p className="text-[11px] text-amber-700">
            {lang === 'hi' 
              ? 'इन सामानों की पिछले 30+ दिनों से कोई बिक्री नहीं हुई है। नया आर्डर रोकने या छूट देकर निकालने की सलाह दी जाती है।'
              : 'These items have had zero sales for 30+ days. Consider pausing reorders or offering promotional discounts.'}
          </p>
        </div>
      )}

      {/* Low Stock Share Order Banner when filtered */}
      {filterType === 'low' && lowCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-xs text-rose-900">
          <div>
            <span className="font-bold block">{lowCount} {lang === 'hi' ? 'आइटम खत्म होने वाले हैं' : 'items require reorder'}</span>
            <span className="text-[11px] text-rose-700">{lang === 'hi' ? 'थोक व्यापारी को तुरंत मांग भेजें' : 'Send PO to distributor via WhatsApp'}</span>
          </div>
          <button
            onClick={handleShareDistributorOrder}
            className="touch-target bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'आर्डर भेजें' : 'WhatsApp'}</span>
          </button>
        </div>
      )}

      {/* Items List in White Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-sm">
            {lang === 'hi' ? 'कोई सामान नहीं मिला।' : 'No items match your filter.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLow = isLowStock(item);
            const isDead = isDeadStock(item);
            const tiedCapital = getTiedCapital(item);

            return (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {item.name}
                      </h3>
                      {isLow && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>LOW STOCK</span>
                        </span>
                      )}
                      {isDead && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>DEAD STOCK ({item.lastSoldDaysAgo}d)</span>
                        </span>
                      )}
                    </div>

                    {item.nameHi && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {item.nameHi}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                      {isDead && (
                        <span className="text-amber-700 font-medium">
                          • {formatCurrency(tiedCapital)} {t.tiedCapital}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-blue-700">
                      {formatCurrency(item.sellingPrice)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {lang === 'hi' ? 'खरीद: ' : 'Cost: '} {formatCurrency(item.costPrice)}
                    </div>
                  </div>
                </div>

                {/* Stock info and action buttons */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">{t.stockQty}:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      isLow 
                        ? 'bg-rose-50 text-rose-700' 
                        : isDead 
                        ? 'bg-amber-50 text-amber-800' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {formatQty(item.stock, item.unit)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Alert: ≤ {formatQty(item.minStockAlert, item.unit)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditItem(item)}
                      className="touch-target p-2 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="touch-target p-2 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                      title="Archive / Soft Delete"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
