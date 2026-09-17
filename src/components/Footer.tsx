import React from 'react';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { Language, translations } from '../translations';

interface FooterProps {
  onOpenConnectModal: () => void;
  onOpenStaffApply?: () => void;
  language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenConnectModal, 
  onOpenStaffApply,
  language = 'en',
}) => {
  const t = translations[language].footer;
  const isAr = language === 'ar';

  return (
    <footer className="border-t border-white/[0.06] py-10 px-4 text-slate-400 text-xs sm:text-sm bg-[#05070a]/90 backdrop-blur-md" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
        <div>
          <div className="font-pixel text-xs text-white mb-2 tracking-wider">
            Vortex<span className="text-[#00d2ff]">MC</span>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            {t.rights}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 font-semibold text-xs sm:text-sm">
          <a href="#" className="hover:text-[#00d2ff] transition-colors">
            {isAr ? 'الرئيسية' : 'Home'}
          </a>
          <a href="#store" className="hover:text-[#00d2ff] transition-colors">
            {isAr ? 'المتجر' : 'Store'}
          </a>
          <a href="#rules" className="hover:text-[#00d2ff] transition-colors">
            {isAr ? 'القوانين' : 'Rules'}
          </a>
          {onOpenStaffApply ? (
            <button
              type="button"
              onClick={onOpenStaffApply}
              className="hover:text-[#00d2ff] transition-colors cursor-pointer text-[#39f77e] font-bold"
            >
              {isAr ? 'تقديم الإدارة (Staff Apply)' : 'Staff Applications'}
            </button>
          ) : (
            <a href="#join" className="hover:text-[#00d2ff] transition-colors">
              {isAr ? 'تقديم الإدارة' : 'Staff Apply'}
            </a>
          )}
          <button
            onClick={onOpenConnectModal}
            className="hover:text-[#00d2ff] transition-colors cursor-pointer"
          >
            {isAr ? 'دليل الدخول' : 'How to Join'}
          </button>
          <a
            href="https://discord.gg/dq36cMFef"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#00d2ff] hover:underline font-bold transition-colors"
          >
            <span>{t.support} (Ticket Support)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
          <a
            href="https://discord.gg/vUCeFXeUH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#00d2ff] transition-colors"
          >
            <span>{t.discord} (Discord)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </footer>
  );
};
