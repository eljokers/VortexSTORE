import React, { useState } from 'react';
import { X, Copy, Check, Monitor, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import { ServerStatusData } from '../types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverIp: string;
  status?: ServerStatusData;
  onCopyIp?: (text?: string, customMessage?: string) => void;
  copied?: boolean;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  serverIp,
  status,
  onCopyIp,
}) => {
  const [guideTab, setGuideTab] = useState<'java' | 'bedrock'>('java');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const BEDROCK_PORT = '19132';
  const JAVA_PORT = '25565';

  const copyWithFeedback = async (text: string, id: string, message: string) => {
    try {
      if (onCopyIp) {
        onCopyIp(text, message);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#0c121d] border border-[#00d2ff]/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,210,255,0.25)] text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/70 hover:bg-slate-700 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center sm:text-left pr-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cross-Play Server IP</span>
            </div>
            {status && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                  status.online
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-[#39f77e]'
                    : 'bg-rose-500/15 border border-rose-500/30 text-[#ff4d4d]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status.online
                      ? 'bg-[#39f77e] animate-pulse shadow-[0_0_6px_#39f77e]'
                      : 'bg-[#ff4d4d] shadow-[0_0_6px_#ff4d4d]'
                  }`}
                />
                <span className="font-mono font-black uppercase">
                  {status.online ? 'online' : 'offline'}
                </span>
              </div>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            بيانات الدخول لسيرفر <span className="text-[#00d2ff]">VortexMC</span>
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            السيرفر يدعم لاعبي الكمبيوتر (Java) ولاعبي الهواتف والكونسول (Bedrock) معاً!
          </p>
        </div>

        {/* Two High-Contrast Cards for Java & Bedrock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Java Card */}
          <div className="bg-gradient-to-b from-[#131c2d] to-[#0d1422] border-2 border-emerald-500/40 hover:border-emerald-400/60 rounded-2xl p-4 sm:p-5 relative group transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">Java Edition</h4>
                  <span className="text-[11px] text-emerald-400/90 font-medium">الكمبيوتر / PC & Mac</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                1.19 - 1.21+
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="bg-[#080d16] p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                  Server Address (IP)
                </div>
                <div className="font-mono text-base font-black text-emerald-400 select-all">
                  {serverIp}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Default Port:</span>
                <span className="font-mono text-slate-300 font-semibold">{JAVA_PORT} (تلقائي)</span>
              </div>
            </div>

            <button
              onClick={() => copyWithFeedback(serverIp, 'java-ip', 'Java IP Copied! (vortexmc.xyz)')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              {copiedItem === 'java-ip' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم نسخ آيبي الجافا!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ IP الجافا ({serverIp})</span>
                </>
              )}
            </button>
          </div>

          {/* Bedrock Card */}
          <div className="bg-gradient-to-b from-[#131c2d] to-[#0d1422] border-2 border-[#00d2ff]/40 hover:border-[#00d2ff]/60 rounded-2xl p-4 sm:p-5 relative group transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">Bedrock Edition</h4>
                  <span className="text-[11px] text-[#00d2ff]/90 font-medium">الهاتف والكونسول / PE & Console</span>
                </div>
              </div>
              <span className="text-[10px] bg-[#00d2ff]/15 text-[#00d2ff] font-mono px-2 py-0.5 rounded-full border border-[#00d2ff]/30">
                All Versions
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-3 bg-[#080d16] p-2.5 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                    Bedrock IP
                  </div>
                  <div className="font-mono text-sm font-black text-[#00d2ff] truncate select-all">
                    {serverIp}
                  </div>
                </div>

                <div className="col-span-2 bg-[#080d16] p-2.5 rounded-xl border border-[#00d2ff]/30 bg-[#00d2ff]/5">
                  <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-0.5">
                    Port (البورت)
                  </div>
                  <div className="font-mono text-base font-black text-amber-300 select-all">
                    {BEDROCK_PORT}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-amber-300/90 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                ⚠️ مهم للبيدروك: اكتب البورت <strong className="text-amber-200">19132</strong> في خانة Port
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => copyWithFeedback(serverIp, 'bedrock-ip', 'Bedrock IP Copied! (vortexmc.xyz)')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition-colors cursor-pointer"
                title="نسخ الآيبي فقط"
              >
                {copiedItem === 'bedrock-ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ الآيبي</span>
              </button>

              <button
                onClick={() => copyWithFeedback(BEDROCK_PORT, 'bedrock-port', 'Bedrock Port Copied! (19132)')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                title="نسخ البورت 19132"
              >
                {copiedItem === 'bedrock-port' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ البورت (19132)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step-by-step Guide Switcher */}
        <div className="border-t border-white/10 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">خطوات الاتصال بالتفصيل:</span>
            <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setGuideTab('java')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  guideTab === 'java' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                دليل Java
              </button>
              <button
                onClick={() => setGuideTab('bedrock')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  guideTab === 'bedrock' ? 'bg-[#00d2ff] text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                دليل Bedrock
              </button>
            </div>
          </div>

          {guideTab === 'java' ? (
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1 bg-slate-900/60 p-3.5 rounded-xl border border-white/5 leading-relaxed">
              <li>افتح لعبة ماين كرافت (Java Edition من إصدار 1.19 إلى 1.21+).</li>
              <li>اضغط على <strong>Multiplayer</strong> ثم <strong>Add Server</strong>.</li>
              <li>اكتب في Server Name: <strong className="text-emerald-400">VortexMC</strong>.</li>
              <li>في خانة Server Address الصق الآيبي: <strong className="text-emerald-400">{serverIp}</strong>.</li>
              <li>اضغط <strong>Done</strong> ثم ادخل السيرفر واستمتع!</li>
            </ol>
          ) : (
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1 bg-slate-900/60 p-3.5 rounded-xl border border-white/5 leading-relaxed">
              <li>افتح ماين كرافت على هاتفك (Android / iOS) أو الكونسول أو ويندوز.</li>
              <li>اضغط <strong>Play</strong> ثم اختر قائمة <strong>Servers</strong>.</li>
              <li>انزل لأسفل واضغط على <strong>Add Server</strong>.</li>
              <li>اكتب في Server Name: <strong className="text-[#00d2ff]">VortexMC</strong>.</li>
              <li>في خانة Server Address اكتب: <strong className="text-[#00d2ff]">{serverIp}</strong>.</li>
              <li>في خانة Port اكتب: <strong className="text-amber-400 font-mono">19132</strong> (مهم جداً).</li>
              <li>اضغط <strong>Save</strong> ثم <strong>Play</strong> للاتصال بالسيرفر مباشرة!</li>
            </ol>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <a
            href="https://discord.gg/vUCeFXeUH"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-[#00d2ff] flex items-center gap-1 transition-colors"
          >
            <span>تحتاج مساعدة؟ تواصل عبر الديسكورد</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

