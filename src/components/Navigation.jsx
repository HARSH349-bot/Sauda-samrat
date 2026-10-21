import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  Boxes, 
  Store, 
  WifiOff, 
  Languages, 
  RotateCw 
} from 'lucide-react';

export function Header({ lang, setLang, t, shopName, onRefresh }) {
  return (
    <header className="bg-blue-600 text-white px-5 pt-3 pb-5 shadow-md sticky top-0 z-30">
      {/* Offline notification banner */}
      <div className="flex items-center justify-between text-xs py-1 px-3 bg-blue-700/80 rounded-lg mb-3 text-blue-100 border border-blue-500/40">
        <div className="flex items-center gap-1.5 font-medium">
          <WifiOff className="w-3.5 h-3.5 text-amber-300" />
          <span>{t.offlineBadge}</span>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="touch-target flex items-center gap-1.5 bg-white hover:bg-slate-100 text-blue-900 font-bold px-2.5 py-1 rounded-md text-xs transition shadow-sm active:scale-95"
          title="Toggle Language"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.languageToggle}</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-800/80 text-blue-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-blue-400/40">
              {t.appSubname}
            </span>
            <span className="text-xs text-blue-100 font-medium">{t.tagline}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            {shopName}
          </h1>
          <p className="text-xs text-blue-100/90 mt-0.5 font-normal">
            {t.subHeader}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2.5 bg-blue-700/70 hover:bg-blue-700 rounded-full text-white transition active:scale-95 shadow-sm"
          title="Refresh Data"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

export function BottomNav({ activeTab, setActiveTab, t }) {
  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'orders', label: t.orders, icon: ReceiptIndianRupee },
    { id: 'inventory', label: t.inventory, icon: Boxes },
    { id: 'settings', label: t.settings, icon: Store }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 grid grid-cols-4 z-40 shadow-lg safe-area-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`touch-target flex flex-col items-center justify-center py-2 px-1 text-center transition-all ${
              isActive 
                ? 'text-blue-600 font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1 tracking-tight leading-none line-clamp-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
