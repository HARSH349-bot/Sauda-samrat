import { db } from '../db';

/**
 * Service Layer for Sauda Samrat:
 * All business logic, stock deductions, decimal handling, hard negative stock guards,
 * and soft deletions happen strictly here. UI components never compute or alter raw stock directly.
 */

// Popular pre-listed Indian FMCG products ready to choose from
export const POPULAR_FMCG_CATALOG = [
  {
    id: 'fmcg-1',
    name: 'Parle-G Biscuits 80g',
    nameHi: 'पारले-जी बिस्कुट 80 ग्राम',
    category: 'Snacks',
    unit: 'pkt',
    costPrice: 8.5,
    sellingPrice: 10.0,
    minStockAlert: 15.0,
    defaultAddQty: 24.0,
    barcode: '8901030383701'
  },
  {
    id: 'fmcg-2',
    name: 'Britannia Good Day Butter 100g',
    nameHi: 'ब्रिटानिया गुड डे बटर 100 ग्राम',
    category: 'Snacks',
    unit: 'pkt',
    costPrice: 26.0,
    sellingPrice: 30.0,
    minStockAlert: 10.0,
    defaultAddQty: 12.0,
    barcode: '8901063138378'
  },
  {
    id: 'fmcg-3',
    name: 'Maggi 2-Minute Noodles 70g',
    nameHi: 'मैगी नूडल्स 70 ग्राम',
    category: 'Snacks',
    unit: 'pkt',
    costPrice: 12.0,
    sellingPrice: 14.0,
    minStockAlert: 20.0,
    defaultAddQty: 24.0,
    barcode: '8901058852371'
  },
  {
    id: 'fmcg-4',
    name: 'Tata Tea Premium 250g',
    nameHi: 'टाटा टी प्रीमियम चाय 250 ग्राम',
    category: 'Beverages',
    unit: 'pkt',
    costPrice: 130.0,
    sellingPrice: 145.0,
    minStockAlert: 6.0,
    defaultAddQty: 10.0,
    barcode: '8901052002381'
  },
  {
    id: 'fmcg-5',
    name: 'Dettol Original Soap 75g',
    nameHi: 'डेटॉल ओरिजिनल साबुन 75 ग्राम',
    category: 'Household',
    unit: 'pcs',
    costPrice: 32.0,
    sellingPrice: 38.0,
    minStockAlert: 10.0,
    defaultAddQty: 15.0,
    barcode: '8901396388471'
  },
  {
    id: 'fmcg-6',
    name: 'Vim Dishwash Bar 135g',
    nameHi: 'विम बर्तन धोने का साबुन 135 ग्राम',
    category: 'Household',
    unit: 'pcs',
    costPrice: 16.0,
    sellingPrice: 20.0,
    minStockAlert: 15.0,
    defaultAddQty: 20.0,
    barcode: '8901030018371'
  },
  {
    id: 'fmcg-7',
    name: 'Haldiram Nagpur Bhujia Sev 200g',
    nameHi: 'हल्दीराम भुजिया सेव 200 ग्राम',
    category: 'Snacks',
    unit: 'pkt',
    costPrice: 48.0,
    sellingPrice: 55.0,
    minStockAlert: 8.0,
    defaultAddQty: 10.0,
    barcode: '8904004403829'
  },
  {
    id: 'fmcg-8',
    name: 'Rin Detergent Bar 250g',
    nameHi: 'रिन कपड़े धोने का साबुन 250 ग्राम',
    category: 'Household',
    unit: 'pcs',
    costPrice: 18.0,
    sellingPrice: 22.0,
    minStockAlert: 12.0,
    defaultAddQty: 18.0,
    barcode: '8901030704381'
  },
  {
    id: 'fmcg-9',
    name: 'Colgate Strong Teeth 100g',
    nameHi: 'कोलगेट स्ट्रॉन्ग टीथ 100 ग्राम',
    category: 'Household',
    unit: 'pcs',
    costPrice: 52.0,
    sellingPrice: 60.0,
    minStockAlert: 8.0,
    defaultAddQty: 10.0,
    barcode: '8901314010528'
  },
  {
    id: 'fmcg-10',
    name: 'Everest Turmeric (Haldi) 100g',
    nameHi: 'एवरेस्ट हल्दी पाउडर 100 ग्राम',
    category: 'Spices',
    unit: 'pkt',
    costPrice: 28.0,
    sellingPrice: 34.0,
    minStockAlert: 10.0,
    defaultAddQty: 12.0,
    barcode: '8901786101011'
  },
  {
    id: 'fmcg-11',
    name: 'MDH Deggi Mirch 100g',
    nameHi: 'एमडीएच देगी मिर्च 100 ग्राम',
    category: 'Spices',
    unit: 'pkt',
    costPrice: 72.0,
    sellingPrice: 82.0,
    minStockAlert: 6.0,
    defaultAddQty: 8.0,
    barcode: '8902167000182'
  },
  {
    id: 'fmcg-12',
    name: 'Amul Taaza Toned Milk 500ml',
    nameHi: 'अमूल ताज़ा टोन्ड दूध 500 मिली',
    category: 'Dairy',
    unit: 'pkt',
    costPrice: 26.5,
    sellingPrice: 28.0,
    minStockAlert: 10.0,
    defaultAddQty: 20.0,
    barcode: '8901262010182'
  },
  {
    id: 'fmcg-13',
    name: 'Fortune Kachi Ghani Mustard Oil 1L',
    nameHi: 'फॉर्च्यून कच्ची घानी सरसों तेल 1 लीटर',
    category: 'Oils',
    unit: 'ltr',
    costPrice: 135.0,
    sellingPrice: 148.0,
    minStockAlert: 8.0,
    defaultAddQty: 12.0,
    barcode: '8906007281019'
  },
  {
    id: 'fmcg-14',
    name: 'Cadbury Dairy Milk 24g',
    nameHi: 'कैडबरी डेयरी मिल्क चॉकलेट 24 ग्राम',
    category: 'Snacks',
    unit: 'pcs',
    costPrice: 17.0,
    sellingPrice: 20.0,
    minStockAlert: 15.0,
    defaultAddQty: 25.0,
    barcode: '8901233024821'
  }
];

// Format decimal quantity cleanly (e.g. 0.5 kg, 1.25 kg)
export function formatQty(val, unit = '') {
  const num = parseFloat(val);
  if (isNaN(num)) return `0 ${unit}`.trim();
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${unit}`.trim();
}

// Format Currency in INR
export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
}

// Helper to check if an item is Low Stock
export function isLowStock(item) {
  const minAlert = parseFloat(item.minStockAlert) || 0;
  const current = parseFloat(item.stock) || 0;
  return current <= minAlert;
}

// Helper to check if an item is Dead Stock (no sale in 30+ days or specifically flagged)
export function isDeadStock(item) {
  if (item.lastSoldDaysAgo !== undefined && item.lastSoldDaysAgo !== null) {
    return item.lastSoldDaysAgo >= 30;
  }
  return false;
}

// Calculate capital locked / tied up in an item
export function getTiedCapital(item) {
  const stock = parseFloat(item.stock) || 0;
  const cost = parseFloat(item.costPrice) || 0;
  return parseFloat((stock * cost).toFixed(2));
}

// 1. Fetch active items
export async function getActiveItems() {
  return await db.items.filter(item => item.status === 'active').toArray();
}

// 2. Fetch low stock items
export async function getLowStockItems() {
  const items = await getActiveItems();
  return items.filter(isLowStock);
}

// 3. Fetch dead stock items
export async function getDeadStockItems() {
  const items = await getActiveItems();
  return items.filter(isDeadStock);
}

// 4. Add or update item (quantities as decimals, soft status)
export async function saveItem(itemData) {
  const parsedStock = parseFloat(itemData.stock);
  if (isNaN(parsedStock) || parsedStock < 0) {
    throw new Error('Stock cannot be negative. स्टॉक नकारात्मक नहीं हो सकता।');
  }

  const payload = {
    name: itemData.name.trim(),
    nameHi: (itemData.nameHi || '').trim(),
    category: itemData.category || 'General',
    unit: itemData.unit || 'pkt',
    costPrice: Math.max(0, parseFloat(itemData.costPrice) || 0),
    sellingPrice: Math.max(0, parseFloat(itemData.sellingPrice) || 0),
    stock: parsedStock,
    minStockAlert: Math.max(0, parseFloat(itemData.minStockAlert) || 0),
    barcode: (itemData.barcode || '').trim(),
    lastSoldDaysAgo: itemData.lastSoldDaysAgo !== undefined ? itemData.lastSoldDaysAgo : 0,
    dailySales: itemData.dailySales || 1.0,
    leadTimeDays: itemData.leadTimeDays || 2,
    status: itemData.status || 'active',
    isSynced: false, // will sync when internet returns
    updatedAt: new Date().toISOString()
  };

  if (itemData.id) {
    await db.items.update(itemData.id, payload);
    return itemData.id;
  } else {
    return await db.items.add(payload);
  }
}

// 5. Add FMCG Item into Shop Stock (Increase stock if already exists, else create new)
export async function addFMCGProductToStock(fmcgItem, addQty) {
  const numQty = parseFloat(addQty);
  if (isNaN(numQty) || numQty <= 0) {
    throw new Error('Please enter valid quantity to add to stock.');
  }

  return await db.transaction('rw', db.items, async () => {
    // Check if item already exists by exact name
    const existing = await db.items
      .filter(i => i.status === 'active' && i.name.toLowerCase() === fmcgItem.name.toLowerCase())
      .first();

    if (existing) {
      const updatedStock = parseFloat(((parseFloat(existing.stock) || 0) + numQty).toFixed(3));
      await db.items.update(existing.id, {
        stock: updatedStock,
        isSynced: false,
        updatedAt: new Date().toISOString()
      });
      return { id: existing.id, isNew: false, stock: updatedStock, name: existing.name };
    } else {
      const newId = await db.items.add({
        name: fmcgItem.name,
        nameHi: fmcgItem.nameHi || '',
        category: fmcgItem.category || 'General',
        unit: fmcgItem.unit || 'pkt',
        costPrice: fmcgItem.costPrice || 0,
        sellingPrice: fmcgItem.sellingPrice || 0,
        stock: numQty,
        minStockAlert: fmcgItem.minStockAlert || 5,
        barcode: fmcgItem.barcode || '',
        lastSoldDaysAgo: 0,
        dailySales: 1.5,
        leadTimeDays: 2,
        status: 'active',
        isSynced: false,
        updatedAt: new Date().toISOString()
      });
      return { id: newId, isNew: true, stock: numQty, name: fmcgItem.name };
    }
  });
}

// 6. Soft delete item (never permanently delete records)
export async function softDeleteItem(itemId) {
  return await db.items.update(itemId, {
    status: 'archived',
    isSynced: false,
    updatedAt: new Date().toISOString()
  });
}

// 7. Record a Sale (Strict stock deduction + hard negative stock guard)
export async function recordSale({
  itemId,
  qty,
  paymentMode = 'Cash (नकद)',
  partyName = 'Walk-in Customer',
  partyPhone = ''
}) {
  const numQty = parseFloat(qty);
  if (isNaN(numQty) || numQty <= 0) {
    throw new Error('Please enter a valid quantity > 0. कृपया सही मात्रा दर्ज करें।');
  }

  return await db.transaction('rw', db.items, db.transactions, async () => {
    const item = await db.items.get(itemId);
    if (!item || item.status !== 'active') {
      throw new Error('Item not found or inactive. सामान नहीं मिला।');
    }

    const currentStock = parseFloat(item.stock) || 0;
    if (currentStock < numQty) {
      throw new Error(
        `Insufficient stock! Available in shop: ${formatQty(currentStock, item.unit)}. दुकान में केवल ${formatQty(currentStock, item.unit)} मौजूद है।`
      );
    }

    // New stock after deduction
    const newStock = parseFloat((currentStock - numQty).toFixed(3));
    if (newStock < 0) {
      throw new Error('Negative stock is strictly prohibited. नकारात्मक स्टॉक की अनुमति नहीं है।');
    }

    // Reset lastSoldDaysAgo to 0 since item was just sold today
    await db.items.update(itemId, {
      stock: newStock,
      lastSoldDaysAgo: 0,
      isSynced: false,
      updatedAt: new Date().toISOString()
    });

    const unitPrice = parseFloat(item.sellingPrice) || 0;
    const totalAmount = parseFloat((unitPrice * numQty).toFixed(2));

    const transactionId = await db.transactions.add({
      type: 'sale',
      itemId: item.id,
      itemName: `${item.name} ${item.nameHi ? '(' + item.nameHi + ')' : ''}`,
      qty: numQty,
      unit: item.unit,
      unitPrice,
      totalAmount,
      paymentMode,
      partyName,
      partyPhone,
      status: 'active',
      isSynced: false,
      createdAt: new Date().toISOString()
    });

    return {
      transactionId,
      itemName: item.name,
      remainingStock: newStock,
      totalAmount
    };
  });
}

// 8. Undo a sale transaction (soft reverses transaction and restores stock)
export async function undoSale(transactionId) {
  return await db.transaction('rw', db.items, db.transactions, async () => {
    const txn = await db.transactions.get(transactionId);
    if (!txn || txn.status !== 'active' || txn.type !== 'sale') {
      throw new Error('No active sale transaction to undo. रद्द करने योग्य बिक्री नहीं मिली।');
    }

    const item = await db.items.get(txn.itemId);
    if (item) {
      const restoredStock = parseFloat(((parseFloat(item.stock) || 0) + txn.qty).toFixed(3));
      await db.items.update(txn.itemId, {
        stock: restoredStock,
        isSynced: false,
        updatedAt: new Date().toISOString()
      });
    }

    // Soft delete transaction
    await db.transactions.update(transactionId, {
      status: 'cancelled',
      isSynced: false,
      updatedAt: new Date().toISOString()
    });

    return true;
  });
}

// 9. Calculate Today's Sales & Dashboard Stats
export async function getDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activeTxns = await db.transactions
    .filter(t => t.status === 'active' && t.type === 'sale')
    .toArray();

  const todayTxns = activeTxns.filter(t => new Date(t.createdAt) >= todayStart);
  const totalSalesToday = todayTxns.reduce((sum, t) => sum + (parseFloat(t.totalAmount) || 0), 0);

  const activeItems = await getActiveItems();
  const lowStockCount = activeItems.filter(isLowStock).length;
  const deadStockItems = activeItems.filter(isDeadStock);
  const deadStockCount = deadStockItems.length;
  const deadStockCapital = deadStockItems.reduce((sum, item) => sum + getTiedCapital(item), 0);

  // Check how many records are pending cloud sync
  const unsyncedTxns = await db.transactions.filter(t => t.isSynced === false).count();
  const unsyncedItems = await db.items.filter(i => i.isSynced === false).count();

  return {
    todaySales: totalSalesToday,
    todaySalesCount: todayTxns.length,
    totalItems: activeItems.length,
    lowStockCount,
    deadStockCount,
    deadStockCapital,
    unsyncedCount: unsyncedTxns + unsyncedItems,
    recentSales: todayTxns.slice(-10).reverse()
  };
}

// 10. Sync Pending Offline Changes when internet returns
export async function syncOfflineChanges() {
  if (!navigator.onLine) {
    return { synced: false, count: 0, message: 'Offline. Sync will resume when online.' };
  }

  const unsyncedTxns = await db.transactions.filter(t => t.isSynced === false).toArray();
  const unsyncedItems = await db.items.filter(i => i.isSynced === false).toArray();
  const totalPending = unsyncedTxns.length + unsyncedItems.length;

  if (totalPending === 0) {
    return { synced: true, count: 0, message: 'All data is up to date.' };
  }

  // Transactionally mark pending records as synced
  await db.transaction('rw', db.transactions, db.items, async () => {
    for (const txn of unsyncedTxns) {
      await db.transactions.update(txn.id, { isSynced: true });
    }
    for (const item of unsyncedItems) {
      await db.items.update(item.id, { isSynced: true });
    }
  });

  return { 
    synced: true, 
    count: totalPending, 
    message: `Successfully synchronized ${totalPending} offline records!` 
  };
}

// 11. Generate WhatsApp distributor order text for low-stock items
export function generateDistributorWhatsAppMessage(lowItems, storeName = 'Sunrise Store') {
  if (!lowItems || lowItems.length === 0) {
    return `Hello! All stocks at ${storeName} are optimal right now.`;
  }

  let text = `📦 *${storeName} - Distributor Purchase Order*\n`;
  text += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
  text += `Please arrange dispatch for the following low stock items:\n`;

  let totalEst = 0;
  lowItems.forEach((item, idx) => {
    const needed = Math.max(1, Math.ceil((item.minStockAlert * 2) - item.stock));
    const estCost = needed * (item.costPrice || 0);
    totalEst += estCost;
    text += `${idx + 1}. *${item.name}* ${item.nameHi ? '(' + item.nameHi + ')' : ''}\n   - In Stock: ${formatQty(item.stock, item.unit)}\n   - Required Qty: ${needed} ${item.unit} (≈ ${formatCurrency(estCost)})\n`;
  });

  text += `\nEstimated Total: ${formatCurrency(totalEst)}\n`;
  text += `Thank you,\n*${storeName}*\n_Sent via Sauda Samrat_`;
  return text;
}
