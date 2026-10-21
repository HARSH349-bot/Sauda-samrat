import React, { useState } from 'react';
import { 
  Store, 
  Languages, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Phone, 
  CheckCircle2, 
  FileSpreadsheet, 
  Database 
} from 'lucide-react';
import { db, seedInitialDataIfEmpty } from '../db';

export function SettingsPage({ 
  shopName, 
  setShopName, 
  lang, 
  setLang, 
  t, 
  onRefresh 
}) {
  const [ownerName, setOwnerName] = useState('Ramesh Gupta');
  const [phoneNumber, setPhoneNumber] = useState('9876500000');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await db.settings.put({ key: 'shopName', value: shopName });
    await db.settings.put({ key: 'ownerName', value: ownerName });
    await db.settings.put({ key: 'phone', value: phoneNumber });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = async () => {
    const allItems = await db.items.toArray();
    const allTransactions = await db.transactions.toArray();
    const allSettings = await db.settings.toArray();

    const backupObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items: allItems,
      transactions: allTransactions,
      settings: allSettings
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObject, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `sauda_samrat_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleExportCSV = async () => {
    const allItems = await db.items.toArray();
    let csv = "Product Name,Category,Stock Qty,Unit,Cost Price,Selling Price,Barcode\n";
    allItems.forEach(p => {
      csv += `"${p.name}","${p.category}",${p.stock},"${p.unit}",${p.costPrice},${p.sellingPrice},"${p.barcode || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = `inventory_export_${new Date().toISOString().slice(0,10)}.csv`;
    dl.click();
  };

  const handleResetCatalog = async () => {
    const confirmMsg = lang === 'hi' 
      ? 'क्या आप सचमुच पूरा डेटा रीसेट करके डिफ़ॉल्ट किराना कैटलॉग लोड करना चाहते हैं?' 
      : 'Reset all data and restore original demo catalog?';
    if (window.confirm(confirmMsg)) {
      await db.items.clear();
      await db.transactions.clear();
      await seedInitialDataIfEmpty();
      onRefresh();
      alert(lang === 'hi' ? 'डिफ़ॉल्ट डेटा रीस्टोर हो गया!' : 'Demo catalog restored!');
    }
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {t.settings}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'hi' ? 'आपका डेटा पूरी तरह सुरक्षित • ऑफलाइन मोड' : 'Your data stays yours • 100% Offline IndexedDB'}
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{lang === 'hi' ? 'जानकारी सुरक्षित हो गई!' : 'Store details saved!'}</span>
        </div>
      )}

      {/* Language Switch Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              {lang === 'hi' ? 'भाषा चुनें (Language)' : 'Language / भाषा'}
            </span>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
            {t.activeLanguage}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setLang('en')}
            className={`touch-target p-2.5 rounded-xl border flex items-center justify-center gap-2 transition ${
              lang === 'en'
                ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>English</span>
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`touch-target p-2.5 rounded-xl border flex items-center justify-center gap-2 transition ${
              lang === 'hi'
                ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>हिंदी (Hindi)</span>
          </button>
        </div>
      </div>

      {/* Store Profile Card */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-600" />
          <span>{lang === 'hi' ? 'दुकान की जानकारी' : 'Shop Details'}</span>
        </h3>

        <div>
          <label className="block text-slate-600 mb-1 font-semibold">
            {lang === 'hi' ? 'दुकान का नाम' : 'Store Name'}
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-600 mb-1 font-semibold">
              {lang === 'hi' ? 'दुकानदार का नाम' : 'Owner Name'}
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-semibold">
              {lang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="touch-target w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition active:scale-98"
        >
          {lang === 'hi' ? 'दुकान की जानकारी अपडेट करें' : 'Save Store Details'}
        </button>
      </form>

      {/* Offline Safety Net & Backups */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900">
            {lang === 'hi' ? 'डेटा सुरक्षा व बैकअप (IndexedDB)' : 'Offline Safety Net (IndexedDB)'}
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          {lang === 'hi' 
            ? 'आपका सारा डेटा आपके फोन/ब्राउज़र की IndexedDB में सुरक्षित रहता है। किसी इंटरनेट या सर्वर की आवश्यकता नहीं है।'
            : 'Zero data loss risk. All records live locally in your browser IndexedDB without needing an internet connection.'}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="touch-target bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{t.backupData}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="touch-target bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? 'CSV निर्यात' : 'Export CSV'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetCatalog}
          className="touch-target w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs"
        >
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>{t.clearDemoData}</span>
        </button>
      </div>
    </div>
  );
}
