import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Menu, X, ExternalLink, Monitor, Smartphone, ChevronDown, Sparkles } from 'lucide-react';
import { ServerStatusData } from '../types';
import { Language, translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  serverIp: string;
  status?: ServerStatusData;
  onCopyIp: () => void;
  copied: boolean;
  onOpenConnectModal: () => void;
  onOpenWebstore: () => void;
  onOpenStaffApply?: () => void;
  onCopyText?: (text: string, customMessage?: string) => void;
  language?: Language;
  onToggleLanguage?: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  serverIp,
  status,
  onCopyIp,
  copied,
  onOpenConnectModal,
  onOpenWebstore,
  onOpenStaffApply,
  onCopyText,
  language = 'en',
  onToggleLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavIpDropdown, setShowNavIpDropdown] = useState(false);
  const [navCopiedType, setNavCopiedType] = useState<string | null>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[language].nav;
  const isAr = language === 'ar';

  const BEDROCK_PORT = '19132';
  const JAVA_PORT = '25565';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        setShowNavIpDropdown(false);
      }
    };
    if (showNavIpDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNavIpDropdown]);

  const copyNavValue = (text: string, type: string, message: string) => {
    if (onCopyText) {
      onCopyText(text, message);
    } else {
      onCopyIp();
    }
    setNavCopiedType(type);
    setTimeout(() => setNavCopiedType(null), 2000);
  };

  const navLinks = [
    { label: t.home, href: '#' },
    { label: t.store, href: '#store' },
    { label: t.rules, href: '#rules' },
    { label: t.staffApply, href: '#join' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-[#07090e]/85 border-b border-white/[0.06] transition-all" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 min-h-[76px] flex items-center justify-between gap-4">
        {/* Logo */}
        <a 
          href="#" 
          className="font-pixel text-[15px] sm:text-base text-white tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap drop-shadow-[0_0_12px_#00d2ff]"
        >
          Vortex<span className="text-[#00d2ff]">MC</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[#cbd5e1] text-sm font-semibold">
          {navLinks.map((link) => {
            if (link.href === '#join' && onOpenStaffApply) {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={onOpenStaffApply}
                  className="transition-colors duration-200 hover:text-[#00d2ff] hover:drop-shadow-[0_0_12px_rgba(0,210,255,0.5)] cursor-pointer flex items-center gap-1.5"
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#39f77e] bg-[#39f77e]/15 border border-[#39f77e]/30 px-1.5 py-0.5 rounded-full animate-pulse">
                    {t.openBadge}
                  </span>
                </button>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors duration-200 hover:text-[#00d2ff] hover:drop-shadow-[0_0_12px_rgba(0,210,255,0.5)]"
              >
                {link.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="transition-colors duration-200 hover:text-[#00d2ff] hover:drop-shadow-[0_0_12px_rgba(0,210,255,0.5)] cursor-pointer"
          >
            {t.howToJoin}
          </button>
          <a
            href="https://discord.gg/dq36cMFef"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#00d2ff] hover:text-[#38bdf8] transition-colors duration-200 font-bold"
          >
            <span>{t.supportTicket}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
          <a
            href="https://discord.gg/vUCeFXeUH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#cbd5e1] hover:text-[#00d2ff] transition-colors duration-200 hover:drop-shadow-[0_0_12px_rgba(0,210,255,0.5)]"
          >
            <span>{t.discord}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </nav>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher Button (AR / EN) */}
          {onToggleLanguage && (
            <LanguageSwitcher
              language={language}
              onToggleLanguage={onToggleLanguage}
              position="inline"
            />
          )}

          <button
            type="button"
            onClick={onOpenWebstore}
            className="hidden sm:inline-flex items-center gap-1.5 border border-[#00d2ff]/40 bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] px-3 py-2 rounded-xl cursor-pointer font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm"
            title="Open CraftingStore Webstore"
          >
            <span>{t.store}</span>
          </button>

          {/* Java & Bedrock IP Trigger in Navbar */}
          <div className="relative" ref={navDropdownRef}>
            <button
              onClick={() => setShowNavIpDropdown(!showNavIpDropdown)}
              id="copyIp"
              className="inline-flex items-center gap-1.5 sm:gap-2 border border-[#00d2ff]/40 text-white bg-gradient-to-br from-[#00d2ff]/20 to-[#0080ff]/10 px-3 sm:px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs sm:text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00d2ff] hover:shadow-[0_0_25px_rgba(0,210,255,0.3)] active:translate-y-0"
              title="Click to view Java & Bedrock IP and Port"
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  status?.online
                    ? 'bg-[#39f77e] animate-pulse shadow-[0_0_6px_#39f77e]'
                    : 'bg-[#ff4d4d] shadow-[0_0_6px_#ff4d4d]'
                }`}
              />
              <span className="font-mono text-xs hidden xs:inline sm:inline">Server IP</span>
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none transition-colors ${
                  status?.online
                    ? 'bg-emerald-500/20 text-[#39f77e] border border-emerald-500/40'
                    : 'bg-rose-500/20 text-[#ff4d4d] border border-rose-500/40'
                }`}
              >
                {status?.online ? 'online' : 'offline'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#00d2ff] transition-transform duration-200 ${showNavIpDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Navbar Dropdown Popover */}
            {showNavIpDropdown && (
              <div className={`absolute ${isAr ? 'left-0' : 'right-0'} top-full mt-2 w-72 sm:w-80 bg-[#0c1322] border-2 border-[#00d2ff]/50 rounded-2xl p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(0,210,255,0.25)] z-50 text-left animate-fadeIn`}>
                <div className="text-[11px] font-bold text-white mb-2 flex items-center justify-between pb-1.5 border-b border-white/10">
                  <span className="text-[#00d2ff] flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3" />
                    {isAr ? 'بيانات السيرفر' : 'Server Connection'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status?.online
                          ? 'bg-[#39f77e] animate-pulse shadow-[0_0_6px_#39f77e]'
                          : 'bg-[#ff4d4d] shadow-[0_0_6px_#ff4d4d]'
                      }`}
                    />
                    <span
                      className={`font-black uppercase ${
                        status?.online ? 'text-[#39f77e]' : 'text-[#ff4d4d]'
                      }`}
                    >
                      {status?.online ? 'online' : 'offline'}
                    </span>
                  </div>
                </div>

                {/* Java Box */}
                <div className="mb-2 p-2 rounded-xl bg-[#121c2e] border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Java (PC / Mac)</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">Port: {JAVA_PORT}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 bg-[#080d16] px-2 py-1 rounded-lg">
                    <span className="font-mono text-xs text-emerald-400 font-bold truncate select-all">{serverIp}</span>
                    <button
                      onClick={() => copyNavValue(serverIp, 'nav-java', 'Java IP Copied! (vortexmc.xyz)')}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {navCopiedType === 'nav-java' ? (isAr ? 'تم!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}
                    </button>
                  </div>
                </div>

                {/* Bedrock Box */}
                <div className="mb-2 p-2 rounded-xl bg-[#121c2e] border border-[#00d2ff]/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#00d2ff]">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Bedrock (Phone / Console)</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-black bg-amber-500/20 px-1.5 py-0.5 rounded">
                      Port: {BEDROCK_PORT}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => copyNavValue(serverIp, 'nav-bed-ip', 'Bedrock IP Copied! (vortexmc.xyz)')}
                      className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      {navCopiedType === 'nav-bed-ip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isAr ? 'نسخ الآيبي' : 'Copy IP'}</span>
                    </button>
                    <button
                      onClick={() => copyNavValue(BEDROCK_PORT, 'nav-bed-port', 'Bedrock Port Copied! (19132)')}
                      className="py-1 px-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      {navCopiedType === 'nav-bed-port' ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                      <span>{isAr ? 'نسخ البورت' : 'Copy Port'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowNavIpDropdown(false);
                    onOpenConnectModal();
                  }}
                  className="w-full py-1.5 text-center text-[11px] font-bold text-[#00d2ff] hover:underline bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 rounded-lg transition-colors cursor-pointer"
                >
                  {isAr ? 'فتح الدليل الشامل لكيفية الدخول' : 'Open Full Connection Guide'}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-5 pb-6 pt-2 bg-[#07090e]/95 border-b border-[#00d2ff]/20 backdrop-blur-xl animate-fadeIn" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="flex flex-col gap-3 text-sm font-semibold">
            {/* Mobile Language Switcher */}
            {onToggleLanguage && (
              <div className="py-2 flex items-center justify-between border-b border-white/10">
                <span className="text-xs text-slate-400 font-bold">{isAr ? 'تغيير اللغة' : 'Language'}</span>
                <LanguageSwitcher
                  language={language}
                  onToggleLanguage={onToggleLanguage}
                  position="inline"
                />
              </div>
            )}

            {navLinks.map((link) => {
              if (link.href === '#join' && onOpenStaffApply) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenStaffApply();
                    }}
                    className={`py-2.5 px-3 rounded-lg text-[#cbd5e1] hover:text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all flex items-center justify-between cursor-pointer ${isAr ? 'text-right' : 'text-left'}`}
                  >
                    <span>{link.label}</span>
                    <span className="text-[10px] font-black uppercase text-[#39f77e] bg-[#39f77e]/15 border border-[#39f77e]/30 px-2 py-0.5 rounded-full">
                      {t.openBadge}
                    </span>
                  </button>
                );
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 px-3 rounded-lg text-[#cbd5e1] hover:text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all ${isAr ? 'text-right' : 'text-left'}`}
                >
                  {link.label}
                </a>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConnectModal();
              }}
              className={`py-2.5 px-3 rounded-lg text-[#cbd5e1] hover:text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all cursor-pointer ${isAr ? 'text-right' : 'text-left'}`}
            >
              {t.howToJoin}
            </button>
            <a
              href="https://discord.gg/dq36cMFef"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all flex items-center justify-between font-bold"
            >
              <span>{t.supportTicket}</span>
              <ExternalLink className="w-4 h-4 text-[#00d2ff]" />
            </a>
            <a
              href="https://discord.gg/vUCeFXeUH"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-[#cbd5e1] hover:text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all flex items-center justify-between"
            >
              <span>{t.discord}</span>
              <ExternalLink className="w-4 h-4 text-[#00d2ff]" />
            </a>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWebstore();
                }}
                className="w-full py-2.5 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/40 text-[#00d2ff] font-bold text-center cursor-pointer"
              >
                {t.store}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onCopyIp();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center cursor-pointer"
              >
                {serverIp} ({copied ? 'Copied!' : 'Copy IP'})
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
