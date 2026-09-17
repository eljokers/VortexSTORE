import React, { useState, useEffect, useCallback } from 'react';
import { StaffApplyHero } from './StaffApplyHero';
import { StaffApplicationForm } from './StaffApplicationForm';
import { StaffAdminPanel } from './StaffAdminPanel';
import { ApplicationTrackerModal } from './ApplicationTrackerModal';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Language } from '../../translations';
import { ServerStatusData, StaffApplication, ApplicationStatus, StoreOrder, OrderStatus } from '../../types';
import { 
  fetchOrders, 
  sanitizeOrders, 
  updateOrderStatusApi, 
  updateOrderNotesApi, 
  deleteOrderApi, 
  cleanMockOrdersApi, 
  archiveOrderApi,
  submitOrder,
  fetchApplications,
  sanitizeApplications,
  submitApplication,
  updateApplicationStatusApi,
  updateApplicationNotesApi,
  deleteApplicationApi,
  archiveApplicationApi,
  cleanMockApplicationsApi
} from '../../services/api';
import { ArrowLeft, ArrowRight, Shield, Sparkles, Lock, MessageSquare, ExternalLink, FileText } from 'lucide-react';

interface StaffApplyPortalProps {
  serverIp: string;
  status: ServerStatusData;
  copied: boolean;
  onCopyIp: () => void;
  onCopyText: (text: string, msg?: string) => void;
  onCloseToHome: () => void;
  language?: Language;
  onToggleLanguage?: (lang: Language) => void;
}

export const StaffApplyPortal: React.FC<StaffApplyPortalProps> = ({
  serverIp,
  status,
  copied,
  onCopyIp,
  onCopyText,
  onCloseToHome,
  language = 'en',
  onToggleLanguage,
}) => {
  // Current view: 'apply' (Hero + Form) or 'admin' (Staff Dashboard)
  const [activeTab, setActiveTab] = useState<'apply' | 'admin'>('apply');
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const isAr = language === 'ar';
  
  // Applications state loaded from localStorage and backend (cleaned of mock data)
  const [applications, setApplications] = useState<StaffApplication[]>(() => {
    try {
      const saved = localStorage.getItem('vortex_staff_applications_ar_v1');
      if (saved) {
        return sanitizeApplications(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved applications', e);
    }
    return [];
  });

  const loadRealApplications = useCallback(async () => {
    try {
      const list = await fetchApplications();
      setApplications(list);
    } catch (err) {
      console.error('Error fetching real applications:', err);
    }
  }, []);

  // Store Orders state loaded from localStorage and API (cleaned of mock data)
  const [orders, setOrders] = useState<StoreOrder[]>(() => {
    try {
      const saved = localStorage.getItem('vortex_orders');
      if (saved) {
        return sanitizeOrders(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved orders', e);
    }
    return [];
  });

  const loadRealOrders = useCallback(async () => {
    try {
      const list = await fetchOrders();
      setOrders(list);
    } catch (err) {
      console.error('Error fetching real orders:', err);
    }
  }, []);

  // Save applications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vortex_staff_applications_ar_v1', JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to save applications to localStorage', e);
    }
  }, [applications]);

  // Fetch real data from backend on mount and sync on custom/storage events
  useEffect(() => {
    loadRealOrders();
    loadRealApplications();

    const handleSync = () => {
      loadRealOrders();
      loadRealApplications();
    };

    window.addEventListener('vortex_order_created', handleSync);
    window.addEventListener('vortex_orders_updated', handleSync);
    window.addEventListener('vortex_application_submitted', handleSync);
    window.addEventListener('vortex_applications_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('vortex_order_created', handleSync);
      window.removeEventListener('vortex_orders_updated', handleSync);
      window.removeEventListener('vortex_application_submitted', handleSync);
      window.removeEventListener('vortex_applications_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadRealOrders, loadRealApplications]);

  const handleApplicationSubmit = async (newApp: StaffApplication) => {
    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
    await submitApplication(newApp);
    onCopyText(
      newApp.id,
      isAr ? `تم إرسال طلب التقديم للإدارة بنجاح! رقم طلبك: ${newApp.id}` : `Application #${newApp.id} received!`
    );
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    const reviewedAt = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    const now = Date.now();
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: newStatus,
              reviewedBy: 'filstiny_ (Owner)',
              reviewedAt,
              reviewedTimestamp: now,
              archived: false,
            }
          : app
      )
    );
    await updateApplicationStatusApi(id, newStatus, undefined, 'filstiny_ (Owner)');
    const statusText = isAr
      ? (newStatus === 'accepted' ? 'مقبول ✅' : newStatus === 'denied' ? 'مرفوض ❌' : 'قيد المراجعة ⏳')
      : (newStatus === 'accepted' ? 'Accepted' : newStatus === 'denied' ? 'Denied' : 'Pending');
    onCopyText('', isAr ? `تم تحديث حالة الطلب إلى: ${statusText}` : `Status updated to: ${statusText}`);
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, notes } : app))
    );
    await updateApplicationNotesApi(id, notes);
  };

  const handleDeleteApplication = async (id: string) => {
    const confirmMsg = isAr
      ? 'هل أنت متأكد من رغبتك في حذف طلب التقديم هذا نهائياً؟'
      : 'Are you sure you want to permanently delete this application?';
    if (window.confirm(confirmMsg)) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
      await deleteApplicationApi(id);
      onCopyText('', isAr ? 'تم حذف الطلب بنجاح' : 'Application deleted successfully');
    }
  };

  const handleCleanMockApplications = async () => {
    await cleanMockApplicationsApi();
    await loadRealApplications();
    onCopyText('', isAr ? 'تم تنظيف كافة طلبات التقديم الوهمية بنجاح' : 'Mock applications removed successfully');
  };

  // STORE ORDER HANDLERS
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
    const formattedReason =
      newStatus === 'cancelled'
        ? reason ||
          (isAr
            ? 'العملية ملغية: لم يتم تحويل المبلغ المطلوب لحساب فودافون كاش الخاص بالسيرفر.'
            : 'Order cancelled: Payment was not received on Vodafone Cash.')
        : undefined;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.orderId === orderId) {
          return {
            ...order,
            status: newStatus,
            cancellationReason: formattedReason,
            reviewedBy: 'el_joker_. (Owner)',
            reviewedAt: new Date().toLocaleString(),
          };
        }
        return order;
      })
    );

    const updated = await updateOrderStatusApi(orderId, newStatus, formattedReason, undefined, 'el_joker_. (Owner)');
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
    } else {
      await loadRealOrders();
    }

    const msg = isAr
      ? newStatus === 'accepted'
        ? '⚡ تم تأكيد الدفع وإعطاء الرتبة للاعب في السيرفر تلقائياً وتفعيلها!'
        : newStatus === 'cancelled'
        ? 'تم إلغاء العملية: لم يتم تحويل الفلوس ❌'
        : 'تم تحويل حالة العملية إلى قيد التحقق ⏳'
      : newStatus === 'accepted'
      ? 'Order accepted & rank delivered in-game ✅'
      : newStatus === 'cancelled'
      ? 'Order cancelled: funds not received ❌'
      : 'Order marked pending ⏳';
    onCopyText('', msg);
  };

  const handleUpdateOrderNotes = async (orderId: string, notes: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.orderId === orderId ? { ...order, staffNotes: notes } : order))
    );
    await updateOrderNotesApi(orderId, notes);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmMsg = isAr
      ? 'هل أنت متأكد من رغبتك في حذف سجل هذه المعاملة؟'
      : 'Are you sure you want to delete this order record?';
    if (window.confirm(confirmMsg)) {
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
      await deleteOrderApi(orderId);
      onCopyText('', isAr ? 'تم حذف العملية من السجل' : 'Order deleted successfully');
    }
  };

  const handleAddOrder = async (newOrder: StoreOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    await submitOrder(newOrder);
    onCopyText(
      newOrder.orderId,
      isAr ? `تمت إضافة عملية الشراء (${newOrder.player}) بنجاح!` : `New order for ${newOrder.player} added!`
    );
  };

  const handleCleanMockOrders = async () => {
    await cleanMockOrdersApi();
    const refreshed = await fetchOrders();
    setOrders(refreshed);
    onCopyText('', isAr ? 'تم تنظيف كافة العمليات الوهمية بنجاح' : 'Mock orders removed successfully');
  };

  const handleArchiveOrder = async (orderId: string, archived: boolean) => {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, archived } : o)));
    await archiveOrderApi(orderId, archived);
    onCopyText(
      '',
      isAr
        ? (archived ? 'تم نقل الطلب إلى سجل المقبول والمرفوض (الأرشيف الدائم) 📁' : 'تمت استعادة الطلب إلى قائمة العمل النشطة ⚡')
        : (archived ? 'Moved to archive' : 'Restored to active queue')
    );
  };

  const handleArchiveApplication = async (id: string, archived: boolean) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, archived } : a)));
    await archiveApplicationApi(id, archived);
    onCopyText(
      '',
      isAr
        ? (archived ? 'تم نقل طلب التقديم إلى سجل المقبول والمرفوض (الأرشيف الدائم) 📁' : 'تمت استعادة الطلب إلى قائمة العمل النشطة ⚡')
        : (archived ? 'Moved to archive' : 'Restored to active queue')
    );
  };

  const handleScrollToForm = () => {
    document.getElementById('staff-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-[#00d2ff]/30 selection:text-[#00d2ff] relative" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Floating Side Language Switcher */}
      {onToggleLanguage && (
        <LanguageSwitcher
          language={language}
          onToggleLanguage={onToggleLanguage}
          position="floating-side"
        />
      )}

      {/* Top Portal Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#050811]/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Back to Main Server Site */}
          <button
            type="button"
            onClick={onCloseToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-[#00d2ff] transition-colors cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 group-hover:bg-[#00d2ff]/10 border border-white/10 group-hover:border-[#00d2ff]/30 flex items-center justify-center transition-colors">
              {isAr ? (
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00d2ff]" />
              ) : (
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#00d2ff]" />
              )}
            </div>
            <span className="hidden sm:inline">{isAr ? 'العودة للموقع الرئيسي' : 'Back to Home'}</span>
          </button>

          {/* Center Brand */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00d2ff]" />
            <span className="font-black text-sm tracking-wider text-white uppercase font-mono">
              VORTEX <span className="text-[#a855f7]">STAFF</span>
            </span>
          </div>

          {/* Switch between Application View & Admin Panel + Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Inline Language Switcher */}
            {onToggleLanguage && (
              <LanguageSwitcher
                language={language}
                onToggleLanguage={onToggleLanguage}
                position="inline"
              />
            )}

            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'apply'
                    ? 'bg-gradient-to-r from-[#00d2ff] to-purple-600 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'نموذج التقديم' : 'Apply Form'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{isAr ? 'لوحة الإدارة' : 'Admin Panel'}</span>
              </button>
            </div>

            <a
              href="https://discord.gg/dq36cMFef"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isAr ? 'تذكرة الديسكورد' : 'Discord Ticket'}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'apply' ? (
          <div>
            {/* Landing Hero */}
            <StaffApplyHero
              serverIp={serverIp}
              status={status}
              copied={copied}
              onCopyIp={onCopyIp}
              onApplyClick={handleScrollToForm}
              onOpenAdmin={() => setActiveTab('admin')}
              onTrackClick={() => setIsTrackerOpen(true)}
              language={language}
            />

            {/* Multi-Step Staff Application Form */}
            <StaffApplicationForm
              onApplicationSubmit={handleApplicationSubmit}
              onBackToHome={onCloseToHome}
              onCopyText={onCopyText}
              language={language}
            />
          </div>
        ) : (
          /* Staff Management Admin Panel */
          <StaffAdminPanel
            applications={applications}
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onDeleteApplication={handleDeleteApplication}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateOrderNotes={handleUpdateOrderNotes}
            onDeleteOrder={handleDeleteOrder}
            onAddOrder={handleAddOrder}
            onRefreshOrders={loadRealOrders}
            onCleanMockOrders={handleCleanMockOrders}
            onRefreshApplications={loadRealApplications}
            onCleanMockApplications={handleCleanMockApplications}
            onArchiveOrder={handleArchiveOrder}
            onArchiveApplication={handleArchiveApplication}
            onBackToPortal={() => setActiveTab('apply')}
            onCopyText={onCopyText}
            language={language}
          />
        )}
      </main>

      {/* Application Tracker Modal */}
      <ApplicationTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onCopyText={onCopyText}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 bg-[#03060c]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-300">VORTEX MC</span>
            <span>
              {isAr
                ? '• نظام تقديم الإدارة الرسمي © 2026 (السن 15 سنة فما فوق 15+)'
                : '• Official Staff Application System © 2026 (Age 15+ Years Old)'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="text-[#00d2ff] hover:underline transition-colors cursor-pointer"
            >
              {isAr ? 'تتبع حالة طلبي' : 'Track Application'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              {isAr ? 'لوحة الإدارة' : 'Admin Panel'}
            </button>
            <a
              href="https://discord.gg/dq36cMFef"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#00d2ff] transition-colors"
            >
              {isAr ? 'ديسكورد التقديم (#apply-staff)' : 'Staff Discord (#apply-staff)'}
            </a>
            <button
              type="button"
              onClick={onCloseToHome}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'المتجر والسيرفر' : 'Store & Server'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
