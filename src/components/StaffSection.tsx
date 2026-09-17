import React, { useState } from 'react';
import { 
  ShieldCheck, Crown, UserCheck, MessageSquare, Sparkles, 
  ChevronRight, CheckCircle2, Copy, Check, ExternalLink, Headphones
} from 'lucide-react';
import { Language, translations } from '../translations';

interface StaffSectionProps {
  language?: Language;
  onCopyText?: (text: string, message?: string) => void;
  onOpenStaffApply?: () => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({ 
  language = 'ar',
  onCopyText, 
  onOpenStaffApply 
}) => {
  const [copiedUser, setCopiedUser] = useState<string | null>(null);
  const t = translations[language].staff;
  const isAr = language === 'ar';

  const handleCopyUsername = (username: string, roleName: string) => {
    if (onCopyText) {
      onCopyText(username, isAr ? `تم نسخ يوزر ديسكورد (${roleName}): ${username}` : `Copied Discord user (${roleName}): ${username}`);
    } else {
      navigator.clipboard?.writeText(username);
    }
    setCopiedUser(username);
    setTimeout(() => setCopiedUser(null), 2000);
  };

  // Staff and Admin directory
  // el_joker_.: Owner & Store / Payment Manager
  // filstiny_: Owner & General Administration
  const teamMembers = [
    {
      role: 'Owner',
      roleDisplay: isAr ? 'المالك ومسؤول الرتب والدفع' : 'Owner & Payment In-Charge',
      username: 'el_joker_.',
      badgeColor: 'from-amber-500 to-rose-500',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      icon: Crown,
      description: isAr
        ? 'مالك السيرفر والمسؤول عن المتجر والمدفوعات وتفعيل الرتب والشراء'
        : 'Server owner in charge of store, payments, and rank activations.',
      avatarUrl: 'https://mc-heads.net/avatar/Notch/80',
      isPrimaryPayee: true,
      payeeBadge: isAr ? 'مسؤول الرتب والدفع ⭐' : 'Payment Manager ⭐',
    },
    {
      role: 'Owner',
      roleDisplay: isAr ? 'المالك والمسؤول العام' : 'Owner & General Manager',
      username: 'filstiny_',
      badgeColor: 'from-amber-400 to-yellow-500',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      icon: Crown,
      description: isAr
        ? 'مالك السيرفر والمسؤول العام عن إدارة المجتمع والتنظيم وتطوير السيرفر'
        : 'Server owner leading community management, organization, and development.',
      avatarUrl: 'https://mc-heads.net/avatar/Alex/80',
      isPrimaryPayee: false,
      payeeBadge: '',
    },
    {
      role: 'Support Staff',
      roleDisplay: isAr ? 'استاف ودعم فني' : 'Support Staff & Tech',
      username: '_palto_',
      badgeColor: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      icon: Headphones,
      description: isAr
        ? 'مساعدة اللاعبين داخل السيرفر وحل المشاكل التقنية وتذاكر الدعم'
        : 'Assisting in-game players, technical issues, and support tickets.',
      avatarUrl: 'https://mc-heads.net/avatar/Steve/80',
      isPrimaryPayee: false,
      payeeBadge: '',
    },
    {
      role: 'Support Staff',
      roleDisplay: isAr ? 'استاف ومودريتور' : 'Staff & Moderator',
      username: 'sjad__',
      badgeColor: 'from-purple-400 to-indigo-500',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      icon: UserCheck,
      description: isAr
        ? 'مراقبة السيرفر ومساعدة اللاعبين ومتابعة التذاكر'
        : 'Monitoring chat, helping new players, and resolving user tickets.',
      avatarUrl: 'https://mc-heads.net/avatar/Herobrine/80',
      isPrimaryPayee: false,
      payeeBadge: '',
    },
  ];

  const hiringRoles = [
    { title: 'Co-Owner', badge: 'High Responsibility' },
    { title: 'Manager', badge: 'Leadership' },
    { title: 'Game Staff', badge: 'In-Game Support' },
    { title: 'Discord Moderator', badge: 'Community' },
  ];

  return (
    <section id="join" className="py-24 px-4 relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-[1200px] mx-auto space-y-16">
        {/* TEAM & ADMIN DIRECTORY */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 border border-[#00d2ff]/25 bg-[#00d2ff]/[0.08] px-4 py-1.5 rounded-full text-[#00d2ff] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
              {t.title}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamMembers.map((member) => {
              const IconComponent = member.icon;
              const isCopied = copiedUser === member.username;

              return (
                <div
                  key={member.username}
                  className={`relative p-5 sm:p-6 rounded-3xl bg-[#0d1422]/90 border ${member.borderColor} backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,210,255,0.15)] flex flex-col justify-between ${isAr ? 'text-right' : 'text-left'}`}
                >
                  {member.isPrimaryPayee && (
                    <div className={`absolute -top-3 ${isAr ? 'right-5' : 'left-5'} bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md`}>
                      {member.payeeBadge}
                    </div>
                  )}

                  <div>
                    {/* Header with avatar & role */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="relative">
                        <img
                          src={member.avatarUrl}
                          alt={member.username}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 shadow-inner object-cover"
                        />
                        <div className={`absolute -bottom-1 ${isAr ? '-left-1' : '-right-1'} w-4 h-4 rounded-full bg-[#39f77e] border-2 border-[#0d1422]`} title="Active" />
                      </div>

                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${member.textColor} flex items-center gap-1`}>
                          <IconComponent className="w-3.5 h-3.5" />
                          <span>{member.role}</span>
                        </div>
                        <div className="text-xs text-slate-300 font-bold">
                          {member.roleDisplay}
                        </div>
                      </div>
                    </div>

                    {/* Discord Username Box with 1-click Copy */}
                    <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-3 mb-3 flex items-center justify-between">
                      <div className={isAr ? 'text-right' : 'text-left'}>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">{t.discordUser}</span>
                        <span className="font-mono font-bold text-white text-sm tracking-wide" dir="ltr">
                          {member.username}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyUsername(member.username, member.roleDisplay)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-[#39f77e]/20 border-[#39f77e]/50 text-[#39f77e]'
                            : 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                        }`}
                        title={t.copyUser}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                      {member.description}
                    </p>
                  </div>

                  <a
                    href="https://discord.gg/dq36cMFef"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyUsername(member.username, member.roleDisplay)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-[#5865F2] hover:text-white border border-white/10 text-slate-300 text-xs font-bold transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.openTicket}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* HIRING BANNER */}
        <div className={`grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center bg-[#0f1624]/75 border border-[#00d2ff]/20 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-[0_0_35px_rgba(0,162,255,0.12)] ${isAr ? 'text-right' : 'text-left'}`}>
          {/* Copy & Roles */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-[#00d2ff]/20 bg-[#00d2ff]/10 px-3.5 py-1.5 rounded-full text-[#00d2ff] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.hiringBadge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.hiringTitle}
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.hiringDesc}
            </p>

            {/* Roles Chips */}
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                {t.rolesAvailable}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {hiringRoles.map((role) => (
                  <span
                    key={role.title}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#00d2ff]/25 bg-[#00d2ff]/[0.08] text-[#b9ecff] text-xs sm:text-sm font-bold shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>{role.title}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Apply Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {onOpenStaffApply && (
                <button
                  type="button"
                  onClick={onOpenStaffApply}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#00d2ff] via-purple-600 to-[#ec4899] text-white font-extrabold px-7 py-3.5 rounded-xl shadow-[0_0_30px_rgba(0,210,255,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer border border-white/20"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>{t.applyBtn}</span>
                  <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              )}

              <a
                href="https://discord.gg/dq36cMFef"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-[#5865F2] hover:text-white text-slate-300 font-bold px-5 py-3.5 rounded-xl border border-white/10 transition-all text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.ticketBtn}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* Retro Pixel Box */}
          <div className="relative text-center py-12 px-6 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(0,210,255,0.18)_0%,transparent_70%)] border border-white/[0.05] flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d2ff08_1px,transparent_1px),linear-gradient(to_bottom,#00d2ff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

            <div className="font-pixel text-[#00d2ff] text-2xl sm:text-3xl leading-relaxed tracking-widest text-cyan-glow drop-shadow-[0_0_20px_rgba(0,210,255,0.6)] z-10 select-none">
              JOIN<br />
              OUR<br />
              TEAM
            </div>

            <div className="mt-4 text-[11px] font-mono text-slate-400 z-10 flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#39f77e] animate-ping" />
              <span>{isAr ? 'مراجعة يومية لطلبات التقديم (15 سنة فما فوق 15+)' : 'Daily review of applications (15+ Years Old)'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
