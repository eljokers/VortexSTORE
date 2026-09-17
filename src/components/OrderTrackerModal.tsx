import React, { useState, useEffect } from 'react';
import { 
  X, Search, Clock, CheckCircle2, XCircle, ShieldCheck, 
  Copy, ExternalLink, RefreshCw, Hash, User, Phone, 
  AlertCircle, Sparkles, ShoppingCart, Lock
} from 'lucide-react';
import { StoreOrder } from '../types';
import { fetchOrders } from '../services/api';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, message?: string) => void;
  onOpenCheckout?: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  onCopyText,
  onOpenCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setAllOrders(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      // Pre-fill search query with saved player IGN if present
      const savedIgn = localStorage.getItem('vortex_mc_ign');
      if (savedIgn && !searchQuery) {
        setSearchQuery(savedIgn);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter orders based on search query
  const q = searchQuery.trim().toLowerCase();
  const filteredOrders = allOrders.filter((order) => {
    if (!q) return true;
    return (
      order.orderId.toLowerCase().includes(q) ||
      order.player.toLowerCase().includes(q) ||
      order.senderPhone.toLowerCase().includes(q) ||
      order.securityPin.toLowerCase().includes(q) ||
      order.package.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string, label: string) => {
    onCopyText(text, `تم نسخ ${label}: ${text}`);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div 
        className="relative w-full max-w-2xl bg-[#0b101b] border border-[#00d2ff]/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,210,255,0.22)] text-white my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d2ff]/20 to-[#0080ff]/10 border border-[#00d2ff]/30 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6 text-[#00d2ff]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider flex items-center gap-1.5">
              <span>سجل المشتريات الحقيقي • Live Orders Tracker</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              متابعة وتتبع طلبات الشراء
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              تأكد من وصول طلبك وحالة تفعيله في السيرفر عبر كود العملية أو اسم حسابك في ماينكرافت.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم حسابك (IGN) أو كود العملية (مثال: Steve أو VTX-VC-...)"
              className="w-full bg-[#121c2e] border border-white/10 focus:border-[#00d2ff] rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
            />
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00d2ff]' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>

        {/* Orders List Container */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {isLoading && allOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#00d2ff]" />
              <p className="text-xs">جاري تحميل العمليات الحقيقية من السيرفر...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#0e1626]/60 border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                {searchQuery ? 'لم يتم العثور على طلبات مطابقة للبحث' : 'لا توجد عمليات شراء مسجلة حالياً'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'يرجى التأكد من كتابة اسم حسابك أو كود العملية بشكل صحيح، أو اضغط زر تحديث.'
                  : 'كل عملية شراء جديدة تتم عبر فودافون كاش أو المتجر تظهر هنا فوراً وبشكل حقيقي.'}
              </p>
              {onOpenCheckout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 text-xs font-black transition-all hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تصفح الرتب والشراء الآن</span>
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPending = order.status === 'pending';
              const isAccepted = order.status === 'accepted';
              const isCancelled = order.status === 'cancelled';

              return (
                <div
                  key={order.orderId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : isAccepted
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>قيد المراجعة والتحقق</span>
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تم التأكيد والتفعيل بنجاح ✅</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300">
                          <XCircle className="w-3 h-3" />
                          <span>عملية ملغية</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{order.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-slate-400">كود العملية:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.orderId, 'كود العملية')}
                        className="inline-flex items-center gap-1 text-[#00d2ff] bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 px-2 py-0.5 rounded border border-[#00d2ff]/30 font-bold transition-colors cursor-pointer"
                        title="نسخ كود العملية"
                      >
                        <span>{order.orderId}</span>
                        <Copy className="w-3 h-3 opacity-70" />
                      </button>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                    <div>
                      <div className="text-slate-400 mb-0.5">اسم اللاعب (IGN):</div>
                      <div className="font-mono font-bold text-white text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>{order.player}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded uppercase">
                          {order.platform}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-0.5">الرتبة / الباقة:</div>
                      <div className="font-extrabold text-white text-sm flex items-center justify-between">
                        <span className="text-emerald-400">{order.package}</span>
                        <span className="font-mono text-xs text-[#39f77e] bg-slate-900 px-2 py-0.5 rounded">
                          {order.priceEgp}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-0.5">رقم الهاتف المحول منه:</div>
                      <div className="font-mono text-slate-200 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-rose-400" />
                        <span>{order.senderPhone || 'غير محدد'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-0.5">كود الأمان لروم #passcode:</div>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.securityPin, 'كود الأمان')}
                        className="inline-flex items-center gap-1 font-mono font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded border border-amber-500/30 transition-colors cursor-pointer"
                        title="اضغط لنسخ كود الأمان"
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>{order.securityPin}</span>
                        <Copy className="w-3 h-3 opacity-60" />
                      </button>
                    </div>
                  </div>

                  {/* Staff Notes or Cancellation Reason */}
                  {order.staffNotes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#00d2ff]">ملاحظات الإدارة: </strong>
                        <span>{order.staffNotes}</span>
                      </div>
                    </div>
                  )}

                  {order.cancellationReason && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-300">سبب الإلغاء: </strong>
                        <span>{order.cancellationReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Link to Discord #passcode */}
                  {isPending && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400">
                        للتسريع: أرسل الكود <strong className="text-amber-300 font-mono">{order.securityPin}</strong> في روم #passcode
                      </span>
                      <a
                        href="https://discord.gg/vUCeFXeUH"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#00d2ff] hover:underline font-bold"
                      >
                        <span>فتح روم #passcode في ديسكورد</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#39f77e]" />
            <span>سجل مباشر مربوط بسيرفر VortexMC بدون أي بيانات وهمية.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
