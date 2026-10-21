import React, { useState } from 'react';
import { 
  IndianRupee, 
  AlertTriangle, 
  Package, 
  PlusCircle, 
  ClipboardList, 
  Share2, 
  ArrowUpRight, 
  Undo2, 
  CheckCircle2, 
  Clock, 
  Coins 
} from 'lucide-react';
import { 
  formatCurrency, 
  formatQty, 
  generateDistributorWhatsAppMessage, 
  undoSale 
} from '../services/inventoryService';

export function DashboardPage({ 
  stats, 
  lowStockItems, 
  deadStockItems = [], 
  t, 
  lang, 
  shopName, 
  onOpenFMCGList, 
  onOpenAddItem, 
  onNavigateInventory, 
  onRefresh 
}) {
  const [undoStatus, setUndoStatus] = useState('');

  const handleUndo = async (transactionId) => {
    try {
      await undoSale(transactionId);
      setUndoStatus(lang === 'hi' ? 'बिक्री सफलतापूर्वक रद्द कर दी गई!' : 'Sale undone successfully!');
      setTimeout(() => setUndoStatus(''), 3000);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleShareWhatsAppDistributor = () => {
    const message = generateDistributorWhatsAppMessage(lowStockItems, shopName);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Undo Notification Alert */}
      {undoStatus && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{undoStatus}</span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid (White cards, subtle borders, navy text) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Today's Sales */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-500">{t.todaysSales}</div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 block">
              {formatCurrency(stats.todaySales)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{stats.todaySalesCount} {lang === 'hi' ? 'बिक्री पर्चियां' : 'sales today'}</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Low Stock Warning */}
        <div 
          onClick={() => onNavigateInventory('low')}
          className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-300 transition"
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{t.lowStockAlerts}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold tracking-tight block ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {stats.lowStockCount}
            </span>
            <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
              {stats.lowStockCount > 0 ? (lang === 'hi' ? 'रीऑर्डर जरूरी' : 'Reorder needed') : (lang === 'hi' ? 'पर्याप्त स्टॉक' : 'All optimal')}
            </span>
          </div>
        </div>

        {/* Metric 3: Dead Stock Tracker */}
        <div 
          onClick={() => onNavigateInventory('dead')}
          className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-300 transition"
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{t.deadStockAlerts}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-amber-700 block">
              {stats.deadStockCount || 0}
            </span>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              {formatCurrency(stats.deadStockCapital || 0)} {lang === 'hi' ? 'फंसी पूंजी' : 'locked'}
            </span>
          </div>
        </div>

        {/* Metric 4: Total Products */}
        <div 
          onClick={() => onNavigateInventory('all')}
          className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 transition"
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{t.totalItems}</span>
            <Package className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-slate-800 block">
              {stats.totalItems}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
              {lang === 'hi' ? 'सक्रिय सामान सूची' : 'Active catalog'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (Replaced 'Create Order' with 'FMCG Ready List' + 'Add Item') */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {lang === 'hi' ? 'त्वरित कार्य (Quick Actions)' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Replaced Create Order with FMCG Ready List */}
          <button
            onClick={onOpenFMCGList}
            className="touch-target p-3.5 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 rounded-xl flex items-center gap-3 transition group active:scale-95"
          >
            <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm group-hover:scale-105 transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-blue-900 leading-tight">{t.fmcgList}</div>
              <div className="text-[11px] text-blue-700 font-medium">{t.fmcgListSub}</div>
            </div>
          </button>

          <button
            onClick={onOpenAddItem}
            className="touch-target p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 transition group active:scale-95"
          >
            <div className="p-2.5 bg-slate-800 text-white rounded-lg shadow-sm group-hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900 leading-tight">{t.addItem}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.addItemSub}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Low Stock Alert List with Reorder Buttons */}
      {lowStockItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.lowStockAlerts} ({lowStockItems.length})
              </h3>
            </div>
            <button
              onClick={handleShareWhatsAppDistributor}
              className="touch-target text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'व्हाट्सएप आर्डर' : 'Share Order'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto no-scrollbar">
            {lowStockItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    {lang === 'hi' && item.nameHi ? item.nameHi : item.name}
                  </p>
                  <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    {lang === 'hi' ? 'बचा हुआ: ' : 'Stock left: '}
                    <span>{formatQty(item.stock, item.unit)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">
                    {lang === 'hi' ? 'चेतावनी सीमा' : 'Alert at ≤'}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {formatQty(item.minStockAlert, item.unit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales Receipts with Undo Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.recentSales}
            </h3>
          </div>
        </div>

        {stats.recentSales.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">{t.noSalesYet}</p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-1">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} className="pt-2 pb-2 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800">{sale.itemName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{formatQty(sale.qty, sale.unit)}</span>
                    <span>•</span>
                    <span className="text-slate-700">{sale.partyName}</span>
                    <span>•</span>
                    <span className="text-blue-700 font-medium">{sale.paymentMode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                  <button
                    onClick={() => handleUndo(sale.id)}
                    className="touch-target p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                    title={t.undoLastSale}
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
