import React, { useState } from 'react';
import { 
  ReceiptIndianRupee, 
  Search, 
  ShoppingCart, 
  User, 
  Phone, 
  Wallet, 
  IndianRupee, 
  CheckCircle2, 
  Undo2, 
  Share2 
} from 'lucide-react';
import { formatCurrency, formatQty, undoSale } from '../services/inventoryService';

export function OrdersPage({ 
  transactions, 
  t, 
  lang, 
  shopName, 
  onOpenQuickSale, 
  onRefresh 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const filteredTxns = transactions.filter((txn) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      txn.itemName.toLowerCase().includes(q) ||
      (txn.partyName && txn.partyName.toLowerCase().includes(q)) ||
      (txn.partyPhone && txn.partyPhone.includes(q));

    if (!matchesSearch) return false;

    if (filterMode === 'active') return txn.status === 'active';
    if (filterMode === 'cancelled') return txn.status === 'cancelled';
    return true;
  });

  const handleUndo = async (transactionId) => {
    const confirmMsg = lang === 'hi' 
      ? 'क्या आप सचमुच यह बिक्री रद्द करके स्टॉक वापस लौटाना चाहते हैं?' 
      : 'Are you sure you want to reverse this sale and restore stock?';
    if (window.confirm(confirmMsg)) {
      try {
        await undoSale(transactionId);
        onRefresh();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const shareReceipt = (txn) => {
    const text = `*${shopName} - Bill Receipt*\nBill No: #${txn.id}\nDate: ${new Date(txn.createdAt).toLocaleDateString('en-IN')}\nCustomer: ${txn.partyName}\nItem: ${txn.itemName}\nQty: ${formatQty(txn.qty, txn.unit)}\nAmount Paid: ${formatCurrency(txn.totalAmount)}\nPayment Mode: ${txn.paymentMode}\n\nThank you for shopping with us!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Title & Quick Sale Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.orders}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi' ? 'बिक्री पर्चियां व भुगतान विवरण' : 'Track payment status on every sale'}
          </p>
        </div>

        <button
          onClick={onOpenQuickSale}
          className="touch-target bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
          <span>{t.fastSale}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'hi' ? 'ग्राहक का नाम या सामान खोजें...' : 'Search by customer or item name...'}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setFilterMode('all')}
          className={`touch-target px-3.5 py-1.5 rounded-xl border transition ${
            filterMode === 'all'
              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'hi' ? 'सभी पर्चियां' : 'All Bills'}
        </button>
        <button
          onClick={() => setFilterMode('active')}
          className={`touch-target px-3.5 py-1.5 rounded-xl border transition ${
            filterMode === 'active'
              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'hi' ? 'सफल बिक्री' : 'Active Sales'}
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTxns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-sm">
            {lang === 'hi' ? 'कोई बिक्री रिकॉर्ड नहीं मिला।' : 'No sales records found.'}
          </div>
        ) : (
          filteredTxns.map((txn) => {
            const isCancelled = txn.status === 'cancelled';
            const dateStr = new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
              ' • ' + new Date(txn.createdAt).toLocaleDateString();

            return (
              <div 
                key={txn.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm space-y-2.5 transition ${
                  isCancelled ? 'border-rose-200 opacity-60 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {txn.itemName}
                      </span>
                      {isCancelled ? (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'hi' ? 'रद्द' : 'Cancelled'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'hi' ? 'सफल' : 'Completed'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {dateStr}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {formatCurrency(txn.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      @{formatCurrency(txn.unitPrice)} / {txn.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {formatQty(txn.qty, txn.unit)}
                    </span>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {txn.paymentMode}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500 font-medium">
                      {txn.partyName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => shareReceipt(txn)}
                      className="touch-target p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                      title="Share Receipt"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {!isCancelled && (
                      <button
                        onClick={() => handleUndo(txn.id)}
                        className="touch-target flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition"
                        title={t.undoLastSale}
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'वापसी' : 'Undo'}</span>
                      </button>
                    )}
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
