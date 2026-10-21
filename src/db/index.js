import Dexie from 'dexie';

export class SaudaSamratDB extends Dexie {
  constructor() {
    super('SaudaSamratDB');
    this.version(1).stores({
      // items: id, name, nameHi, category, unit, costPrice, sellingPrice, stock, minStockAlert, status, barcode, lastSoldDaysAgo, isSynced, updatedAt
      items: '++id, name, nameHi, category, unit, status, barcode, lastSoldDaysAgo, isSynced, updatedAt',
      // transactions: id, type ('sale' | 'purchase' | 'adjustment'), itemId, itemName, qty, unit, unitPrice, totalAmount, paymentMode, partyName, partyPhone, status, isSynced, createdAt
      transactions: '++id, type, itemId, status, createdAt, partyName, isSynced',
      // parties: id, name, phone, type ('customer' | 'supplier'), balance, status, updatedAt
      parties: '++id, name, phone, type, status, updatedAt',
      // settings: key, value
      settings: 'key'
    });
  }
}

export const db = new SaudaSamratDB();

// Fallback localStorage mirror for extreme edge-cases (e.g. private window without IndexedDB)
const STORAGE_BACKUP_KEY = 'sauda_samrat_backup_mirror';

export function mirrorToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage mirror quota full or disabled:', e);
  }
}

export function readFromLocalStorageMirror() {
  try {
    const raw = localStorage.getItem(STORAGE_BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Seed initial retail catalog if empty
export async function seedInitialDataIfEmpty() {
  try {
    const count = await db.items.count();
    if (count === 0) {
      const initialItems = [
        {
          name: 'Aashirvaad Atta 5kg',
          nameHi: 'आशीर्वाद आटा 5 किलो',
          category: 'Staples',
          unit: 'pkt',
          costPrice: 245.0,
          sellingPrice: 265.0,
          stock: 6.0,
          minStockAlert: 5.0,
          status: 'active',
          barcode: '890100000001',
          lastSoldDaysAgo: 0,
          dailySales: 2.5,
          leadTimeDays: 2,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Fortune Sunlite Cooking Oil 1L',
          nameHi: 'फॉर्च्यून सनलाइट तेल 1 लीटर',
          category: 'Oils',
          unit: 'ltr',
          costPrice: 128.0,
          sellingPrice: 140.0,
          stock: 22.0,
          minStockAlert: 8.0,
          status: 'active',
          barcode: '890100000002',
          lastSoldDaysAgo: 0,
          dailySales: 3.0,
          leadTimeDays: 2,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Tata Salt 1kg',
          nameHi: 'टाटा नमक 1 किलो',
          category: 'Staples',
          unit: 'pkt',
          costPrice: 25.0,
          sellingPrice: 28.0,
          stock: 4.0, // Low stock demo (< 5)
          minStockAlert: 10.0,
          status: 'active',
          barcode: '890100000003',
          lastSoldDaysAgo: 1,
          dailySales: 2.0,
          leadTimeDays: 3,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Toor Dal 1kg',
          nameHi: 'अरहर (तूर) दाल 1 किलो',
          category: 'Pulses',
          unit: 'kg',
          costPrice: 155.0,
          sellingPrice: 170.0,
          stock: 5.0, // Low stock demo (<= 6)
          minStockAlert: 8.0,
          status: 'active',
          barcode: '890100000004',
          lastSoldDaysAgo: 1,
          dailySales: 2.0,
          leadTimeDays: 3,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Sugar 1kg',
          nameHi: 'चीनी 1 किलो',
          category: 'Staples',
          unit: 'kg',
          costPrice: 42.0,
          sellingPrice: 46.0,
          stock: 35.0,
          minStockAlert: 15.0,
          status: 'active',
          barcode: '890100000005',
          lastSoldDaysAgo: 0,
          dailySales: 5.0,
          leadTimeDays: 2,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Maggi 2-Minute Noodles 70g',
          nameHi: 'मैगी नूडल्स 70 ग्राम',
          category: 'Snacks',
          unit: 'pkt',
          costPrice: 12.0,
          sellingPrice: 14.0,
          stock: 60.0,
          minStockAlert: 20.0,
          status: 'active',
          barcode: '890100000006',
          lastSoldDaysAgo: 0,
          dailySales: 12.0,
          leadTimeDays: 2,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Amul Butter 100g',
          nameHi: 'अमूल मक्खन 100 ग्राम',
          category: 'Dairy',
          unit: 'pkt',
          costPrice: 56.0,
          sellingPrice: 60.0,
          stock: 3.0, // Low stock demo (< 8)
          minStockAlert: 8.0,
          status: 'active',
          barcode: '890100000007',
          lastSoldDaysAgo: 0,
          dailySales: 3.0,
          leadTimeDays: 2,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Brooke Bond Red Label Tea 250g',
          nameHi: 'रेड लेबल चायपत्ती 250 ग्राम',
          category: 'Beverages',
          unit: 'pkt',
          costPrice: 124.0,
          sellingPrice: 135.0,
          stock: 18.0,
          minStockAlert: 6.0,
          status: 'active',
          barcode: '890100000008',
          lastSoldDaysAgo: 2,
          dailySales: 2.0,
          leadTimeDays: 3,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Surf Excel Easy Wash 1kg',
          nameHi: 'सर्फ एक्सेल ईज़ी वॉश 1 किलो',
          category: 'Household',
          unit: 'pkt',
          costPrice: 115.0,
          sellingPrice: 125.0,
          stock: 16.0,
          minStockAlert: 4.0,
          status: 'active',
          barcode: '890100000009',
          lastSoldDaysAgo: 38, // > 30 days => Dead stock
          dailySales: 0.1,
          leadTimeDays: 3,
          isSynced: true,
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Phone Charger (Type-C, 20W)',
          nameHi: 'फोन चार्जर (टाइप-C, 20W)',
          category: 'Mobile',
          unit: 'pcs',
          costPrice: 220.0,
          sellingPrice: 299.0,
          stock: 7.0,
          minStockAlert: 2.0,
          status: 'active',
          barcode: '890100000010',
          lastSoldDaysAgo: 45, // > 30 days => Dead stock
          dailySales: 0.05,
          leadTimeDays: 5,
          isSynced: true,
          updatedAt: new Date().toISOString()
        }
      ];

      await db.items.bulkAdd(initialItems);

      await db.transactions.add({
        type: 'sale',
        itemId: 1,
        itemName: 'Aashirvaad Atta 5kg (आशीर्वाद आटा)',
        qty: 1.0,
        unit: 'pkt',
        unitPrice: 265.0,
        totalAmount: 265.0,
        paymentMode: 'Cash (नकद)',
        partyName: 'Suresh Kumar',
        partyPhone: '9876543210',
        status: 'active',
        isSynced: true,
        createdAt: new Date().toISOString()
      });

      await db.settings.put({ key: 'shopName', value: 'Sunrise Store' });
      await db.settings.put({ key: 'ownerName', value: 'Ramesh Gupta' });
      await db.settings.put({ key: 'phone', value: '9876500000' });
      await db.settings.put({ key: 'language', value: 'en' });
    }
  } catch (err) {
    console.error('Dexie database seeding error:', err);
  }
}
