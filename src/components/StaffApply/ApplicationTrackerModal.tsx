import React, { useState, useEffect } from 'react';
import { 
  Search, X, RefreshCw, FileText, CheckCircle2, Clock, XCircle, 
  User, MessageSquare, ShieldCheck, Copy, Check, ExternalLink, Sparkles 
} from 'lucide-react';
import { StaffApplication } from '../../types';
import { fetchApplications } from '../../services/api';
import { Language } from '../../translations';

interface ApplicationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, message?: string) => void;
  language?: Language;
}

export const ApplicationTrackerModal: React.FC<ApplicationTrackerModalProps> = ({
  isOpen,
  onClose,
  onCopyText,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications for tracker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApps();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = searchQuery.trim().toLowerCase();
  const filtered = applications.filter((app) => {
    if (!q) return true;
    return (
      app.minecraftUsername.toLowerCase().includes(q) ||
      app.discordUsername.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string, label: string) => {
    onCopyText(text, isAr ? `تم نسخ ${label}` : `Copied ${label}`);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-purple-500/30 p-6 sm:p-7 shadow-[0_0_60px_rgba(168,85,247,0.25)] relative max-h-[90vh] flex flex-col"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          title={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#00d2ff]/15 border border-purple-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{isAr ? 'متابعة طلبات الإدارة الحقيقية • Live Staff Tracker' : 'Live Staff Tracker'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isAr ? 'تتبع حالة طلب التقديم في الإدارة' : 'Track Application Status'}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {isAr
                ? 'استعلم عن حالة قبولك أو مراجعة طلبك باسم حسابك بماينكرافت أو الديسكورد أو رقم طلبك.'
                : 'Search your application status using your Minecraft IGN, Discord, or Application ID.'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسمك في ماينكرافت، يوزر الديسكورد، أو رقم الطلب...' : 'Search by IGN, Discord, or ID (e.g. VTX-APP-...)'}
              className={`w-full bg-[#121c2e] border border-white/10 focus:border-purple-400 rounded-xl ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono`}
            />
          </div>

          <button
            type="button"
            onClick={loadApps}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            title={isAr ? 'تحديث البيانات من السيرفر' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span className="hidden sm:inline">{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>

        {/* Applications List Container */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {isLoading && applications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
              <p className="text-xs">{isAr ? 'جاري استرجاع الطلبات من السيرفر...' : 'Loading applications...'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#0e1626]/60 border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-200">
                {searchQuery
                  ? (isAr ? 'لم نجد أي طلب تقديم يطابق هذا البحث' : 'No matching application found')
                  : (isAr ? 'لا توجد طلبات تقديم مسجلة في السيرفر حالياً' : 'No applications registered yet')}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? 'تأكد من إدخال اسم حسابك في ماينكرافت بشكل صحيح أو قدّم طلبك الآن عبر نموذج التقديم.'
                  : 'Make sure your Minecraft IGN is typed correctly or submit an application today.'}
              </p>
            </div>
          ) : (
            filtered.map((app) => {
              const isAccepted = app.status === 'accepted';
              const isPending = app.status === 'pending';
              const isDenied = app.status === 'denied';

              return (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-[#101826]/90 border border-white/10 hover:border-purple-500/40 transition-all space-y-3"
                >
                  {/* Status header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>{isAr ? 'طلبك قيد المراجعة والتدقيق ⏳' : 'Under Review'}</span>
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAr ? 'مقبول للانضمام للإدارة ✅' : 'Accepted for Staff!'}</span>
                        </span>
                      )}
                      {isDenied && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300">
                          <XCircle className="w-3 h-3" />
                          <span>{isAr ? 'طلب مرفوض ❌' : 'Denied'}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{app.submittedAt}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-slate-400">{isAr ? 'رقم الطلب:' : 'App ID:'}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(app.id, isAr ? 'رقم الطلب' : 'App ID')}
                        className="inline-flex items-center gap-1 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-bold transition-colors cursor-pointer"
                        title={isAr ? 'نسخ رقم الطلب' : 'Copy'}
                      >
                        <span>{app.id}</span>
                        {copiedId === app.id ? <Check className="w-3 h-3 text-[#39f77e]" /> : <Copy className="w-3 h-3 opacity-70" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <div className="text-slate-400 mb-0.5">{isAr ? 'اسم اللاعب (IGN):' : 'Minecraft IGN:'}</div>
                      <div className="font-mono font-bold text-white flex items-center gap-1.5" dir="ltr">
                        <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>{app.minecraftUsername}</span>
                        <span className="text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded">
                          {isAr ? `${app.age} سنة` : `${app.age} y/o`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-0.5">{isAr ? 'حساب الديسكورد:' : 'Discord:'}</div>
                      <div className="font-mono text-indigo-300 flex items-center gap-1.5" dir="ltr">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{app.discordUsername}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-0.5">{isAr ? 'الدولة والتوقيت:' : 'Country & Timezone:'}</div>
                      <div className="text-slate-200">
                        {app.country} • <span className="font-mono text-slate-400">{app.timezone}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-0.5">{isAr ? 'النشاط اليومي المقترح:' : 'Daily Active Hours:'}</div>
                      <div className="text-slate-200 font-medium">
                        {app.activeHoursPerDay}
                      </div>
                    </div>
                  </div>

                  {/* Status Banner Message */}
                  {isAccepted && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isAr ? 'تهانينا! تمت الموافقة على طلبك للانضمام لطاقم الإدارة' : 'Congratulations! Application Accepted'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                        {isAr
                          ? 'يرجى التوجه لديسكورد السيرفر والتواصل مع الإدارة أو فتح تذكرة دعم لتحديد موعد المقابلة الصوتية وتفعيل رتبتك التجريبية (Trial Helper).'
                          : 'Please join our Discord server and open a ticket to schedule your interview and receive your trial staff role.'}
                      </p>
                      <div className="pt-1">
                        <a
                          href="https://discord.gg/dq36cMFef"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#00d2ff] hover:underline font-bold text-[11px]"
                        >
                          <span>{isAr ? 'فتح ديسكورد السيرفر الآن' : 'Join Vortex Discord'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>{isAr ? 'ملاحظة: ' : 'Note: '}</strong>
                        <span>
                          {isAr
                            ? 'طلبك مسجل في قائمة الانتظار وستتم مراجعته بواسطة المالكين el_joker_. و filstiny_ في أقرب وقت.'
                            : 'Your application is in queue and will be reviewed shortly by server leadership.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {app.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-purple-300">{isAr ? 'ملاحظات الإدارة: ' : 'Staff Notes: '}</strong>
                        <span>{app.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>{isAr ? `عدد الطلبات المسجلة: ${applications.length}` : `Total Applications: ${applications.length}`}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
