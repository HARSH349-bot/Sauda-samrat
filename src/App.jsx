import React, { useState, useEffect } from 'react';
import { db, seedInitialDataIfEmpty } from './db';
import { translations } from './i18n';
import { 
  getActiveItems, 
  getLowStockItems, 
  getDeadStockItems, 
  getDashboardStats 
} from './services/inventoryService';
import { Header, BottomNav } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuickSaleModal } from './components/QuickSaleModal';
import { AddEditItemModal } from './components/AddEditItemModal';
import { FMCGCatalogModal } from './components/FMCGCatalogModal';

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shopName, setShopName] = useState('Sunrise Store');
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [deadStockItems, setDeadStockItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [inventoryInitialFilter, setInventoryInitialFilter] = useState('all');
  const [stats, setStats] = useState({
    todaySales: 0,
    todaySalesCount: 0,
    totalItems: 0,
    lowStockCount: 0,
    deadStockCount: 0,
    deadStockCapital: 0,
    recentSales: []
  });

  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isFMCGModalOpen, setIsFMCGModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const t = translations[lang] || translations.en;

  // Refresh data from Dexie IndexedDB
  const refreshData = async () => {
    try {
      await seedInitialDataIfEmpty();
      const activeItems = await getActiveItems();
      const lowItems = await getLowStockItems();
      const deadItems = await getDeadStockItems();
      const dashboardStats = await getDashboardStats();
      const allTxns = await db.transactions.reverse().toArray();

      setItems(activeItems);
      setLowStockItems(lowItems);
      setDeadStockItems(deadItems);
      setStats(dashboardStats);
      setTransactions(allTxns);

      const savedShop = await db.settings.get('shopName');
      if (savedShop && savedShop.value) {
        setShopName(savedShop.value);
      }
    } catch (err) {
      console.error('Error refreshing Dexie DB data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const navigateToInventoryFilter = (filter) => {
    setInventoryInitialFilter(filter);
    setActiveTab('inventory');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800">
      {/* Mobile Frame Container max-w-md matching the white & navy blue theme */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-xl border-x border-slate-200">
        
        {/* Top Header */}
        <Header 
          lang={lang} 
          setLang={setLang} 
          t={t} 
          shopName={shopName} 
          onRefresh={refreshData}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              lowStockItems={lowStockItems}
              deadStockItems={deadStockItems}
              t={t}
              lang={lang}
              shopName={shopName}
              onOpenFMCGList={() => setIsFMCGModalOpen(true)}
              onOpenAddItem={() => {
                setEditItem(null);
                setIsAddItemOpen(true);
              }}
              onNavigateInventory={navigateToInventoryFilter}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage
              items={items}
              t={t}
              lang={lang}
              shopName={shopName}
              initialFilter={inventoryInitialFilter}
              onOpenAddItem={() => {
                setEditItem(null);
                setIsAddItemOpen(true);
              }}
              onEditItem={(item) => {
                setEditItem(item);
                setIsAddItemOpen(true);
              }}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersPage
              transactions={transactions}
              t={t}
              lang={lang}
              shopName={shopName}
              onOpenQuickSale={() => setIsQuickSaleOpen(true)}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              shopName={shopName}
              setShopName={setShopName}
              lang={lang}
              setLang={setLang}
              t={t}
              onRefresh={refreshData}
            />
          )}
        </main>

        {/* Bottom Tab Navigation */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          t={t} 
        />

        {/* Modals */}
        <QuickSaleModal
          isOpen={isQuickSaleOpen}
          onClose={() => setIsQuickSaleOpen(false)}
          items={items}
          lang={lang}
          t={t}
          onSaleSuccess={refreshData}
        />

        <AddEditItemModal
          isOpen={isAddItemOpen}
          onClose={() => {
            setIsAddItemOpen(false);
            setEditItem(null);
          }}
          editItem={editItem}
          lang={lang}
          t={t}
          onSuccess={refreshData}
        />

        <FMCGCatalogModal
          isOpen={isFMCGModalOpen}
          onClose={() => setIsFMCGModalOpen(false)}
          existingItems={items}
          lang={lang}
          t={t}
          onSuccess={refreshData}
        />

      </div>
    </div>
  );
}
