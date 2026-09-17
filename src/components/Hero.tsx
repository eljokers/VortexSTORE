import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, ShoppingBag, MessageSquare, Zap, Users, Shield, Sparkles, Monitor, Smartphone, ChevronDown, HelpCircle } from 'lucide-react';
import { ServerStatusData } from '../types';
import { Language, translations } from '../translations';

interface HeroProps {
  serverIp: string;
  status: ServerStatusData;
  onCopyIp: () => void;
  copied: boolean;
  onOpenConnectModal: () => void;
  onOpenWebstore: () => void;
  onCopyText?: (text: string, customMessage?: string) => void;
  language?: Language;
}

export const Hero: React.FC<HeroProps> = ({
  serverIp,
  status,
  onCopyIp,
  copied,
  onOpenConnectModal,
  onOpenWebstore,
  onCopyText,
  language = 'en',
}) => {
  const [showIpDropdown, setShowIpDropdown] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[language].hero;
  const isAr = language === 'ar';

  const BEDROCK_PORT = '19132';
  const JAVA_PORT = '25565';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowIpDropdown(false);
      }
    };
    if (showIpDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIpDropdown]);

  const copyValue = (text: string, type: string, message: string) => {
    if (onCopyText) {
      onCopyText(text, message);
    } else {
      onCopyIp();
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#00d2ff]/10 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#0080ff]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-[850px] mx-auto text-center z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 border border-[#00d2ff]/20 bg-[#00d2ff]/[0.07] px-4 py-2 rounded-full text-[#b9ecff] text-xs sm:text-[13px] font-bold mb-6 tracking-wide shadow-[0_0_15px_rgba(0,210,255,0.1)]">
          <Zap className="w-3.5 h-3.5 text-[#00d2ff]" />
          <span>{isAr ? 'لايف ستيل • سيرفايفل • مجتمع أونلاين' : 'LIFESTEAL • SURVIVAL • COMMUNITY'}</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-5 text-white">
          {isAr ? 'مرحباً بكم في ' : 'Welcome to '}
          <span className="bg-gradient-to-r from-white via-[#00d2ff] to-[#6bbcff] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,210,255,0.4)]">
            VortexMC
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-[680px] mx-auto text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-8">
          {t.subtitle}
        </p>

        {/* Hero Actions & IP Popover */}
        <div className="relative inline-block mb-8" ref={dropdownRef}>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#store"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] font-extrabold px-6 py-3.5 rounded-xl shadow-[0_0_25px_rgba(0,210,255,0.35)] hover:shadow-[0_0_35px_rgba(0,210,255,0.5)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.visitStore}</span>
            </a>

            <a
              href="https://discord.gg/vUCeFXeUH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#00d2ff]/20 text-white bg-gradient-to-br from-[#00d2ff]/15 to-[#0080ff]/05 px-6 py-3.5 rounded-xl font-bold hover:border-[#00d2ff] hover:shadow-[0_0_25px_rgba(0,210,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageSquare className="w-4 h-4 text-[#00d2ff]" />
              <span>{t.joinDiscord}</span>
            </a>

            {/* IP Trigger Button (Reveals Java & Bedrock values) */}
            <button
              type="button"
              onClick={() => setShowIpDropdown(!showIpDropdown)}
              className="inline-flex items-center gap-2.5 border-2 border-[#00d2ff]/50 bg-gradient-to-r from-[#101b2b] to-[#0c1524] hover:bg-slate-800 text-white font-bold px-5 py-3.5 rounded-xl transition-all duration-200 hover:border-[#00d2ff] hover:shadow-[0_0_25px_rgba(0,210,255,0.3)] group cursor-pointer"
              title="Click to view Java & Bedrock connection information"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                  status.online
                    ? 'bg-[#39f77e] animate-pulse shadow-[0_0_8px_#39f77e]'
                    : 'bg-[#ff4d4d] shadow-[0_0_8px_#ff4d4d]'
                }`}
              />
              <div className={`flex flex-col ${isAr ? 'items-end text-right' : 'items-start text-left'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#00d2ff] uppercase tracking-wider font-extrabold leading-none">
                    {t.serverIp}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none transition-colors ${
                      status.online
                        ? 'bg-emerald-500/20 text-[#39f77e] border border-emerald-500/40'
                        : 'bg-rose-500/20 text-[#ff4d4d] border border-rose-500/40'
                    }`}
                  >
                    {status.online ? t.online : t.offline}
                  </span>
                </div>
                <span className="font-mono text-sm font-black text-slate-100 group-hover:text-[#00d2ff] transition-colors">
                  {serverIp}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#00d2ff] transition-transform duration-300 ${showIpDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Interactive Java & Bedrock Values Dropdown Card */}
          {showIpDropdown && (
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-full max-w-[500px] min-w-[340px] sm:min-w-[460px] bg-[#0c1322] border-2 border-[#00d2ff]/50 rounded-2xl p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.25)] z-50 animate-fadeIn ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sparkles className="w-4 h-4 text-[#00d2ff]" />
                  <span>{isAr ? 'بيانات الاتصال بالسيرفر' : 'Server Connection Info'}</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/50 border border-white/10">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status.online ? 'bg-[#39f77e] animate-pulse shadow-[0_0_6px_#39f77e]' : 'bg-[#ff4d4d] shadow-[0_0_6px_#ff4d4d]'
                      }`}
                    />
                    <span className={status.online ? 'text-[#39f77e] font-extrabold uppercase' : 'text-[#ff4d4d] font-extrabold uppercase'}>
                      {status.online ? 'online' : 'offline'}
                    </span>
                  </span>
                </div>
                <button
                  onClick={onOpenConnectModal}
                  className="text-[11px] text-[#00d2ff] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{isAr ? 'دليل مفصل' : 'Guide'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Java Edition Section */}
                <div className="bg-[#121c2e] border border-emerald-500/30 rounded-xl p-3 hover:border-emerald-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-white">Java Edition (PC / Mac)</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/15 px-2 py-0.5 rounded">
                      Default Port: {JAVA_PORT}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-[#080d16] px-3 py-2 rounded-lg border border-white/10">
                    <span className="font-mono text-sm font-bold text-emerald-400 select-all">{serverIp}</span>
                    <button
                      onClick={() => copyValue(serverIp, 'java-ip', 'Java IP Copied! (vortexmc.xyz)')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedType === 'java-ip' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'java-ip' ? (isAr ? 'تم!' : 'Copied!') : (isAr ? 'نسخ الآيبي' : 'Copy IP')}</span>
                    </button>
                  </div>
                </div>

                {/* Bedrock Edition Section */}
                <div className="bg-[#121c2e] border border-[#00d2ff]/30 rounded-xl p-3 hover:border-[#00d2ff]/60 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#00d2ff]" />
                      <span className="text-xs font-black text-white">Bedrock Edition (Mobile / Console)</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-black bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      Required Port: {BEDROCK_PORT}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-[#080d16] px-3 py-2 rounded-lg border border-white/10">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">Server Address</span>
                        <span className="font-mono text-xs font-bold text-[#00d2ff]">{serverIp}</span>
                      </div>
                      <button
                        onClick={() => copyValue(serverIp, 'bedrock-ip', 'Bedrock IP Copied! (vortexmc.xyz)')}
                        className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                        title="Copy Address"
                      >
                        {copiedType === 'bedrock-ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-[#080d16] px-3 py-2 rounded-lg border border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Port</span>
                        <span className="font-mono text-xs font-black text-amber-400">{BEDROCK_PORT}</span>
                      </div>
                      <button
                        onClick={() => copyValue(BEDROCK_PORT, 'bedrock-port', 'Bedrock Port Copied! (19132)')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedType === 'bedrock-port' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isAr ? 'نسخ البورت' : 'Copy Port'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-center">
                <button
                  onClick={() => {
                    setShowIpDropdown(false);
                    onOpenConnectModal();
                  }}
                  className="text-xs text-[#00d2ff] hover:underline font-bold"
                >
                  {isAr ? 'كيف تضيف السيرفر في الجوال أو الكمبيوتر؟ اضغط هنا' : 'Need help joining on Mobile or PC? Click here'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* IP Quick Bar */}
        <div className="max-w-[620px] mx-auto mb-8 bg-[#090f1a]/85 border border-[#00d2ff]/30 rounded-2xl p-2.5 shadow-[0_0_25px_rgba(0,210,255,0.15)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              onClick={() => copyValue(serverIp, 'java-bar', 'Java IP Copied!')}
              className="flex items-center justify-between bg-[#111a2c] hover:bg-[#16233b] border border-white/5 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all group"
            >
              <div className={`flex items-center gap-2 ${isAr ? 'text-right' : 'text-left'}`}>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Monitor className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Java (PC / Mac)</div>
                  <div className="font-mono text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    {serverIp}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-300 bg-black/40 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                {copiedType === 'java-bar' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'java-bar' ? (isAr ? 'تم' : 'Done') : (isAr ? 'نسخ' : 'Copy')}</span>
              </span>
            </div>

            <div
              onClick={() => copyValue(`${serverIp}:${BEDROCK_PORT}`, 'bedrock-bar', 'Bedrock IP & Port Copied!')}
              className="flex items-center justify-between bg-[#111a2c] hover:bg-[#16233b] border border-white/5 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all group"
            >
              <div className={`flex items-center gap-2 ${isAr ? 'text-right' : 'text-left'}`}>
                <div className="w-7 h-7 rounded-lg bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <span>Bedrock (الهاتف)</span>
                    <span className="text-amber-400 font-bold">• Port: {BEDROCK_PORT}</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#00d2ff] group-hover:text-[#6ae0ff]">
                    {serverIp}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#00d2ff] bg-black/40 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                {copiedType === 'bedrock-bar' ? <Check className="w-3 h-3 text-[#00d2ff]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'bedrock-bar' ? (isAr ? 'تم' : 'Done') : (isAr ? 'نسخ' : 'Copy')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Pill */}
        <div
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 ${
            status.loading
              ? 'bg-[#0a111c]/90 border border-slate-700/50 text-slate-300'
              : status.online
              ? 'bg-[#071911]/90 border border-emerald-500/35 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-[#1c0a0d]/90 border border-rose-500/35 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          }`}
        >
          {/* Server Light / لمبة السيرفر */}
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              status.loading
                ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]'
                : status.online
                ? 'bg-[#39f77e] shadow-[0_0_10px_#39f77e] animate-pulse'
                : 'bg-[#ff4d4d] shadow-[0_0_10px_#ff4d4d]'
            }`}
          />
          <div className="flex items-center gap-2">
            {status.loading ? (
              <span className="text-slate-300">{isAr ? 'جاري فحص حالة السيرفر...' : 'Checking server status...'}</span>
            ) : status.online ? (
              <>
                <span className="font-black uppercase tracking-wider text-[#39f77e]">online</span>
                <span className="text-emerald-500/40 font-normal">•</span>
                <span className="text-slate-200 font-semibold">
                  {status.playersNow}/{status.playersMax} {isAr ? 'لاعب' : 'Players'}
                </span>
              </>
            ) : (
              <>
                <span className="font-black uppercase tracking-wider text-[#ff4d4d]">offline</span>
                <span className="text-rose-500/40 font-normal">•</span>
                <span className="text-slate-300 font-medium text-xs">
                  {isAr ? 'السيرفر غير متصل حالياً' : 'Server is currently offline'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Server Highlights quick tags */}
        <div className={`mt-12 pt-8 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.05]">
            <div className="text-[#00d2ff] font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Lifesteal SMP
            </div>
            <p className="text-xs text-slate-400">{isAr ? 'سرقة قلوب عند قتل اللاعبين، وقلوب مخصصة' : 'Steal hearts on kill, custom revives & economy'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.05]">
            <div className="text-[#00d2ff] font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Land Claims
            </div>
            <p className="text-xs text-slate-400">{isAr ? 'حماية البناء ومستودعات الأغراض ضد التخريب' : 'Grief-prevention & economy protection for builds'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.05]">
            <div className="text-[#00d2ff] font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Bedrock + Java
            </div>
            <p className="text-xs text-slate-400">{isAr ? 'دعم مشترك للكمبيوتر، الجوال، والكونسول' : 'Cross-play enabled for PC, Mobile, and Consoles'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.05]">
            <div className="text-[#00d2ff] font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Active Staff
            </div>
            <p className="text-xs text-slate-400">{isAr ? 'حماية ضد الهاك ودعم فني بالديسكورد 24/7' : '24/7 dedicated anti-cheat & Discord support'}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
