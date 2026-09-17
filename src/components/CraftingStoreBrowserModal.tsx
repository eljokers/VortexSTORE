import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Lock, ShieldCheck, ShoppingBag, AlertCircle, ArrowUpRight } from 'lucide-react';

interface CraftingStoreBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
}

export const CraftingStoreBrowserModal: React.FC<CraftingStoreBrowserModalProps> = ({
  isOpen,
  onClose,
  storeUrl,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-5xl h-[90vh] bg-[#090d16] border border-[#00d2ff]/30 rounded-3xl flex flex-col shadow-[0_0_60px_rgba(0,210,255,0.25)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0f172a] border-b border-white/10 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            {/* Address Bar */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-[#00d2ff]/25 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-mono max-w-sm sm:max-w-md truncate">
              <Lock className="w-3.5 h-3.5 text-[#39f77e]" />
              <span className="text-slate-400">https://</span>
              <span className="text-[#00d2ff] font-semibold">{storeUrl.replace(/^https?:\/\//, '')}</span>
            </div>
          </div>

          {/* Browser Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh Store"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 text-[#00d2ff] text-xs font-bold border border-[#00d2ff]/30 transition-colors"
              title="Open CraftingStore in new tab"
            >
              <span>Open in New Tab</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Notice Bar */}
        <div className="px-4 py-2 bg-gradient-to-r from-[#00d2ff]/10 via-slate-900 to-transparent border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#39f77e]" />
            <span>Official VortexMC CraftingStore Webstore</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Powered by CraftingStore Engine</span>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="flex-1 relative bg-[#07090e] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090e]/90 z-10 gap-3">
              <div className="w-8 h-8 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-semibold text-slate-300">Connecting to CraftingStore...</div>
              <p className="text-xs text-slate-500">Loading live packages and payment gateway</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={storeUrl}
            title="CraftingStore Webstore"
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            allow="payment"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />

          {/* Persistent Floating Fallback Button in case payment provider requires top window */}
          <div className="absolute bottom-4 right-4 z-20">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-[#00d2ff]/40 text-xs font-bold text-white shadow-xl hover:bg-slate-800 hover:border-[#00d2ff] transition-all backdrop-blur-md"
            >
              <span>Can't see checkout? Open Full Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00d2ff]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
