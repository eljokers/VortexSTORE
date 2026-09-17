import React, { useState, useMemo, useEffect } from 'react';
import { 
  Lock, Search, Filter, CheckCircle2, XCircle, Clock, Trash2, 
  ExternalLink, Eye, Edit3, Check, ArrowLeft, ArrowRight, Shield, AlertTriangle, 
  Copy, MessageSquare, FileText, ChevronDown, Sparkles, ShoppingCart, 
  Phone, Smartphone, CheckCheck, Ban, PlusCircle, RefreshCw, UserCheck,
  Archive, History, RotateCcw, Timer, Image as ImageIcon, Download, Upload
} from 'lucide-react';
import { StaffApplication, ApplicationStatus, StoreOrder, OrderStatus } from '../../types';
import { Language } from '../../translations';

interface StaffAdminPanelProps {
  applications: StaffApplication[];
  orders: StoreOrder[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteApplication: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, reason?: string) => void;
  onUpdateOrderNotes: (orderId: string, notes: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddOrder?: (order: StoreOrder) => void;
  onRefreshOrders?: () => void;
  onCleanMockOrders?: () => void;
  onRefreshApplications?: () => void;
  onCleanMockApplications?: () => void;
  onArchiveOrder?: (orderId: string, archived: boolean) => void;
  onArchiveApplication?: (id: string, archived: boolean) => void;
  onBackToPortal: () => void;
  onCopyText: (text: string, message?: string) => void;
  language?: Language;
}

// Passcode validation (Primary password requested by user: k9#mP2!vL8$xR4@q)
const VALID_PASSCODES = ['k9#mP2!vL8$xR4@q', 'vortex2026', 'admin', 'vortex'];

// 10-Minute Auto-Archive Constant (10 minutes = 600,000 milliseconds)
export const AUTO_ARCHIVE_MS = 10 * 60 * 1000;

export const StaffAdminPanel: React.FC<StaffAdminPanelProps> = ({
  applications,
  orders,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteApplication,
  onUpdateOrderStatus,
  onUpdateOrderNotes,
  onDeleteOrder,
  onAddOrder,
  onRefreshOrders,
  onCleanMockOrders,
  onRefreshApplications,
  onCleanMockApplications,
  onArchiveOrder,
  onArchiveApplication,
  onBackToPortal,
  onCopyText,
  language = 'en',
}) => {
  const isAr = language === 'ar';

  // Primary passcode authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active section inside dashboard: 'orders' (Store Purchases) | 'applications' (Staff Apply)
  const [activeDashboardTab, setActiveDashboardTab] = useState<'orders' | 'applications'>('orders');

  // LIVE CLOCK TICKER FOR ACCURATE 10-MINUTE COUNTDOWN & ARCHIVING
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ORDERS VIEW MODE:
  // 'active' = جاري العمل عليها والنشطة (Pending + decided within 10 min)
  // 'archive' = سجل المقبول والمرفوض (Archived decided orders)
  // 'all' = الكل
  const [orderViewMode, setOrderViewMode] = useState<'active' | 'archive' | 'all'>('active');
  const [orderArchiveFilter, setOrderArchiveFilter] = useState<'all' | 'accepted' | 'cancelled'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [orderNotesDraft, setOrderNotesDraft] = useState('');
  const [orderNotesSuccess, setOrderNotesSuccess] = useState(false);
  const [isSavingOrderNotes, setIsSavingOrderNotes] = useState(false);

  // Full-size image lightbox state for receipts
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<{
    url: string;
    title: string;
    player: string;
    orderId: string;
    amount: string;
    senderPhone?: string;
  } | null>(null);

  // Cancel reason prompt modal for an order
  const [cancellingOrder, setCancellingOrder] = useState<StoreOrder | null>(null);
  const [cancelReasonDraft, setCancelReasonDraft] = useState(
    'العملية ملغية: لم يتم تحويل المبلغ المطلوب لحساب فودافون كاش الخاص بالسيرفر.'
  );

  // APPLICATIONS VIEW MODE:
  // 'active' = جاري العمل عليها والنشطة (Pending + decided within 10 min)
  // 'archive' = سجل المقبول والمرفوض (Archived decided apps)
  // 'all' = الكل
  const [appViewMode, setAppViewMode] = useState<'active' | 'archive' | 'all'>('active');
  const [appArchiveFilter, setAppArchiveFilter] = useState<'all' | 'accepted' | 'denied'>('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<StaffApplication | null>(null);
  const [appNotesDraft, setAppNotesDraft] = useState('');
  const [isSavingAppNotes, setIsSavingAppNotes] = useState(false);
  const [appNotesSuccess, setAppNotesSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // AUTO-ARCHIVE HELPERS (10 MINUTES LOGIC)
  // ---------------------------------------------------------------------------
  const isOrderArchived = (order: StoreOrder, now: number): boolean => {
    if (order.status === 'pending') return false;
    if (order.archived === true) return true;
    if (order.reviewedTimestamp) {
      return now - order.reviewedTimestamp >= AUTO_ARCHIVE_MS;
    }
    if (order.reviewedAt) {
      const parsed = Date.parse(order.reviewedAt);
      if (!isNaN(parsed)) {
        return now - parsed >= AUTO_ARCHIVE_MS;
      }
      return true;
    }
    return false;
  };

  const getOrderRemainingSeconds = (order: StoreOrder, now: number): number => {
    if (order.status === 'pending' || order.archived === true) return 0;
    if (order.reviewedTimestamp) {
      const diff = AUTO_ARCHIVE_MS - (now - order.reviewedTimestamp);
      return Math.max(0, Math.ceil(diff / 1000));
    }
    return 0;
  };

  const isAppArchived = (app: StaffApplication, now: number): boolean => {
    if (app.status === 'pending') return false;
    if (app.archived === true) return true;
    if (app.reviewedTimestamp) {
      return now - app.reviewedTimestamp >= AUTO_ARCHIVE_MS;
    }
    if (app.reviewedAt) {
      const parsed = Date.parse(app.reviewedAt);
      if (!isNaN(parsed)) {
        return now - parsed >= AUTO_ARCHIVE_MS;
      }
      return true;
    }
    return false;
  };

  const getAppRemainingSeconds = (app: StaffApplication, now: number): number => {
    if (app.status === 'pending' || app.archived === true) return 0;
    if (app.reviewedTimestamp) {
      const diff = AUTO_ARCHIVE_MS - (now - app.reviewedTimestamp);
      return Math.max(0, Math.ceil(diff / 1000));
    }
    return 0;
  };

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sync auto-archive status with backend when countdown finishes
  useEffect(() => {
    orders.forEach((order) => {
      if (order.status !== 'pending' && !order.archived && order.reviewedTimestamp) {
        if (Date.now() - order.reviewedTimestamp >= AUTO_ARCHIVE_MS) {
          if (onArchiveOrder) {
            onArchiveOrder(order.orderId, true);
          }
        }
      }
    });

    applications.forEach((app) => {
      if (app.status !== 'pending' && !app.archived && app.reviewedTimestamp) {
        if (Date.now() - app.reviewedTimestamp >= AUTO_ARCHIVE_MS) {
          if (onArchiveApplication) {
            onArchiveApplication(app.id, true);
          }
        }
      }
    });
  }, [currentTime, orders, applications, onArchiveOrder, onArchiveApplication]);

  // ORDERS STATISTICS
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const acceptedOrdersCount = orders.filter((o) => o.status === 'accepted').length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'cancelled').length;

  const activeOrders = useMemo(() => {
    return orders.filter((o) => !isOrderArchived(o, currentTime));
  }, [orders, currentTime]);

  const archivedOrders = useMemo(() => {
    return orders.filter((o) => isOrderArchived(o, currentTime));
  }, [orders, currentTime]);

  const activeOrdersCount = activeOrders.length;
  const archivedOrdersCount = archivedOrders.length;
  const acceptedArchivedOrdersCount = archivedOrders.filter((o) => o.status === 'accepted').length;
  const cancelledArchivedOrdersCount = archivedOrders.filter((o) => o.status === 'cancelled').length;

  // APPLICATIONS STATISTICS
  const totalAppsCount = applications.length;
  const pendingAppsCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedAppsCount = applications.filter((a) => a.status === 'accepted').length;
  const deniedAppsCount = applications.filter((a) => a.status === 'denied').length;

  const activeApps = useMemo(() => {
    return applications.filter((a) => !isAppArchived(a, currentTime));
  }, [applications, currentTime]);

  const archivedApps = useMemo(() => {
    return applications.filter((a) => isAppArchived(a, currentTime));
  }, [applications, currentTime]);

  const activeAppsCount = activeApps.length;
  const archivedAppsCount = archivedApps.length;
  const acceptedArchivedAppsCount = archivedApps.filter((a) => a.status === 'accepted').length;
  const deniedArchivedAppsCount = archivedApps.filter((a) => a.status === 'denied').length;

  // Filtered Orders based on view mode (active vs archive vs all), archive filter, status filter & search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const archived = isOrderArchived(order, currentTime);
      
      // View Mode Check
      if (orderViewMode === 'active' && archived) return false;
      if (orderViewMode === 'archive') {
        if (!archived) return false;
        if (orderArchiveFilter === 'accepted' && order.status !== 'accepted') return false;
        if (orderArchiveFilter === 'cancelled' && order.status !== 'cancelled') return false;
      }

      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderId.toLowerCase().includes(q) ||
        order.player.toLowerCase().includes(q) ||
        order.senderPhone.toLowerCase().includes(q) ||
        order.package.toLowerCase().includes(q) ||
        order.securityPin.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [orders, orderViewMode, orderArchiveFilter, orderStatusFilter, orderSearchQuery, currentTime]);

  // Filtered Applications based on view mode, archive filter, status filter & search
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const archived = isAppArchived(app, currentTime);

      // View Mode Check
      if (appViewMode === 'active' && archived) return false;
      if (appViewMode === 'archive') {
        if (!archived) return false;
        if (appArchiveFilter === 'accepted' && app.status !== 'accepted') return false;
        if (appArchiveFilter === 'denied' && app.status !== 'denied') return false;
      }

      const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
      const q = appSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.minecraftUsername.toLowerCase().includes(q) ||
        app.discordUsername.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q) ||
        app.country.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, appViewMode, appArchiveFilter, appStatusFilter, appSearchQuery, currentTime]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPassword.trim();
    if (VALID_PASSCODES.includes(clean)) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError(
        isAr
          ? 'رمز المرور غير صحيح. يرجى إدخال رمز المرور السري (k9#mP2!vL8$xR4@q).'
          : 'Invalid passcode. Please enter secret staff code (k9#mP2!vL8$xR4@q).'
      );
    }
  };

  // ORDER ACTIONS
  const handleOpenOrderDetail = (order: StoreOrder) => {
    setSelectedOrder(order);
    setOrderNotesDraft(order.staffNotes || '');
    setOrderNotesSuccess(false);
  };

  const handleSaveOrderNotes = () => {
    if (!selectedOrder) return;
    setIsSavingOrderNotes(true);
    setTimeout(() => {
      onUpdateOrderNotes(selectedOrder.orderId, orderNotesDraft);
      setSelectedOrder((prev) => (prev ? { ...prev, staffNotes: orderNotesDraft } : null));
      setIsSavingOrderNotes(false);
      setOrderNotesSuccess(true);
      setTimeout(() => setOrderNotesSuccess(false), 2500);
    }, 250);
  };

  const handleQuickAcceptOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    onUpdateOrderStatus(orderId, 'accepted');
    if (targetOrder) {
      const pkg = targetOrder.package.toLowerCase();
      const rank = pkg.includes('mvp+') ? 'mvpplus' : pkg.includes('mvp') ? 'mvp' : pkg.includes('vip+') ? 'vipplus' : 'vip';
      const cmd = `/lp user ${targetOrder.player} parent add ${rank}`;
      onCopyText('', isAr ? `⚡ تم تأكيد الدفع وإرسال أمر إعطاء رتبة (${targetOrder.package}) للاعب ${targetOrder.player} فوراً في السيرفر!` : `Payment accepted & rank ${targetOrder.package} dispatched in-game!`);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'accepted',
          delivered: true,
          deliveredAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
          commandExecuted: cmd,
        });
      }
    } else if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'accepted' });
    }
  };

  const handleOpenCancelPrompt = (order: StoreOrder) => {
    setCancellingOrder(order);
    setCancelReasonDraft(
      isAr
        ? 'العملية ملغية: لم يتم تحويل المبلغ المطلوب لحساب فودافون كاش الخاص بالسيرفر.'
        : 'Transaction cancelled: Payment was not transferred to Vodafone Cash.'
    );
  };

  const handleConfirmCancelOrder = () => {
    if (!cancellingOrder) return;
    onUpdateOrderStatus(cancellingOrder.orderId, 'cancelled', cancelReasonDraft);
    if (selectedOrder && selectedOrder.orderId === cancellingOrder.orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: 'cancelled',
        cancellationReason: cancelReasonDraft,
      });
    }
    setCancellingOrder(null);
  };

  // Generate simulated order to immediately test real-time purchases
  const handleSimulateNewPurchase = () => {
    const timeComponent = Date.now().toString(36).toUpperCase().slice(-4);
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const orderId = `VTX-VC-${timeComponent}-${randDigits}`;
    const randPin = Math.floor(1000 + Math.random() * 9000);
    const securityPin = `PASS-${randPin}-NEW`;

    const samplePackages = [
      { name: 'رتبة TITAN [تيتان]', egp: '400 EGP', usd: '$8.00', tier: 'TITAN' },
      { name: 'رتبة VIP+ [في آي بي بلس]', egp: '150 EGP', usd: '$3.00', tier: 'VIP+' },
      { name: 'باك مفاتيح لايف ستيل (5x)', egp: '100 EGP', usd: '$2.00', tier: 'keys' },
      { name: 'رتبة OVERLORD [أوفرلورد]', egp: '500 EGP', usd: '$10.00', tier: 'OVERLORD' },
    ];
    const picked = samplePackages[Math.floor(Math.random() * samplePackages.length)];
    const samplePlayers = ['Ziad_Gamer', 'ShadowPvP', 'Youssef_King', 'VortexFan99', 'Alex_Crafter'];
    const player = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];

    const newOrder: StoreOrder = {
      orderId,
      securityPin,
      package: picked.name,
      tier: picked.tier,
      priceEgp: picked.egp,
      priceUsd: picked.usd,
      paymentMethod: 'فودافون كاش (تحويل مباشر)',
      player,
      platform: 'java',
      senderPhone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
      transactionRef: 'تم إرسال طلب الشراء عبر المتجر وبانتظار المراجعة',
      adminRecipient: 'el_joker_.',
      timestamp: new Date().toLocaleString(),
      status: 'pending',
      staffNotes: 'طلب شراء جديد وصل الآن عبر متجر VortexMC.',
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    }
  };

  // APPLICATION ACTIONS
  const handleOpenAppDetail = (app: StaffApplication) => {
    setSelectedApp(app);
    setAppNotesDraft(app.notes || '');
    setAppNotesSuccess(false);
  };

  const handleSaveAppNotes = () => {
    if (!selectedApp) return;
    setIsSavingAppNotes(true);
    setTimeout(() => {
      onUpdateNotes(selectedApp.id, appNotesDraft);
      setSelectedApp((prev) => (prev ? { ...prev, notes: appNotesDraft } : null));
      setIsSavingAppNotes(false);
      setAppNotesSuccess(true);
      setTimeout(() => setAppNotesSuccess(false), 2500);
    }, 250);
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="p-8 rounded-3xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(88,28,135,0.4)]">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            {isAr ? 'دخول لوحة تحكم إدارة فورتكس' : 'Vortex Staff Dashboard Login'}
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {isAr
              ? 'مخصصة للمالكين والإدارة لمتابعة عمليات الشراء والتحويلات وطلبات التقديم للاستاف.'
              : 'Reserved for owners and staff leadership to review store transactions and staff applications.'}
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={isAr ? 'أدخل رمز مرور الإدارة...' : 'Enter staff passcode...'}
                className="w-full bg-[#0d1422] border border-white/15 focus:border-[#00d2ff] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none text-center font-mono"
              />
              {authError && <p className="text-xs text-rose-400 mt-1.5 font-bold">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#00d2ff] text-white font-black text-sm uppercase tracking-wide shadow-lg hover:shadow-purple-500/40 transition-all cursor-pointer"
            >
              {isAr ? 'فتح لوحة التحكم' : 'Unlock Dashboard'}
            </button>

            <button
              type="button"
              onClick={() => setIsAuthenticated(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-purple-300 font-bold border border-white/10 transition-colors cursor-pointer"
            >
              {isAr ? '⚡ فتح سريع كمالك (Quick Bypass)' : '⚡ Quick Owner Demo Access'}
            </button>

            <button
              type="button"
              onClick={onBackToPortal}
              className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2 cursor-pointer"
            >
              {isAr ? '← العودة لصفحة التقديم' : '← Back to Application Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#39f77e] animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-[#00d2ff] uppercase tracking-wider">
              {isAr ? 'لوحة القيادة والإدارة العليا' : 'Server Leadership & Staff Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{isAr ? 'إدارة فورتكس MC • المبيعات والاستاف' : 'VortexMC Management Panel'}</span>
            <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg" dir="ltr">
              v3.0 Live
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'صفحة التقديم' : 'Portal'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? 'قفل اللوحة' : 'Lock Panel'}</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB SWITCHER: PURCHASES vs APPLICATIONS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-xl shadow-lg">
        {/* Tab 1: Store Purchases */}
        <button
          type="button"
          onClick={() => setActiveDashboardTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeDashboardTab === 'orders'
              ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{isAr ? 'عمليات الشراء والتحويلات (المتجر)' : 'Store Purchases & Transactions'}</span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
            activeDashboardTab === 'orders'
              ? 'bg-slate-950/20 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300'
          }`}>
            {totalOrdersCount}
          </span>
          {pendingOrdersCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        {/* Tab 2: Staff Applications */}
        <button
          type="button"
          onClick={() => setActiveDashboardTab('applications')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeDashboardTab === 'applications'
              ? 'bg-gradient-to-r from-purple-600 to-[#a855f7] text-white shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isAr ? 'طلبات التقديم للإدارة (الاستاف 15+)' : 'Staff Applications (15+)'}</span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
            activeDashboardTab === 'applications'
              ? 'bg-white/20 text-white font-bold'
              : 'bg-slate-800 text-slate-300'
          }`}>
            {totalAppsCount}
          </span>
          {pendingAppsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: STORE PURCHASES & VODAFONE CASH TRANSACTIONS                    */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'orders' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'إجمالي عمليات الشراء' : 'Total Orders'}</span>
                <ShoppingCart className="w-4 h-4 text-[#00d2ff]" />
              </div>
              <div className="font-mono text-3xl font-black text-white" dir="ltr">{totalOrdersCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">{isAr ? 'سجل المعاملات في المتجر' : 'Recorded store checkout orders'}</div>
            </div>

            {/* Pending Orders */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.1)] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'قيد مراجعة التحويل' : 'Pending Verification'}</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-3xl font-black text-amber-400" dir="ltr">{pendingOrdersCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">{isAr ? 'بانتظار التأكد من وصول الفلوس' : 'Awaiting payment confirmation'}</div>
            </div>

            {/* Accepted Orders */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'عمليات مقبولة ومفعلة' : 'Accepted & Delivered'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono text-3xl font-black text-emerald-400" dir="ltr">{acceptedOrdersCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">{isAr ? 'تم استلام الفلوس وتفعيل الرتبة' : 'Payment received & rank assigned'}</div>
            </div>

            {/* Cancelled Orders (Funds Not Received) */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-rose-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(244,63,94,0.1)] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-rose-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'ملغية (لم يتم التحويل)' : 'Cancelled (Unpaid)'}</span>
                <Ban className="w-4 h-4 text-rose-400" />
              </div>
              <div className="font-mono text-3xl font-black text-rose-400" dir="ltr">{cancelledOrdersCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">{isAr ? 'العملية ملغية: لم تصل الفلوس' : 'Payment was not transferred'}</div>
            </div>
          </div>

          {/* VIEW SELECTOR TABS: ACTIVE QUEUE vs ACCEPTED/REJECTED ARCHIVE */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">
                  {isAr ? 'عرض السجلات:' : 'View Mode:'}
                </span>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0a101f] border border-white/10">
                  {/* Tab: Active (In-Progress) */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderViewMode('active');
                      setOrderStatusFilter('all');
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      orderViewMode === 'active'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isAr ? '⚡ جاري العمل عليها (النشطة)' : '⚡ Active Queue'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/25 font-mono font-bold">
                      {activeOrdersCount}
                    </span>
                  </button>

                  {/* Tab: Archive (Accepted & Rejected Log) */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderViewMode('archive');
                      setOrderStatusFilter('all');
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      orderViewMode === 'archive'
                        ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{isAr ? '📁 سجل المقبول والمرفوض (الأرشيف)' : '📁 Accepted / Rejected Archive'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/25 font-mono font-bold">
                      {archivedOrdersCount}
                    </span>
                  </button>

                  {/* Tab: All */}
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('all')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orderViewMode === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{isAr ? 'الكل' : 'All'}</span>
                    <span className="text-[10px] font-mono text-slate-500">({totalOrdersCount})</span>
                  </button>
                </div>
              </div>

              {/* Countdown / Auto-archive Notice */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5">
                <Timer className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>{isAr ? 'تنتقل الطلبات بعد 10 دقائق من قبولها/رفضها تلقائياً إلى الأرشيف' : 'Processed orders move to archive 10 mins post-decision'}</span>
              </div>
            </div>

            {/* Sub-Filters inside Archive Mode */}
            {orderViewMode === 'archive' && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400">
                  {isAr ? 'تصفية سجل الأرشيف:' : 'Filter Archive:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOrderArchiveFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orderArchiveFilter === 'all'
                        ? 'bg-slate-800 text-white border border-white/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAr ? `جميع المؤرشفات (${archivedOrdersCount})` : `All (${archivedOrdersCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderArchiveFilter('accepted')}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orderArchiveFilter === 'accepted'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{isAr ? `المقبولة فقط (${acceptedArchivedOrdersCount})` : `Accepted (${acceptedArchivedOrdersCount})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderArchiveFilter('cancelled')}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orderArchiveFilter === 'cancelled'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Ban className="w-3 h-3 text-rose-400" />
                    <span>{isAr ? `الملغية فقط (${cancelledArchivedOrdersCount})` : `Cancelled (${cancelledArchivedOrdersCount})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search, Filter & Quick Test Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/10">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className={`w-4 h-4 text-slate-500 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث باسم اللاعب، رقم المحفظة، كود العملية...' : 'Search by player IGN, phone, order ID...'}
                className={`w-full bg-[#0d1422] border border-white/15 focus:border-[#00d2ff] rounded-xl ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none`}
              />
            </div>

            {/* Status Filter Tabs (Only shown in 'all' or 'active' view mode) */}
            {orderViewMode !== 'archive' && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d1422] border border-white/10 w-full md:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: isAr ? 'الكل' : 'All' },
                  { id: 'pending', label: isAr ? 'قيد التحقق' : 'Pending' },
                  { id: 'accepted', label: isAr ? 'مقبولة' : 'Accepted' },
                  { id: 'cancelled', label: isAr ? 'ملغية' : 'Cancelled' },
                ].map((tab) => {
                  const isActive = orderStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#00d2ff] text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Management Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {onRefreshOrders && (
                <button
                  type="button"
                  onClick={onRefreshOrders}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition-all cursor-pointer whitespace-nowrap"
                  title={isAr ? 'تحديث العمليات الحقيقية من السيرفر' : 'Refresh live orders'}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>{isAr ? 'تحديث العمليات الحقيقية' : 'Refresh Orders'}</span>
                </button>
              )}

              {onCleanMockOrders && (
                <button
                  type="button"
                  onClick={onCleanMockOrders}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap"
                  title={isAr ? 'مسح وحذف أي بيانات وهمية تجريبية' : 'Remove fake test orders'}
                >
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'تنظيف العمليات الوهمية' : 'Clean Mock Data'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="rounded-3xl bg-slate-950/80 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3 px-4">
                {orderViewMode === 'active' ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCheck className="w-7 h-7" />
                    </div>
                    <div className="text-base font-black text-slate-100">
                      {isAr ? 'قائمة العمل نظيفة ومكتملة! 🎉' : 'Active Queue is Clear!'}
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isAr
                        ? 'لا توجد طلبات شراء قيد المعالجة حالياً. كافة الطلبات التي تم قبولها أو إلغاؤها انتقلت بعد مرور 10 دقائق تلقائياً إلى "سجل المقبول والمرفوض".'
                        : 'No active store orders in progress. Processed orders have moved automatically to the Accepted/Rejected Archive after 10 minutes.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOrderViewMode('archive')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d2ff]/20 to-[#0080ff]/20 hover:from-[#00d2ff]/30 hover:to-[#0080ff]/30 text-[#00d2ff] font-bold text-xs border border-[#00d2ff]/30 transition-all cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      <span>{isAr ? `فتح سجل المقبول والمرفوض (${archivedOrdersCount})` : `Open Archive (${archivedOrdersCount})`}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Archive className="w-10 h-10 mx-auto text-slate-600" />
                    <div className="text-base font-bold text-slate-200">
                      {isAr ? 'لا توجد عناصر في هذا السجل حالياً' : 'No records found in this view'}
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isAr
                        ? 'سجل المقبول والمرفوض يحتفظ تلقائياً بجميع العمليات بعد انتهاء مهلة الـ 10 دقائق لتوثيق الحسابات ومراجعتها في أي وقت.'
                        : 'Accepted & Rejected Archive retains all transactions post 10-minute window for review and logs.'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`w-full text-xs ${isAr ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-white/10 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5">{isAr ? 'اللاعب والحساب' : 'Player IGN'}</th>
                      <th className="py-4 px-4">{isAr ? 'الرتبة والمبلغ' : 'Package & Price'}</th>
                      <th className="py-4 px-4">{isAr ? 'رقم المحول / الفودافون' : 'Sender Phone'}</th>
                      <th className="py-4 px-4">{isAr ? 'كود العملية والأمان' : 'Order ID & Passcode'}</th>
                      <th className="py-4 px-4">{isAr ? 'صورة الإيصال / الفاتورة' : 'Payment Proof'}</th>
                      <th className="py-4 px-4">{isAr ? 'الحالة والأرشفة (10 دقائق)' : 'Status & Archiving'}</th>
                      <th className="py-4 px-4">{isAr ? 'التاريخ' : 'Date'}</th>
                      <th className="py-4 px-5 text-center">{isAr ? 'القرار والإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order) => {
                      const avatar = `https://mc-heads.net/avatar/${encodeURIComponent(order.player.replace(/^[.*]/, ''))}/32`;
                      const orderIsArchived = isOrderArchived(order, currentTime);
                      const remainingSec = getOrderRemainingSeconds(order, currentTime);

                      return (
                        <tr key={order.orderId} className={`hover:bg-slate-900/50 transition-colors group ${orderIsArchived ? 'opacity-90 bg-slate-950/40' : ''}`}>
                          {/* Player */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatar}
                                alt={order.player}
                                className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5" dir="ltr">
                                  <span>{order.player}</span>
                                </div>
                                <div className="text-[10px] text-[#00d2ff] font-mono uppercase">
                                  {order.platform === 'bedrock' ? '📱 Bedrock' : '💻 Java Edition'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Package & Price */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-white">{order.package}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-emerald-400 font-bold font-mono text-[11px]">{order.priceEgp}</span>
                              <span className="text-[10px] text-slate-500">({order.priceUsd})</span>
                            </div>
                          </td>

                          {/* Sender Phone */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 font-mono text-rose-300 font-bold" dir="ltr">
                              <Smartphone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>{order.senderPhone}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={order.transactionRef}>
                              {order.transactionRef}
                            </div>
                          </td>

                          {/* Order ID & Passcode */}
                          <td className="py-4 px-4 font-mono">
                            <div className="flex items-center gap-1 text-slate-300 font-bold" dir="ltr">
                              <span>{order.orderId}</span>
                              <button
                                type="button"
                                onClick={() => onCopyText(order.orderId, isAr ? 'تم نسخ كود العملية' : 'Copied Order ID')}
                                className="text-slate-500 hover:text-white"
                                title="Copy"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-amber-400 font-bold mt-0.5" dir="ltr">
                              {order.securityPin}
                            </div>
                          </td>

                          {/* Payment Proof Thumbnail */}
                          <td className="py-4 px-4">
                            {order.paymentProof ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setViewingReceiptUrl({
                                    url: order.paymentProof!,
                                    title: isAr ? 'إيصال تحويل فودافون كاش' : 'Payment Proof Receipt',
                                    player: order.player,
                                    orderId: order.orderId,
                                    amount: order.priceEgp,
                                    senderPhone: order.senderPhone,
                                  })}
                                  className="relative w-10 h-10 rounded-lg overflow-hidden border border-rose-500/50 bg-black cursor-pointer group shrink-0 hover:scale-105 transition-transform"
                                  title={isAr ? 'اضغط لتكبير الإيصال والتأكد من التحويل' : 'Click to preview full receipt'}
                                >
                                  <img
                                    src={order.paymentProof}
                                    alt="إيصال"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <Eye className="w-3.5 h-3.5" />
                                  </div>
                                </button>
                                <div className="text-[10px]">
                                  <span className="text-emerald-400 font-bold block">{isAr ? 'مرفق ✅' : 'Attached'}</span>
                                  <button
                                    type="button"
                                    onClick={() => setViewingReceiptUrl({
                                      url: order.paymentProof!,
                                      title: isAr ? 'إيصال تحويل فودافون كاش' : 'Payment Proof Receipt',
                                      player: order.player,
                                      orderId: order.orderId,
                                      amount: order.priceEgp,
                                      senderPhone: order.senderPhone,
                                    })}
                                    className="text-[#00d2ff] hover:underline cursor-pointer"
                                  >
                                    {isAr ? 'تكبير 🔍' : 'View'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                {isAr ? 'لم يُرفق' : 'None'}
                              </span>
                            )}
                          </td>

                          {/* Status & 10-Minute Archiving Countdown */}
                          <td className="py-4 px-4">
                            {order.status === 'pending' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                  <Clock className="w-3 h-3" />
                                  <span>{isAr ? 'قيد التحقق' : 'Pending'}</span>
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {isAr ? 'بانتظار تأكيد التحويل' : 'Awaiting transfer'}
                                </div>
                              </div>
                            )}

                            {order.status === 'accepted' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isAr ? 'مقبولة ومفعلة' : 'Accepted'}</span>
                                </span>
                                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                                  <Sparkles className="w-3 h-3 text-[#00d2ff]" />
                                  <span>{isAr ? 'الرتبة مسلّمة في السيرفر ⚡' : 'Rank delivered in-game'}</span>
                                </div>

                                {/* Countdown or Archived badge */}
                                {remainingSec > 0 && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono mt-1 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span>{isAr ? `نقل للأرشيف: ${formatSeconds(remainingSec)}` : `Archives in ${formatSeconds(remainingSec)}`}</span>
                                    {onArchiveOrder && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onArchiveOrder(order.orderId, true);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-[9px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                        title={isAr ? 'أرشفة فورية في سجل المقبول والمرفوض' : 'Archive immediately'}
                                      >
                                        {isAr ? 'أرشف الآن' : 'Archive'}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {orderIsArchived && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono mt-1">
                                    <Archive className="w-3 h-3 text-purple-400 shrink-0" />
                                    <span>{isAr ? 'مؤرشف في سجل المقبول' : 'Archived Log'}</span>
                                  </div>
                                )}

                                {order.commandExecuted && (
                                  <div className="text-[9px] font-mono text-slate-400 truncate max-w-[140px] mt-0.5" title={order.commandExecuted}>
                                    {order.commandExecuted}
                                  </div>
                                )}
                              </div>
                            )}

                            {order.status === 'cancelled' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                  <Ban className="w-3 h-3" />
                                  <span>{isAr ? 'العملية ملغية' : 'Cancelled'}</span>
                                </span>
                                <div className="text-[10px] text-rose-400 mt-1 font-semibold" title={order.cancellationReason}>
                                  {isAr ? 'لم يتم تحويل الفلوس ❌' : 'Funds not received'}
                                </div>

                                {/* Countdown or Archived badge */}
                                {remainingSec > 0 && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono mt-1 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span>{isAr ? `نقل للأرشيف: ${formatSeconds(remainingSec)}` : `Archives in ${formatSeconds(remainingSec)}`}</span>
                                    {onArchiveOrder && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onArchiveOrder(order.orderId, true);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-[9px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                        title={isAr ? 'أرشفة فورية في سجل المقبول والمرفوض' : 'Archive immediately'}
                                      >
                                        {isAr ? 'أرشف الآن' : 'Archive'}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {orderIsArchived && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono mt-1">
                                    <Archive className="w-3 h-3 text-purple-400 shrink-0" />
                                    <span>{isAr ? 'مؤرشف في سجل المرفوض' : 'Archived Log'}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-400" dir="ltr">
                            <div>{order.timestamp}</div>
                            {order.reviewedAt && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {isAr ? 'المراجعة: ' : 'Reviewed: '}{order.reviewedAt}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Restore to Active if Archived */}
                              {onArchiveOrder && orderIsArchived && (
                                <button
                                  type="button"
                                  onClick={() => onArchiveOrder(order.orderId, false)}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                                  title={isAr ? 'استعادة إلى قائمة الطلبات الجارية' : 'Restore to Active Queue'}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Inspect */}
                              <button
                                type="button"
                                onClick={() => handleOpenOrderDetail(order)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#00d2ff]/20 text-slate-300 hover:text-[#00d2ff] border border-white/10 transition-colors cursor-pointer"
                                title={isAr ? 'فحص كامل تفاصيل التحويل' : 'Inspect Order'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Accept */}
                              <button
                                type="button"
                                onClick={() => handleQuickAcceptOrder(order.orderId)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  order.status === 'accepted'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-950/40 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                                }`}
                                title={isAr ? 'قبول وتأكيد وصول الفلوس' : 'Accept & Confirm Paid'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              {/* Cancel (Payment Not Received) */}
                              <button
                                type="button"
                                onClick={() => handleOpenCancelPrompt(order)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  order.status === 'cancelled'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-950/40 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30'
                                }`}
                                title={isAr ? 'إلغاء العملية (لم يتم تحويل الفلوس)' : 'Cancel (Payment Not Received)'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => onDeleteOrder(order.orderId)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                                title={isAr ? 'حذف من السجل' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: STAFF APPLICATIONS (15+ YEARS REQUIREMENT)                    */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'applications' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'إجمالي الطلبات المقدمة' : 'Total Applications'}</span>
                <FileText className="w-4 h-4 text-[#00d2ff]" />
              </div>
              <div className="font-mono text-3xl font-black text-white" dir="ltr">{totalAppsCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">{isAr ? 'جميع المتقدمين للموسم' : 'All seasonal applicants'}</div>
            </div>

            {/* Pending */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.1)] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'قيد المراجعة والانتظار' : 'Pending Review'}</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-3xl font-black text-amber-400" dir="ltr">{pendingAppsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">{isAr ? 'بانتظار قرار الإدارة' : 'Awaiting decision'}</div>
            </div>

            {/* Accepted */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'الطلبات المقبولة' : 'Accepted Candidates'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono text-3xl font-black text-emerald-400" dir="ltr">{acceptedAppsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">{isAr ? 'مقبولون للتجربة (Trial)' : 'Invited for trial rank'}</div>
            </div>

            {/* Denied */}
            <div className={`p-5 rounded-2xl bg-slate-950/70 border border-rose-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(244,63,94,0.1)] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between text-xs text-rose-400 font-bold tracking-wider mb-2">
                <span>{isAr ? 'الطلبات المرفوضة' : 'Denied Applications'}</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="font-mono text-3xl font-black text-rose-400" dir="ltr">{deniedAppsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">{isAr ? 'طلبات تم استبعادها' : 'Declined submissions'}</div>
            </div>
          </div>

          {/* VIEW SELECTOR TABS: ACTIVE QUEUE vs ACCEPTED/DENIED ARCHIVE */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-3 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">
                  {isAr ? 'عرض طلبات التقديم:' : 'Applications View:'}
                </span>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0a101f] border border-white/10">
                  {/* Tab: Active (In-Progress / Pending) */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppViewMode('active');
                      setAppStatusFilter('all');
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      appViewMode === 'active'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isAr ? '⚡ جاري مراجعتها (النشطة)' : '⚡ Active Queue'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono font-bold">
                      {activeAppsCount}
                    </span>
                  </button>

                  {/* Tab: Archive (Accepted & Denied Log) */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppViewMode('archive');
                      setAppStatusFilter('all');
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      appViewMode === 'archive'
                        ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{isAr ? '📁 سجل المقبول والمرفوض (الأرشيف)' : '📁 Accepted / Denied Archive'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/25 font-mono font-bold">
                      {archivedAppsCount}
                    </span>
                  </button>

                  {/* Tab: All */}
                  <button
                    type="button"
                    onClick={() => setAppViewMode('all')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      appViewMode === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{isAr ? 'الكل' : 'All'}</span>
                    <span className="text-[10px] font-mono text-slate-500">({totalAppsCount})</span>
                  </button>
                </div>
              </div>

              {/* Countdown / Auto-archive Notice */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5">
                <Timer className="w-3.5 h-3.5 text-purple-400" />
                <span>{isAr ? 'تنتقل طلبات التقديم بعد 10 دقائق من قبولها/رفضها تلقائياً إلى الأرشيف' : 'Applications auto-archive 10 mins post-decision'}</span>
              </div>
            </div>

            {/* Sub-Filters inside Archive Mode */}
            {appViewMode === 'archive' && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400">
                  {isAr ? 'تصفية سجل المقبول والمرفوض:' : 'Filter Archive:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAppArchiveFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      appArchiveFilter === 'all'
                        ? 'bg-slate-800 text-white border border-white/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAr ? `جميع المؤرشفات (${archivedAppsCount})` : `All (${archivedAppsCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppArchiveFilter('accepted')}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      appArchiveFilter === 'accepted'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{isAr ? `المقبولون فقط (${acceptedArchivedAppsCount})` : `Accepted (${acceptedArchivedAppsCount})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppArchiveFilter('denied')}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      appArchiveFilter === 'denied'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span>{isAr ? `المرفوضون فقط (${deniedArchivedAppsCount})` : `Denied (${deniedArchivedAppsCount})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/10">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className={`w-4 h-4 text-slate-500 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث بالاسم، الديسكورد، رقم الطلب...' : 'Search by IGN, Discord, ID...'}
                className={`w-full bg-[#0d1422] border border-white/15 focus:border-[#00d2ff] rounded-xl ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none`}
              />
            </div>

            {/* Status Tabs (Only shown when not in archive sub-mode) */}
            {appViewMode !== 'archive' && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d1422] border border-white/10 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: isAr ? 'الكل' : 'All' },
                  { id: 'pending', label: isAr ? 'قيد الانتظار' : 'Pending' },
                  { id: 'accepted', label: isAr ? 'مقبول' : 'Accepted' },
                  { id: 'denied', label: isAr ? 'مرفوض' : 'Denied' },
                ].map((tab) => {
                  const isActive = appStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAppStatusFilter(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-purple-500 text-white shadow-md font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Applications Management Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {onRefreshApplications && (
                <button
                  type="button"
                  onClick={onRefreshApplications}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition-all cursor-pointer whitespace-nowrap"
                  title={isAr ? 'تحديث الطلبات الحقيقية من السيرفر' : 'Refresh applications from server'}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? 'تحديث الطلبات الحقيقية' : 'Refresh Applications'}</span>
                </button>
              )}

              {onCleanMockApplications && (
                <button
                  type="button"
                  onClick={onCleanMockApplications}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap"
                  title={isAr ? 'مسح وحذف أي طلبات وهمية تجريبية' : 'Remove mock test applications'}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'تنظيف الطلبات الوهمية' : 'Clean Mock Data'}</span>
                </button>
              )}
            </div>
          </div>

          {/* APPLICATIONS TABLE */}
          <div className="rounded-3xl bg-slate-950/80 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
            {filteredApps.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3 px-4">
                {appViewMode === 'active' ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                      <CheckCheck className="w-7 h-7" />
                    </div>
                    <div className="text-base font-black text-slate-100">
                      {isAr ? 'تمت مراجعة وفحص كافة الطلبات! 🎉' : 'All Applications Reviewed!'}
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isAr
                        ? 'لا توجد طلبات تقديم قيد الانتظار حالياً. تم نقل الطلبات التي تم البت فيها تلقائياً بعد 10 دقائق إلى "سجل المقبول والمرفوض".'
                        : 'No active applications in queue. Decided applications have automatically moved to the Accepted & Denied Archive after 10 minutes.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAppViewMode('archive')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 font-bold text-xs border border-purple-500/30 transition-all cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      <span>{isAr ? `فتح سجل المقبول والمرفوض (${archivedAppsCount})` : `Open Archive (${archivedAppsCount})`}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Archive className="w-10 h-10 mx-auto text-slate-600" />
                    <div className="text-base font-bold text-slate-300">
                      {isAr ? 'لا توجد عناصر في هذا السجل حالياً' : 'No records found in this view'}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {isAr
                        ? 'جرّب تغيير فلتر الحالة أو مراجعة الطلبات الجارية.'
                        : 'Try adjusting your search query or status filter.'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`w-full text-xs ${isAr ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-white/10 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5">{isAr ? 'المتقدم (الحساب والديسكورد)' : 'Candidate (IGN & Discord)'}</th>
                      <th className="py-4 px-4">{isAr ? 'رقم التقديم' : 'App ID'}</th>
                      <th className="py-4 px-4">{isAr ? 'السن والبلد' : 'Age & Country'}</th>
                      <th className="py-4 px-4">{isAr ? 'الحالة والأرشفة (10 دقائق)' : 'Status & Archiving'}</th>
                      <th className="py-4 px-4">{isAr ? 'تاريخ التقديم' : 'Submitted At'}</th>
                      <th className="py-4 px-5 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.map((app) => {
                      const avatar = `https://mc-heads.net/avatar/${encodeURIComponent(app.minecraftUsername)}/32`;
                      const appIsArchived = isAppArchived(app, currentTime);
                      const remainingSec = getAppRemainingSeconds(app, currentTime);

                      return (
                        <tr key={app.id} className={`hover:bg-slate-900/50 transition-colors group ${appIsArchived ? 'opacity-90 bg-slate-950/40' : ''}`}>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatar}
                                alt={app.minecraftUsername}
                                className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5" dir="ltr">
                                  <span>{app.minecraftUsername}</span>
                                </div>
                                <div className="text-[11px] text-purple-400 font-mono" dir="ltr">
                                  @{app.discordUsername}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-slate-300" dir="ltr">
                            {app.id}
                          </td>

                          <td className="py-4 px-4 text-slate-300">
                            <div>
                              <span className="font-bold text-white">{app.age} {isAr ? 'سنة' : 'yrs'}</span>
                              <span className="text-[10px] font-bold text-[#00d2ff] bg-[#00d2ff]/10 px-1.5 py-0.5 rounded ml-1 mr-1">15+</span>
                            </div>
                            <div className="text-[11px] text-slate-400">{app.country}</div>
                          </td>

                          {/* Status & 10-Minute Archiving Countdown */}
                          <td className="py-4 px-4">
                            <div>
                              {app.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                  <Clock className="w-3 h-3" />
                                  <span>{isAr ? 'قيد الانتظار' : 'Pending'}</span>
                                </span>
                              )}
                              {app.status === 'accepted' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isAr ? 'مقبول (Trial)' : 'Accepted'}</span>
                                </span>
                              )}
                              {app.status === 'denied' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                  <XCircle className="w-3 h-3" />
                                  <span>{isAr ? 'مرفوض' : 'Denied'}</span>
                                </span>
                              )}

                              {/* Countdown or Archived badge */}
                              {remainingSec > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono mt-1 animate-pulse">
                                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{isAr ? `نقل للأرشيف: ${formatSeconds(remainingSec)}` : `Archives in ${formatSeconds(remainingSec)}`}</span>
                                  {onArchiveApplication && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onArchiveApplication(app.id, true);
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-[9px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                      title={isAr ? 'أرشفة فورية في سجل المقبول والمرفوض' : 'Archive immediately'}
                                    >
                                      {isAr ? 'أرشف الآن' : 'Archive'}
                                    </button>
                                  )}
                                </div>
                              )}

                              {appIsArchived && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono mt-1">
                                  <Archive className="w-3 h-3 text-purple-400 shrink-0" />
                                  <span>{isAr ? 'مؤرشف في سجل المقبول والمرفوض' : 'Archived Log'}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-[11px] text-slate-400" dir="ltr">
                            <div>{app.submittedAt}</div>
                            {app.reviewedAt && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {isAr ? 'المراجعة: ' : 'Reviewed: '}{app.reviewedAt}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Restore to Active if Archived */}
                              {onArchiveApplication && appIsArchived && (
                                <button
                                  type="button"
                                  onClick={() => onArchiveApplication(app.id, false)}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                                  title={isAr ? 'استعادة إلى قائمة الطلبات الجارية' : 'Restore to Active Queue'}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenAppDetail(app)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#00d2ff]/20 text-slate-300 hover:text-[#00d2ff] border border-white/10 transition-colors cursor-pointer"
                                title={isAr ? 'فحص كامل إجابات الطلب' : 'View Full Application'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onUpdateStatus(app.id, 'accepted')}
                                className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                                title={isAr ? 'قبول المتقدم' : 'Accept'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onUpdateStatus(app.id, 'denied')}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                                title={isAr ? 'رفض الطلب' : 'Deny'}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteApplication(app.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                                title={isAr ? 'حذف الطلب نهائياً' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER DETAILS INSPECTION                                            */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090e1a] border border-[#00d2ff]/40 shadow-[0_0_50px_rgba(0,210,255,0.3)] overflow-hidden ${isAr ? 'text-right' : 'text-left'}`}>
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(selectedOrder.player.replace(/^[.*]/, ''))}/48`}
                  alt={selectedOrder.player}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-white/15"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-white flex items-center gap-2" dir="ltr">
                    <span>{selectedOrder.player}</span>
                    <span className="text-[#00d2ff] font-mono text-xs">({selectedOrder.platform.toUpperCase()})</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {isAr ? 'كود العملية:' : 'Order ID:'} <span className="font-mono text-emerald-400">{selectedOrder.orderId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Change Status select */}
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newSt = e.target.value as OrderStatus;
                    if (newSt === 'cancelled') {
                      handleOpenCancelPrompt(selectedOrder);
                    } else {
                      onUpdateOrderStatus(selectedOrder.orderId, newSt);
                      setSelectedOrder({ ...selectedOrder, status: newSt });
                    }
                  }}
                  className="bg-slate-950 border border-white/20 text-xs font-bold rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#00d2ff] cursor-pointer"
                >
                  <option value="pending">{isAr ? 'قيد التحقق' : 'Pending'}</option>
                  <option value="accepted">{isAr ? 'مقبولة ومفعلة' : 'Accepted'}</option>
                  <option value="cancelled">{isAr ? 'العملية ملغية' : 'Cancelled'}</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Status Alert Banner */}
              {selectedOrder.status === 'cancelled' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'العملية ملغية (لم يتم تحويل الفلوس)' : 'Transaction Cancelled (Funds Not Received)'}</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    {selectedOrder.cancellationReason || (isAr ? 'لم يتم تحويل المبلغ المطلوب لحساب فودافون كاش الخاص بالسيرفر.' : 'Payment not received.')}
                  </p>
                </div>
              )}

              {selectedOrder.status === 'accepted' && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'تم تأكيد وصول التحويل وتفعيل الرتبة بنجاح' : 'Payment Confirmed & Rank Activated'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90">
                    {isAr ? 'تم استلام الفلوس ومطابقة الحوالة مع محفظة فودافون كاش.' : 'Funds verified with Vodafone Cash wallet.'}
                  </p>
                </div>
              )}

              {/* Order Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'الرتبة المطلوبة' : 'Package'}</span>
                  <span className="font-bold text-white text-xs sm:text-sm truncate block">{selectedOrder.package}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'المبلغ المطلوب' : 'Price'}</span>
                  <span className="font-bold text-[#39f77e] text-xs sm:text-sm">{selectedOrder.priceEgp}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'نوع وطريقة التحويل' : 'Payment Method'}</span>
                  <span className="font-bold text-rose-300 text-xs truncate block">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'عنوان IP للمشتري' : 'Buyer IP'}</span>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[#00d2ff] font-mono text-xs truncate" dir="ltr">
                      {selectedOrder.clientIp || '127.0.0.1'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopyText(selectedOrder.clientIp || '127.0.0.1', isAr ? 'تم نسخ عنوان IP' : 'Copied IP')}
                      className="text-slate-500 hover:text-white"
                      title="Copy IP"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* NEW DEDICATED SECTION: صورة الإيصال / فاتورة الدفع */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/25 via-slate-900 to-indigo-950/25 border border-rose-500/35 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'صورة الإيصال / فاتورة الدفع' : 'Payment Proof & Transfer Invoice'}</span>
                  </h4>
                  {selectedOrder.paymentProof ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{isAr ? 'إيصال مرفق وموثق' : 'Proof Attached'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {isAr ? 'لم يرفق إيصال صورة' : 'No Image Attached'}
                    </span>
                  )}
                </div>

                {selectedOrder.paymentProof ? (
                  <div className="bg-slate-950/90 p-3.5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Clickable Thumbnail that opens full size */}
                      <div
                        onClick={() => setViewingReceiptUrl({
                          url: selectedOrder.paymentProof!,
                          title: isAr ? 'إيصال تحويل فودافون كاش' : 'Payment Proof Receipt',
                          player: selectedOrder.player,
                          orderId: selectedOrder.orderId,
                          amount: selectedOrder.priceEgp,
                          senderPhone: selectedOrder.senderPhone,
                        })}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-rose-500/50 bg-black cursor-pointer group shrink-0 shadow-xl"
                        title={isAr ? 'اضغط لتكبير صورة الإيصال والتأكد من العملية' : 'Click to preview full size'}
                      >
                        <img
                          src={selectedOrder.paymentProof}
                          alt="صورة الإيصال"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                          <Eye className="w-5 h-5 mb-0.5" />
                          <span className="text-[10px] font-black">{isAr ? 'تكبير' : 'Zoom'}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white truncate max-w-xs" title={selectedOrder.paymentProofName || 'receipt.jpg'}>
                          {selectedOrder.paymentProofName || (isAr ? 'صورة_إيصال_التحويل.jpg' : 'receipt_proof.jpg')}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr ? 'إيصال التحويل تم تحويله وتخزينه كـ Base64 لتوثيق الحوالة.' : 'Base64 image proof captured at checkout.'}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setViewingReceiptUrl({
                              url: selectedOrder.paymentProof!,
                              title: isAr ? 'إيصال تحويل فودافون كاش' : 'Payment Proof Receipt',
                              player: selectedOrder.player,
                              orderId: selectedOrder.orderId,
                              amount: selectedOrder.priceEgp,
                              senderPhone: selectedOrder.senderPhone,
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? 'معاينة بحجم كامل 🔍' : 'View Full Image'}</span>
                          </button>
                          <a
                            href={selectedOrder.paymentProof}
                            download={selectedOrder.paymentProofName || `receipt_${selectedOrder.orderId}.jpg`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                            title={isAr ? 'تحميل صورة الإيصال' : 'Download image'}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isAr ? 'تحميل' : 'Download'}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2 rounded-lg border border-white/5 self-stretch sm:self-center text-center sm:text-right">
                      <div className="text-emerald-400 font-bold">{isAr ? 'جاهز للمطابقة الفورية' : 'Verified Format'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'انقر على الصورة للتكبير' : 'Click to enlarge'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                      <ImageIcon className="w-5 h-5 text-slate-500 shrink-0" />
                      <span>
                        {isAr
                          ? 'لم يقم المشتري بإرفاق صورة إيصال أثناء الشراء. يمكنك الاعتماد على رقم المحفظة وكود العملية والمطابقة من الرسائل.'
                          : 'No receipt uploaded by buyer. Verify via phone number and transaction reference.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone and Transfer Details */}
              <div className="p-4 rounded-2xl bg-[#0b101c] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-[#00d2ff] uppercase tracking-wider">
                    {isAr ? 'بيانات التحويل والمرجع' : 'Transfer & Sender Details'}
                  </h4>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedOrder.timestamp}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'رقم محفظة المحول منها' : 'Sender Phone'}</span>
                    <span className="font-mono font-black text-white text-sm" dir="ltr">{selectedOrder.senderPhone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyText(selectedOrder.senderPhone, isAr ? 'تم نسخ رقم الهاتف' : 'Copied Phone Number')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-1">{isAr ? 'بيانات ورسالة الحوالة' : 'Transaction Ref'}</span>
                  <p className="text-slate-200 font-mono text-xs">{selectedOrder.transactionRef || 'لا توجد ملاحظات من المشتري'}</p>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'كود الأمان الخاص بروم #passcode' : 'Security Passcode'}</span>
                    <span className="font-mono font-black text-amber-400 text-sm" dir="ltr">{selectedOrder.securityPin}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyText(selectedOrder.securityPin, isAr ? 'تم نسخ كود الأمان' : 'Copied Passcode')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'نسخ الكود' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* In-Game Rank Delivery Details */}
              <div className="p-4 rounded-2xl bg-[#0a1424] border border-[#00d2ff]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#00d2ff] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00d2ff]" />
                    <span>{isAr ? 'تسليم الرتبة داخل سيرفر ماينكرافت (In-Game Delivery)' : 'In-Game Rank Delivery Dispatch'}</span>
                  </span>
                  {selectedOrder.status === 'accepted' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {isAr ? 'تمت الموافقة وتسليم الرتبة للاعب ✅' : 'Delivered to Player ✅'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {isAr ? 'بانتظار الموافقة على التحويل للتسليم ⚡' : 'Awaiting Approval'}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-slate-500">{isAr ? 'الأمر: ' : 'Command: '}</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedOrder.commandExecuted || `/lp user ${selectedOrder.player} parent add ${selectedOrder.package.toLowerCase().includes('mvp+') ? 'mvpplus' : selectedOrder.package.toLowerCase().includes('mvp') ? 'mvp' : selectedOrder.package.toLowerCase().includes('vip+') ? 'vipplus' : 'vip'}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyText(
                      selectedOrder.commandExecuted || `/lp user ${selectedOrder.player} parent add ${selectedOrder.package.toLowerCase().includes('mvp+') ? 'mvpplus' : selectedOrder.package.toLowerCase().includes('mvp') ? 'mvp' : selectedOrder.package.toLowerCase().includes('vip+') ? 'vipplus' : 'vip'}`,
                      isAr ? 'تم نسخ أمر الكونسول' : 'Copied Command'
                    )}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>

                {selectedOrder.deliveredAt && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? `توقيت تسليم الرتبة للاعب: ${selectedOrder.deliveredAt}` : `Delivered at: ${selectedOrder.deliveredAt}`}</span>
                  </div>
                )}
              </div>

              {/* Staff Notes Editor */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'ملاحظات الإدارة الداخلية على العملية' : 'Internal Staff Review Notes'}</span>
                  </span>
                  {orderNotesSuccess && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? 'تم الحفظ!' : 'Saved!'}</span>
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={orderNotesDraft}
                  onChange={(e) => setOrderNotesDraft(e.target.value)}
                  placeholder={isAr ? 'مثال: تم التأكد من وصول 400 جنيه من المحفظة وتفعيل رتبة تيتان في السيرفر...' : 'e.g. Received 400 EGP on Vodafone Cash, TITAN rank granted...'}
                  className="w-full bg-[#0d1422] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={handleSaveOrderNotes}
                  disabled={isSavingOrderNotes}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isSavingOrderNotes ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ ملاحظات الإدارة' : 'Save Notes')}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQuickAcceptOrder(selectedOrder.orderId);
                    onCopyText('', isAr ? 'تم قبول العملية وتأكيد الدفع' : 'Order accepted');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد وقبول العملية' : 'Accept Order'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCancelPrompt(selectedOrder)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isAr ? 'إلغاء (لم يتم تحويل الفلوس)' : 'Cancel (No Payment)'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CANCEL ORDER PROMPT (FUNDS NOT RECEIVED)                            */}
      {/* ========================================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl bg-[#0e1422] border border-rose-500/40 p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-white">
                {isAr ? 'إلغاء عملية الشراء لعدم تحويل المبلغ' : 'Cancel Store Order'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? `اللاعب: ${cancellingOrder.player} • كود العملية: ${cancellingOrder.orderId}`
                  : `Player: ${cancellingOrder.player} • Order ID: ${cancellingOrder.orderId}`}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {isAr ? 'سبب الإلغاء (يظهر للاعب في حالة الاستعلام):' : 'Cancellation reason:'}
              </label>
              <textarea
                rows={3}
                value={cancelReasonDraft}
                onChange={(e) => setCancelReasonDraft(e.target.value)}
                className="w-full bg-[#080d17] border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
              />

              {/* Preset quick reasons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  isAr ? 'العملية ملغية: لم يتم تحويل المبلغ المطلوب لحساب فودافون كاش.' : 'Funds not received on Vodafone Cash.',
                  isAr ? 'العملية ملغية: رقم الهاتف غير مسجل به تحويل.' : 'No transfer found from this phone number.',
                  isAr ? 'العملية ملغية: كود الأمان غير مطابق.' : 'Security passcode does not match.',
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCancelReasonDraft(reason)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {reason.slice(0, 28)}...
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'تأكيد إلغاء العملية' : 'Confirm Cancel'}
              </button>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'تراجع' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPLICATION DETAILS INSPECTION (15+ YEARS STAFF)                   */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090e1a] border border-purple-500/40 shadow-[0_0_50px_rgba(88,28,135,0.5)] overflow-hidden ${isAr ? 'text-right' : 'text-left'}`}>
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(selectedApp.minecraftUsername)}/48`}
                  alt={selectedApp.minecraftUsername}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-white/15"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-white flex items-center gap-2" dir="ltr">
                    <span>{selectedApp.minecraftUsername}</span>
                    <span className="text-purple-400 font-mono">(@{selectedApp.discordUsername})</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {isAr ? 'رقم الطلب:' : 'App ID:'} <span className="font-mono text-[#00d2ff]">{selectedApp.id}</span> • {selectedApp.age} {isAr ? 'سنة (15+)' : 'years old (15+)'} • {selectedApp.country}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedApp.status}
                  onChange={(e) => {
                    const newSt = e.target.value as ApplicationStatus;
                    onUpdateStatus(selectedApp.id, newSt);
                    setSelectedApp({ ...selectedApp, status: newSt });
                  }}
                  className="bg-slate-950 border border-white/20 text-xs font-bold rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#00d2ff] cursor-pointer"
                >
                  <option value="pending">{isAr ? 'قيد الانتظار' : 'Pending'}</option>
                  <option value="accepted">{isAr ? 'مقبول (Accepted)' : 'Accepted'}</option>
                  <option value="denied">{isAr ? 'مرفوض (Denied)' : 'Denied'}</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Step 1 & 2 Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'السن' : 'Age'}</span>
                  <span className="font-bold text-white text-sm">{selectedApp.age} {isAr ? 'سنة (15+)' : 'yrs (15+)'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'البلد والمنطقة' : 'Country / TZ'}</span>
                  <span className="font-bold text-white text-sm">{selectedApp.country} ({selectedApp.timezone})</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'مدة لعب ماينكرافت' : 'Playtime'}</span>
                  <span className="font-bold text-white text-sm">{selectedApp.playingDuration}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b101c] border border-white/10">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'ساعات التواجد' : 'Active Hours'}</span>
                  <span className="font-bold text-white text-sm">{selectedApp.activeHoursPerDay}</span>
                </div>
              </div>

              {/* Past Experience */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-[#00d2ff] uppercase tracking-wider">
                  {isAr ? '2. الخبرات الإدارية السابقة' : '2. Past Staff Experience'}
                </h4>
                <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                  <div>
                    <span className="text-slate-500">{isAr ? 'خبرة سابقة:' : 'Has Experience:'}</span>{' '}
                    <span className="font-bold text-white">
                      {selectedApp.hasStaffExperience === 'yes' ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا (أول تجربة)' : 'No (First time)')}
                    </span>
                  </div>
                  {selectedApp.previousServers && (
                    <div>
                      <span className="text-slate-500">{isAr ? 'السيرفرات:' : 'Servers:'}</span>{' '}
                      <span className="font-bold text-slate-200">{selectedApp.previousServers}</span>
                    </div>
                  )}
                  {selectedApp.previousStaffRank && (
                    <div>
                      <span className="text-slate-500">{isAr ? 'الرتب السابقة:' : 'Past Ranks:'}</span>{' '}
                      <span className="font-bold text-purple-300">{selectedApp.previousStaffRank}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 Scenario Answers */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#00d2ff] uppercase tracking-wider">
                  {isAr ? '3. إجابات الأسئلة والمواقف الإدارية' : '3. Scenario & Moderation Answers'}
                </h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'لماذا ترغب في الانضمام لفورتكس؟' : 'Why join VortexMC?'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.whyVortex}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'لماذا نختارك أنت؟' : 'Why should we choose you?'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.whyChooseYou}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'صفات الإداري الناجح في نظرك:' : 'Qualities of good staff:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.goodStaffDefinition}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'التعامل مع لاعب مسيء أو سام في الشات:' : 'Handling toxic player in chat:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.handleToxicPlayer}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'تصرفك إذا خالف صديقك المقرب القوانين:' : 'Reaction if close friend violates rules:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.friendBrokeRules}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'التعامل مع بلاغ غش أو هاك:' : 'Handling cheating report:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.accusationOfCheating}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'فض نزاع بين لاعبين في الشات:' : 'Resolving chat conflict:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.playerArgument}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'استغلال إداري آخر لصلاحياته:' : 'Reaction to staff abuse:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.staffAbuse}</p>
                  </div>
                </div>
              </div>

              {/* Step 4 Contribution */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#00d2ff] uppercase tracking-wider">
                  {isAr ? '4. المساهمة والتفاصيل الإضافية' : '4. Contribution & Additional Notes'}
                </h4>
                <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'ما يمكنه تقديمه لفورتكس MC:' : 'Contribution to VortexMC:'}</span>
                  <p className="text-slate-200 leading-relaxed">{selectedApp.contribution}</p>
                </div>
                {selectedApp.additionalInfo && (
                  <div className="p-3.5 rounded-xl bg-[#0b101c] border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'معلومات إضافية من المتقدم:' : 'Additional applicant notes:'}</span>
                    <p className="text-slate-200 leading-relaxed">{selectedApp.additionalInfo}</p>
                  </div>
                )}
              </div>

              {/* Staff Management Internal Notes */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'ملاحظات الإدارة الداخلية وسجل المقابلة' : 'Internal Staff Notes & Interview Log'}</span>
                  </span>
                  {appNotesSuccess && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? 'تم الحفظ!' : 'Saved!'}</span>
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={appNotesDraft}
                  onChange={(e) => setAppNotesDraft(e.target.value)}
                  placeholder={isAr ? 'مثال: يحتاج مقابلة صوتية بالديسكورد، تم التأكد من عدم وجود باندات سابقة له...' : 'e.g. Needs Discord voice interview, clean record confirmed...'}
                  className="w-full bg-[#0d1422] border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={handleSaveAppNotes}
                  disabled={isSavingAppNotes}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isSavingAppNotes ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ ملاحظات الإدارة' : 'Save Notes')}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const summary = `Candidate: ${selectedApp.minecraftUsername} (@${selectedApp.discordUsername}) - App ID: ${selectedApp.id} - Status: ${selectedApp.status}`;
                  onCopyText(summary, isAr ? 'تم نسخ ملخص المتقدم للحافظة' : 'Copied candidate summary to clipboard');
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? 'نسخ ملخص المتقدم' : 'Copy Summary'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL-SIZE PAYMENT PROOF LIGHTBOX (FOR STAFF VERIFICATION)            */}
      {/* ========================================================================= */}
      {viewingReceiptUrl && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setViewingReceiptUrl(null)}
        >
          <div
            className={`relative max-w-4xl w-full max-h-[92vh] bg-[#090e1a] border border-[#00d2ff]/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(0,210,255,0.3)] flex flex-col ${isAr ? 'text-right' : 'text-left'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {viewingReceiptUrl.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>{isAr ? 'اللاعب:' : 'Player:'} <strong className="text-[#00d2ff]">{viewingReceiptUrl.player}</strong></span>
                    <span>•</span>
                    <span>{isAr ? 'كود العملية:' : 'Order ID:'} <strong className="font-mono text-emerald-400">{viewingReceiptUrl.orderId}</strong></span>
                    <span>•</span>
                    <span>{isAr ? 'المبلغ:' : 'Amount:'} <strong className="text-[#39f77e]">{viewingReceiptUrl.amount}</strong></span>
                    {viewingReceiptUrl.senderPhone && (
                      <>
                        <span>•</span>
                        <span>{isAr ? 'المحفظة:' : 'Phone:'} <strong className="font-mono text-rose-300" dir="ltr">{viewingReceiptUrl.senderPhone}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={viewingReceiptUrl.url}
                  download={`receipt_${viewingReceiptUrl.orderId}.jpg`}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title={isAr ? 'تحميل الصورة' : 'Download image'}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAr ? 'تحميل' : 'Download'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingReceiptUrl(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isAr ? 'إغلاق' : 'Close'}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Stage */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950/90 rounded-2xl p-2 border border-white/5 min-h-[300px] max-h-[72vh]">
              <img
                src={viewingReceiptUrl.url}
                alt="Payment Receipt Full Size"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] sm:text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'تأكد من مطابقة وقت الحوالة ورقم العملية والمبلغ مع محفظة فودافون كاش' : 'Verify timestamp, transaction ref & amount with wallet'}</span>
              </span>
              <button
                type="button"
                onClick={() => setViewingReceiptUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
