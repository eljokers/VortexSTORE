import React, { useState } from 'react';
import { 
  Shield, Settings, MessageSquare, Volume2, Hammer, 
  Copy, Check, ExternalLink, HelpCircle, Sparkles, Terminal
} from 'lucide-react';
import { Language, translations, RAW_DISCORD_RULES_TEXT } from '../translations';

interface RulesSectionProps {
  language?: Language;
  onCopyText?: (text: string, message?: string) => void;
}

export const RulesSection: React.FC<RulesSectionProps> = ({ 
  language = 'ar', 
  onCopyText 
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showRawPrompt, setShowRawPrompt] = useState(false);
  const t = translations[language].rules;
  const isAr = language === 'ar';

  const handleCopyDiscordPrompt = () => {
    if (onCopyText) {
      onCopyText(RAW_DISCORD_RULES_TEXT, isAr ? 'تم نسخ برومبت قوانين الديسكورد بنجاح!' : 'Discord rules prompt copied!');
    } else {
      navigator.clipboard?.writeText(RAW_DISCORD_RULES_TEXT);
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(null as any), 2200);
  };

  return (
    <section id="rules" className="py-24 px-4 relative bg-[#070b14]/80" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#00d2ff]/[0.05] rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border border-[#00d2ff]/25 bg-[#00d2ff]/[0.08] px-4 py-1.5 rounded-full text-[#00d2ff] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
            {t.title}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Discord Rules Prompt Copy Banner */}
        <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0e172a] via-[#0d1424] to-[#090e18] border-2 border-[#00d2ff]/40 shadow-[0_0_40px_rgba(0,210,255,0.15)] overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00d2ff]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/20 px-3 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Discord Rules Ready Prompt • برومبت جاهز للديسكورد</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isAr ? '📜 برومبت قوانين سيرفر الديسكورد (جاهز للنسخ والنشر)' : '📜 Discord Server Rules Prompt (Ready to Copy)'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                {t.discordPromptDesc}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyDiscordPrompt}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:shadow-[0_0_35px_rgba(0,210,255,0.6)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>{t.copiedPromptBtn}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{t.copyPromptBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowRawPrompt(!showRawPrompt)}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>{showRawPrompt ? (isAr ? 'إخفاء النص الخام' : 'Hide Raw Text') : (isAr ? 'عرض النص الخام' : 'View Raw Text')}</span>
              </button>
            </div>
          </div>

          {/* Collapsible raw text view */}
          {showRawPrompt && (
            <div className="mt-6 pt-5 border-t border-white/10 animate-fadeIn">
              <div className="bg-[#050810] border border-white/10 rounded-2xl p-4 sm:p-5 font-mono text-xs text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap select-all">
                {RAW_DISCORD_RULES_TEXT}
              </div>
            </div>
          )}
        </div>

        {/* 4 Cards Grid Layout for Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: General Rules */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0d1424]/85 border border-[#00d2ff]/20 hover:border-[#00d2ff]/50 transition-all duration-300 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center text-xl shadow-inner">
                  <Settings className="w-5 h-5 text-[#00d2ff]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#00d2ff] font-bold">Category 01</span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {t.categories.general.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5">
                {t.categories.general.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#080d18] border border-white/[0.05] flex items-start gap-2.5">
                    <span className="text-[#00d2ff] font-bold text-sm leading-tight mt-0.5">◀</span>
                    <div>
                      <strong className="text-white text-xs sm:text-sm font-bold block mb-0.5">
                        {item.label}:
                      </strong>
                      <span className="text-slate-400 text-xs leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Chat Rules */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0d1424]/85 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold">Category 02</span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {t.categories.chat.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5">
                {t.categories.chat.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#080d18] border border-white/[0.05] flex items-start gap-2.5">
                    <span className="text-purple-400 font-bold text-sm leading-tight mt-0.5">◀</span>
                    <div>
                      <strong className="text-white text-xs sm:text-sm font-bold block mb-0.5">
                        {item.label}:
                      </strong>
                      <span className="text-slate-400 text-xs leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Voice Rules */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0d1424]/85 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Category 03</span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {t.categories.voice.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5">
                {t.categories.voice.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#080d18] border border-white/[0.05] flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm leading-tight mt-0.5">◀</span>
                    <div>
                      <strong className="text-white text-xs sm:text-sm font-bold block mb-0.5">
                        {item.label}:
                      </strong>
                      <span className="text-slate-400 text-xs leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Enforcement & Escalation Chain */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#12111d] to-[#0d0e18] border-2 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-xl shadow-inner text-rose-400">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-rose-400 font-bold">Sanctions Policy</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t.categories.enforcement.title}
                </h3>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium italic text-center md:text-end">
              {t.categories.enforcement.footnote}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-bold text-slate-200">
              {t.categories.enforcement.chainTitle}
            </div>

            {/* Escalation Sequence Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center flex flex-col items-center justify-center">
                <span className="text-xs text-amber-400 font-mono uppercase font-bold mb-1">المرحلة الأولى</span>
                <span className="text-base font-black text-white">{t.categories.enforcement.steps[0]}</span>
              </div>

              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center flex flex-col items-center justify-center">
                <span className="text-xs text-orange-400 font-mono uppercase font-bold mb-1">المرحلة الثانية</span>
                <span className="text-base font-black text-white">{t.categories.enforcement.steps[1]}</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center flex flex-col items-center justify-center shadow-lg">
                <span className="text-xs text-rose-400 font-mono uppercase font-bold mb-1">المرحلة القصوى</span>
                <span className="text-base font-black text-white">{t.categories.enforcement.steps[2]}</span>
              </div>
            </div>

            {/* Friendly Closing Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
              <p className="text-sm text-[#00d2ff] font-bold">
                {t.categories.enforcement.closing}
              </p>

              <a
                href="https://discord.gg/dq36cMFef"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752c4] px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <span>فتح تذكرة استفسار أو بلاغ</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
