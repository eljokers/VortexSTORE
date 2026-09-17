import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { Language } from '../translations';

interface LanguageSwitcherProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  position?: 'floating-side' | 'inline';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onToggleLanguage,
  position = 'floating-side',
}) => {
  if (position === 'inline') {
    return (
      <div 
        id="lang-switcher-inline"
        className="inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/15 shadow-inner"
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => onToggleLanguage('en')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-md scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Switch to English"
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => onToggleLanguage('ar')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            language === 'ar'
              ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-md scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          title="التحويل للغة العربية"
        >
          AR
        </button>
      </div>
    );
  }

  return (
    <aside
      id="floating-language-sidebar"
      aria-label="Language selection tool"
      className="fixed right-3.5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-[#090e18]/95 border-2 border-[#00d2ff]/40 backdrop-blur-xl shadow-[0_0_30px_rgba(0,210,255,0.25)] transition-transform duration-300 hover:scale-105"
    >
      <div className="p-1.5 text-[#00d2ff]" title="اختيار اللغة / Language">
        <Languages className="w-4 h-4 animate-pulse" />
      </div>

      <div className="flex flex-col gap-1 w-full">
        {/* EN Button */}
        <button
          type="button"
          id="btn-lang-en-side"
          onClick={() => onToggleLanguage('en')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-gradient-to-br from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.6)] font-extrabold'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10'
          }`}
          title="English Version"
        >
          EN
        </button>

        {/* AR Button */}
        <button
          type="button"
          id="btn-lang-ar-side"
          onClick={() => onToggleLanguage('ar')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
            language === 'ar'
              ? 'bg-gradient-to-br from-[#00d2ff] to-[#0080ff] text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.6)] font-extrabold'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10'
          }`}
          title="اللغة العربية"
        >
          AR
        </button>
      </div>

      <span className="text-[9px] font-mono font-black text-[#00d2ff] tracking-tighter uppercase mt-0.5">
        LANG
      </span>
    </aside>
  );
};
