import React, { useState } from 'react';
import { X, Check, Save, RotateCcw, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

interface CraftingStoreConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (newUrl: string) => void;
}

export const CraftingStoreConfigModal: React.FC<CraftingStoreConfigModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = urlInput.trim();
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }
    // Remove trailing slash
    cleaned = cleaned.replace(/\/+$/, '');
    onSaveUrl(cleaned);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    setUrlInput('https://vortex-mc.craftingstore.net');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-[#0c121d] border border-[#00d2ff]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,210,255,0.2)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">CraftingStore Settings</h3>
            <p className="text-xs text-slate-400">Configure your network's webstore link</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              CraftingStore Webstore URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://vortex-mc.craftingstore.net"
              className="w-full bg-[#131c2d] border border-white/10 focus:border-[#00d2ff] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Supports your free CraftingStore subdomain (<code>*.craftingstore.net</code>) or custom domain (e.g. <code>store.vortexmc.xyz</code>).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <a
              href={urlInput}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#00d2ff] hover:underline"
            >
              <span>Test Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] text-sm font-bold shadow-md hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#00111a]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save URL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
