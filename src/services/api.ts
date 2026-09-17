import { StoreOrder, OrderStatus, StaffApplication, ApplicationStatus } from '../types';

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
 * Filter out any mock orders from client cache
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
 * Fetch real orders from the backend with localStorage cache fallback
 */
export async function fetchOrders(): Promise<StoreOrder[]> {
  try {
    const res = await fetch('/api/orders', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const cleaned = sanitizeOrders(data);
        localStorage.setItem('vortex_orders', JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('Network error fetching orders from server, using local cache', err);
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem('vortex_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      return sanitizeOrders(parsed);
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Detect client IP from server or fallback
 */
export async function fetchClientIp(): Promise<string> {
  try {
    const res = await fetch('/api/my-ip');
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
 * Submit a real order to backend and cache locally
 */
export async function submitOrder(order: StoreOrder): Promise<StoreOrder> {
  // 1. Immediately save to local storage for instant responsiveness
  try {
    const existing = sanitizeOrders(JSON.parse(localStorage.getItem('vortex_orders') || '[]'));
    const filtered = existing.filter((o) => o.orderId !== order.orderId);
    const updated = [order, ...filtered];
    localStorage.setItem('vortex_orders', JSON.stringify(updated.slice(0, 100)));

    // Also store user's own orders for order tracking
    const myOrders = JSON.parse(localStorage.getItem('vortex_my_orders') || '[]');
    const myFiltered = myOrders.filter((o: StoreOrder) => o.orderId !== order.orderId);
    localStorage.setItem('vortex_my_orders', JSON.stringify([order, ...myFiltered]));

    window.dispatchEvent(new CustomEvent('vortex_order_created', { detail: order }));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch (e) {
    console.error('Failed to cache order locally', e);
  }

  // 2. Persist to server backend
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      const result = await res.json();
      return result.order || order;
    }
  } catch (err) {
    console.warn('Server error saving order, order saved locally', err);
  }

  return order;
}

/**
 * Update order status on backend and locally
 */
export async function updateOrderStatusApi(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string,
  staffNotes?: string,
  reviewedBy?: string
): Promise<StoreOrder | null> {
  let updatedOrder: StoreOrder | null = null;
  const now = Date.now();
  const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
  // Update local storage
  try {
    const existing = sanitizeOrders(JSON.parse(localStorage.getItem('vortex_orders') || '[]'));
    const updated = existing.map((o) => {
      if (o.orderId === orderId) {
        updatedOrder = {
          ...o,
          status: newStatus,
          ...(reason ? { cancellationReason: reason } : {}),
          ...(staffNotes !== undefined ? { staffNotes } : {}),
          ...(reviewedBy ? { reviewedBy } : {}),
          reviewedAt: nowStr,
          reviewedTimestamp: now,
          archived: false,
        };
        return updatedOrder;
      }
      return o;
    });
    localStorage.setItem('vortex_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch {
    // ignore
  }

  // Update server
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        cancellationReason: reason,
        staffNotes,
        reviewedBy,
        archived: false,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.order) {
        return data.order as StoreOrder;
      }
    }
  } catch (err) {
    console.warn('Failed to update order status on server', err);
  }
  return updatedOrder;
}

/**
 * Archive or unarchive order
 */
export async function archiveOrderApi(orderId: string, archived: boolean = true): Promise<void> {
  try {
    const existing = sanitizeOrders(JSON.parse(localStorage.getItem('vortex_orders') || '[]'));
    const updated = existing.map((o) => (o.orderId === orderId ? { ...o, archived } : o));
    localStorage.setItem('vortex_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived }),
    });
  } catch (err) {
    console.warn('Failed to archive order on server', err);
  }
}

/**
 * Update order notes
 */
export async function updateOrderNotesApi(orderId: string, notes: string): Promise<void> {
  try {
    const existing = sanitizeOrders(JSON.parse(localStorage.getItem('vortex_orders') || '[]'));
    const updated = existing.map((o) => (o.orderId === orderId ? { ...o, staffNotes: notes } : o));
    localStorage.setItem('vortex_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffNotes: notes }),
    });
  } catch (err) {
    console.warn('Failed to update order notes on server', err);
  }
}

/**
 * Delete order from backend and cache
 */
export async function deleteOrderApi(orderId: string): Promise<void> {
  try {
    const existing = sanitizeOrders(JSON.parse(localStorage.getItem('vortex_orders') || '[]'));
    const updated = existing.filter((o) => o.orderId !== orderId);
    localStorage.setItem('vortex_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to delete order on server', err);
  }
}

/**
 * Clean all mock / dummy orders
 */
export async function cleanMockOrdersApi(): Promise<void> {
  try {
    const existing = sanitizeOrders(JSON.parse(localStorage.getItem('vortex_orders') || '[]'));
    localStorage.setItem('vortex_orders', JSON.stringify(existing));
    window.dispatchEvent(new Event('vortex_orders_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch('/api/orders/clean-mock', { method: 'POST' });
  } catch {
    // ignore
  }
}

/**
 * Sanitize staff applications list to remove any mock/fake entries
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
 * Generate in-game Minecraft console commands for rank or package delivery
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
 * Fetch staff applications
 */
export async function fetchApplications(): Promise<StaffApplication[]> {
  try {
    const res = await fetch('/api/applications', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const cleaned = sanitizeApplications(data);
        localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch {
    // ignore
  }

  try {
    const saved = localStorage.getItem('vortex_staff_applications_ar_v1');
    if (saved) {
      return sanitizeApplications(JSON.parse(saved));
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Submit staff application
 */
export async function submitApplication(app: StaffApplication): Promise<StaffApplication> {
  try {
    const existing = sanitizeApplications(
      JSON.parse(localStorage.getItem('vortex_staff_applications_ar_v1') || '[]')
    );
    const updated = [app, ...existing.filter((a: StaffApplication) => a.id !== app.id)];
    localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vortex_application_submitted', { detail: app }));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app),
    });
  } catch (err) {
    console.warn('Failed to submit application to server', err);
  }

  return app;
}

/**
 * Update staff application status
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
    const existing = sanitizeApplications(
      JSON.parse(localStorage.getItem('vortex_staff_applications_ar_v1') || '[]')
    );
    const updated = existing.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status,
          ...(notes !== undefined ? { notes } : {}),
          ...(reviewedBy ? { reviewedBy } : {}),
          reviewedAt,
          reviewedTimestamp: now,
          archived: false,
        };
      }
      return app;
    });
    localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, reviewedBy, archived: false }),
    });
  } catch (err) {
    console.warn('Failed to update application status on server', err);
  }
}

/**
 * Archive or unarchive staff application
 */
export async function archiveApplicationApi(id: string, archived: boolean = true): Promise<void> {
  try {
    const existing = sanitizeApplications(
      JSON.parse(localStorage.getItem('vortex_staff_applications_ar_v1') || '[]')
    );
    const updated = existing.map((app) => (app.id === id ? { ...app, archived } : app));
    localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived }),
    });
  } catch (err) {
    console.warn('Failed to archive application on server', err);
  }
}

/**
 * Update staff application notes
 */
export async function updateApplicationNotesApi(id: string, notes: string): Promise<void> {
  try {
    const existing = sanitizeApplications(
      JSON.parse(localStorage.getItem('vortex_staff_applications_ar_v1') || '[]')
    );
    const updated = existing.map((app) => (app.id === id ? { ...app, notes } : app));
    localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
  } catch (err) {
    console.warn('Failed to update application notes on server', err);
  }
}

/**
 * Delete application
 */
export async function deleteApplicationApi(id: string): Promise<void> {
  try {
    const existing = sanitizeApplications(
      JSON.parse(localStorage.getItem('vortex_staff_applications_ar_v1') || '[]')
    );
    const updated = existing.filter((a) => a.id !== id);
    localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch(`/api/applications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to delete application on server', err);
  }
}

/**
 * Clean all mock / dummy staff applications
 */
export async function cleanMockApplicationsApi(): Promise<void> {
  try {
    const existing = sanitizeApplications(
      JSON.parse(localStorage.getItem('vortex_staff_applications_ar_v1') || '[]')
    );
    localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(existing));
    window.dispatchEvent(new Event('vortex_applications_updated'));
  } catch {
    // ignore
  }

  try {
    await fetch('/api/applications/clean-mock', { method: 'POST' });
  } catch {
    // ignore
  }
}

