import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoreOrder, OrderStatus, StaffApplication, ApplicationStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const APPLICATIONS_COLLECTION = 'staff_applications';

const MOCK_ORDER_IDS = new Set([
  'VTX-VC-89K2-1049',
  'VTX-VC-72P1-4820',
  'VTX-VC-55M9-3108',
  'VTX-VC-41A8-7612',
]);

const MOCK_PLAYERS = new Set([
  'FakeSender_00',
  'DragonSlayer_99',
]);

/**
 * فلترة الطلبات الوهمية
 */
export function sanitizeOrders(orders: StoreOrder[]): StoreOrder[] {
  if (!Array.isArray(orders)) return [];
  return orders.filter(
    (o) =>
      o &&
      o.orderId &&
      !MOCK_ORDER_IDS.has(o.orderId) &&
      !MOCK_PLAYERS.has(o.player)
  );
}

/**
 * جلب جميع الطلبات من Firestore
 */
export async function fetchOrders(): Promise<StoreOrder[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => doc.data() as StoreOrder);
    return sanitizeOrders(orders);
  } catch (err) {
    console.warn('Error fetching orders from Firestore:', err);
    return [];
  }
}

/**
 * الاستماع الفوري للطلبات (Realtime) لـ Staff Dashboard
 */
export function subscribeToOrders(callback: (orders: StoreOrder[]) => void): () => void {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders: StoreOrder[] = snapshot.docs.map(doc => doc.data() as StoreOrder);
      callback(sanitizeOrders(orders));
    }, (error) => {
      console.error('Error listening to orders:', error);
    });
  } catch (e) {
    console.error('Firestore listener failed:', e);
    return () => {};
  }
}

/**
 * جلب IP العميل
 */
export async function fetchClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      if (data.ip) return data.ip;
    }
  } catch {
    // fallback
  }
  return '127.0.0.1';
}

/**
 * تقديم طلب جديد وحفظه في Firestore وإرسال إشعار للديسكورد
 */
export async function submitOrder(order: StoreOrder): Promise<StoreOrder> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.orderId);
    const cleanData = {
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. حفظ في Firestore
    await setDoc(orderRef, cleanData);

    // 2. إرسال إشعار آمن للديسكورد عبر Vercel API
    fetch('/api/discord-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).catch(err => console.error('Discord notification error:', err));

    window.dispatchEvent(new CustomEvent('vortex_order_created', { detail: order }));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch (e) {
    console.error('Failed to submit order to Firestore:', e);
  }

  return order;
}

/**
 * تحديث حالة الطلب في Firestore
 */
export async function updateOrderStatusApi(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string,
  staffNotes?: string,
  reviewedBy?: string
): Promise<StoreOrder | null> {
  const now = Date.now();
  const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      ...(reason ? { cancellationReason: reason } : {}),
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      ...(reviewedBy ? { reviewedBy } : {}),
      reviewedAt: nowStr,
      reviewedTimestamp: now,
      archived: false,
    });
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch (err) {
    console.warn('Failed to update order status on Firestore:', err);
  }
  return null;
}

/**
 * أرشفة / إلغاء أرشفة طلب
 */
export async function archiveOrderApi(orderId: string, archived: boolean = true): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { archived });
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch (err) {
    console.warn('Failed to archive order on Firestore:', err);
  }
}

/**
 * تحديث ملاحظات الطلب
 */
export async function updateOrderNotesApi(orderId: string, notes: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { staffNotes: notes });
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch (err) {
    console.warn('Failed to update order notes on Firestore:', err);
  }
}

/**
 * حذف طلب من Firestore
 */
export async function deleteOrderApi(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch (err) {
    console.warn('Failed to delete order on Firestore:', err);
  }
}

/**
 * تنظيف الطلبات الوهمية
 */
export async function cleanMockOrdersApi(): Promise<void> {
  window.dispatchEvent(new Event('vortex_orders_updated'));
}

/**
 * تنظيف تقديمات الإدارة الوهمية
 */
export function sanitizeApplications(apps: any[]): StaffApplication[] {
  if (!Array.isArray(apps)) return [];
  return apps.filter((app) => {
    if (!app || typeof app !== 'object') return false;
    const isMock =
      app.id === 'VTX-APP-9241' ||
      app.id === 'VTX-APP-8104' ||
      app.id === 'VTX-APP-7392' ||
      app.minecraftUsername === 'ViperShadow' ||
      app.minecraftUsername === 'NovaKnight_' ||
      app.minecraftUsername === 'Xx_GamerBoy_xX';
    return !isMock;
  });
}

/**
 * إنشاء أوامر ماينكرافت التلقائية للرتب والباقات
 */
export function getMinecraftCommandForPackage(pkg: string, player: string): {
  primaryCommand: string;
  broadcastCommand: string;
  rankKey: string;
} {
  const p = (player || 'Player').trim();
  const cleanPkg = (pkg || '').toUpperCase();

  let rankKey = 'vip';
  let primaryCommand = `/lp user ${p} parent add vip`;

  if (cleanPkg.includes('MVP+')) {
    rankKey = 'mvpplus';
    primaryCommand = `/lp user ${p} parent add mvpplus`;
  } else if (cleanPkg.includes('MVP')) {
    rankKey = 'mvp';
    primaryCommand = `/lp user ${p} parent add mvp`;
  } else if (cleanPkg.includes('VIP+')) {
    rankKey = 'vipplus';
    primaryCommand = `/lp user ${p} parent add vipplus`;
  } else if (cleanPkg.includes('VIP')) {
    rankKey = 'vip';
    primaryCommand = `/lp user ${p} parent add vip`;
  } else if (cleanPkg.includes('CUSTOM') || cleanPkg.includes('VORTEX')) {
    rankKey = 'vortex';
    primaryCommand = `/lp user ${p} parent add vortex`;
  } else if (cleanPkg.includes('KEY')) {
    if (cleanPkg.includes('50') || cleanPkg.includes('ULTIMATE')) {
      primaryCommand = `/crate give ${p} ultimate 50`;
    } else if (cleanPkg.includes('30') || cleanPkg.includes('MASTER')) {
      primaryCommand = `/crate give ${p} master 30`;
    } else if (cleanPkg.includes('15') || cleanPkg.includes('MYTHIC')) {
      primaryCommand = `/crate give ${p} mythic 15`;
    } else {
      primaryCommand = `/crate give ${p} mythic 5`;
    }
  } else if (cleanPkg.includes('COIN')) {
    if (cleanPkg.includes('1,500,000') || cleanPkg.includes('1500000')) {
      primaryCommand = `/eco give ${p} 1500000`;
    } else if (cleanPkg.includes('500,000') || cleanPkg.includes('500000')) {
      primaryCommand = `/eco give ${p} 500000`;
    } else if (cleanPkg.includes('150,000') || cleanPkg.includes('150000')) {
      primaryCommand = `/eco give ${p} 150000`;
    } else {
      primaryCommand = `/eco give ${p} 50000`;
    }
  } else if (cleanPkg.includes('WING') || cleanPkg.includes('COSMETIC')) {
    primaryCommand = `/cosmetics give ${p} wings_bundle`;
  }

  const broadcastCommand = `/broadcast &b[VortexMC] &aتم تسليم وتفعيل باقة &6${pkg} &aللاعب &e${p}&a فوراً! شكراً لدعمك للسيرفر ⚡`;

  return { primaryCommand, broadcastCommand, rankKey };
}

/**
 * جلب تقديمات الإدارة من Firestore
 */
export async function fetchApplications(): Promise<StaffApplication[]> {
  try {
    const q = query(collection(db, APPLICATIONS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const apps = querySnapshot.docs.map(doc => doc.data() as StaffApplication);
    return sanitizeApplications(apps);
  } catch {
    return [];
  }
}

/**
 * إرسال تقديم جديد للإدارة في Firestore
 */
export async function submitApplication(app: StaffApplication): Promise<StaffApplication> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, app.id);
    await setDoc(appRef, app);
    window.dispatchEvent(new CustomEvent('vortex_application_submitted', { detail: app }));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch (err) {
    console.warn('Failed to submit application to Firestore', err);
  }

  return app;
}

/**
 * تحديث حالة التقديم
 */
export async function updateApplicationStatusApi(
  id: string,
  status: ApplicationStatus,
  notes?: string,
  reviewedBy?: string
): Promise<void> {
  const now = Date.now();
  const reviewedAt = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(appRef, {
      status,
      ...(notes !== undefined ? { notes } : {}),
      ...(reviewedBy ? { reviewedBy } : {}),
      reviewedAt,
      reviewedTimestamp: now,
      archived: false,
    });
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch (err) {
    console.warn('Failed to update application status on Firestore', err);
  }
}

/**
 * أرشفة التقديم
 */
export async function archiveApplicationApi(id: string, archived: boolean = true): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(appRef, { archived });
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch (err) {
    console.warn('Failed to archive application on Firestore', err);
  }
}

/**
 * تحديث ملاحظات التقديم
 */
export async function updateApplicationNotesApi(id: string, notes: string): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(appRef, { notes });
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch (err) {
    console.warn('Failed to update application notes on Firestore', err);
  }
}

/**
 * حذف تقديم من Firestore
 */
export async function deleteApplicationApi(id: string): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, id);
    await deleteDoc(appRef);
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch (err) {
    console.warn('Failed to delete application on Firestore', err);
  }
}

/**
 * تنظيف التقديمات الوهمية
 */
export async function cleanMockApplicationsApi(): Promise<void> {
  window.dispatchEvent(new Event('vortex_applications_updated'));
}