import React from 'react';
import { 
  ShieldCheck, Users, Globe, Zap, Sparkles, ArrowUp, Copy, 
  Check, Lock, Shield, UserCheck, ChevronRight, FileText 
} from 'lucide-react';
import { ServerStatusData } from '../../types';
import { Language } from '../../translations';

interface StaffApplyHeroProps {
  serverIp: string;
  status: ServerStatusData;
  copied: boolean;
  onCopyIp: () => void;
  onApplyClick: () => void;
  onOpenAdmin: () => void;
  onTrackClick?: () => void;
  language?: Language;
}

export const StaffApplyHero: React.FC<StaffApplyHeroProps> = ({
  serverIp,
  status,
  copied,
  onCopyIp,
  onApplyClick,
  onOpenAdmin,
  onTrackClick,
  language = 'en',
}) => {
  const isAr = language === 'ar';

  return (
    <div className="relative pt-12 pb-16 px-4 sm:px-6 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background ambient lighting - Deep purple & electric blue */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#7928ca]/25 via-[#581c87]/30 to-[#00d2ff]/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#00d2ff]/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Network & Role pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
          <span>
            {isAr
              ? 'بوابة التقديم الرسمية لإدارة سيرفر فورتكس • موسم 2026'
              : 'Official VortexMC Staff Application Portal • Season 2026'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#39f77e] animate-pulse" />
        </div>

        {/* Big VORTEX MC Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(0,210,255,0.3)] mb-2">
          VORTEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#a855f7] to-[#ec4899]">MC</span>
        </h1>

        {/* Small subtitle: STAFF APPLICATION */}
        <div className="inline-block font-mono font-black text-sm sm:text-base md:text-lg tracking-widest text-[#00d2ff] uppercase border-y border-[#00d2ff]/30 py-1.5 px-6 my-3 bg-[#00d2ff]/[0.04]">
          {isAr ? 'تقديم طلب انضمام لطاقم الإدارة (STAFF APPLY)' : 'JOIN THE VORTEX STAFF TEAM'}
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-slate-300 max-w-2xl mx-auto mt-4 mb-4 leading-relaxed">
          {isAr
            ? '«انضم إلى فريق إدارة فورتكس وساهم في بناء مجتمع ماينكرافت عادل وممتع.»'
            : '"Join the VortexMC staff team and help build a fair, friendly, and competitive Minecraft community."'}
        </p>

        {/* Age limit badge highlight (15+ Years Old and Above - NOT less) */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs sm:text-sm font-black mb-8 shadow-sm">
          <span>{isAr ? '⚠️ شرط السن للتقديم:' : '⚠️ Age Requirement:'}</span>
          <span className="bg-gradient-to-r from-[#00d2ff] to-purple-500 text-slate-950 px-2.5 py-0.5 rounded-md font-black">
            {isAr ? '15 سنة فما فوق (15+ Years) • يُمنع أقل من 15' : '15+ Years or Older (Must be at least 15)'}
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            type="button"
            onClick={onApplyClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00d2ff] via-[#7928ca] to-[#a855f7] text-white font-black text-base tracking-wide shadow-[0_0_35px_rgba(0,210,255,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer border border-white/20"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>{isAr ? 'قدّم الآن (15 سنة فما فوق)' : 'Apply Now (15+ Years Old)'}</span>
            <ArrowUp className="w-4 h-4 animate-bounce text-[#00d2ff]" />
          </button>

          {onTrackClick && (
            <button
              type="button"
              onClick={onTrackClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-[#00d2ff]/40 text-[#00d2ff] hover:text-white font-bold text-sm tracking-wide transition-all backdrop-blur-md hover:shadow-[0_0_25px_rgba(0,210,255,0.25)] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#00d2ff]" />
              <span>{isAr ? 'تتبع حالة طلبي' : 'Track Application'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 text-purple-300 hover:text-white font-bold text-sm tracking-wide transition-all backdrop-blur-md hover:border-purple-500/60 shadow-lg cursor-pointer"
          >
            <Lock className="w-4 h-4 text-purple-400" />
            <span>{isAr ? 'لوحة تحكم الإدارة (Staff Dashboard)' : 'Staff Dashboard'}</span>
          </button>
        </div>

        {/* Server information cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Server IP */}
          <div 
            onClick={onCopyIp}
            className={`group relative p-4 rounded-2xl bg-slate-950/70 border border-[#00d2ff]/20 hover:border-[#00d2ff]/60 backdrop-blur-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(0,210,255,0.2)] ${
              isAr ? 'text-right' : 'text-left'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/10 flex items-center justify-center text-[#00d2ff] border border-[#00d2ff]/25">
                <Globe className="w-4 h-4" />
              </div>
              <button 
                type="button" 
                aria-label="Copy server IP"
                className="text-slate-500 group-hover:text-[#00d2ff] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-[#39f77e]" /> : <Copy className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'عنوان الآيبي (Server IP)' : 'Server IP'}
            </div>
            <div className="font-mono font-black text-sm text-white truncate" dir="ltr">{serverIp}</div>
            <div className="text-[10px] text-[#00d2ff] font-medium mt-1">
              {copied
                ? (isAr ? '✓ تم النسخ بنجاح!' : '✓ Copied!')
                : (isAr ? 'انقر لنسخ الآيبي' : 'Click to copy IP')}
            </div>
          </div>

          {/* Card 2: Players Online */}
          <div className={`p-4 rounded-2xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-500/50 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] ${
            isAr ? 'text-right' : 'text-left'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/25">
                <Users className="w-4 h-4" />
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39f77e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39f77e]" />
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'اللاعبين المتصلين' : 'Online Players'}
            </div>
            <div className="font-mono font-black text-sm text-white" dir="ltr">
              {status.loading ? (isAr ? 'جاري الفحص...' : 'Checking...') : `${status.playersNow} / ${status.playersMax}`}
            </div>
            <div className="text-[10px] text-purple-400 font-medium mt-1">
              {status.online
                ? (isAr ? 'مجتمع نشط ومستمر' : 'Active Community')
                : (isAr ? 'السيرفر يعمل أونلاين' : 'Server Online')}
            </div>
          </div>

          {/* Card 3: Staff Team */}
          <div className={`p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(57,247,126,0.2)] ${
            isAr ? 'text-right' : 'text-left'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                {isAr ? 'متاح الآن' : 'Open'}
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'فريق الإدارة' : 'Staff Openings'}
            </div>
            <div className="font-mono font-black text-sm text-white">
              {isAr ? 'متاح 4 مقاعد (15+ سنة)' : '4 Positions (15+ yrs)'}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-1">
              {isAr ? 'التقديم مفتوح حالياً' : 'Accepting Applications'}
            </div>
          </div>

          {/* Card 4: Network Status */}
          <div className={`p-4 rounded-2xl bg-slate-950/70 border border-sky-500/20 hover:border-sky-500/50 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(14,165,233,0.2)] ${
            isAr ? 'text-right' : 'text-left'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/25">
                <Zap className="w-4 h-4" />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#39f77e]" />
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'حالة الشبكة' : 'Network Health'}
            </div>
            <div className="font-mono font-black text-sm text-[#39f77e]">
              {isAr ? 'مستقرة 100%' : '100% Stable'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              {isAr ? 'جاهز للاتصال 24/7' : '24/7 Uptime'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
