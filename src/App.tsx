/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StoreSection } from './components/StoreSection';
import { RulesSection } from './components/RulesSection';
import { StaffSection } from './components/StaffSection';
import { Footer } from './components/Footer';
import { ConnectionModal } from './components/ConnectionModal';
import { CraftingStoreCheckoutModal } from './components/CraftingStoreCheckoutModal';
import { CraftingStoreBrowserModal } from './components/CraftingStoreBrowserModal';
import { CraftingStoreConfigModal } from './components/CraftingStoreConfigModal';
import { StaffApplyPortal } from './components/StaffApply/StaffApplyPortal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Language } from './translations';
import { ServerStatusData, StorePackage } from './types';
import { Check } from 'lucide-react';

const SERVER_IP = 'vortexmc.xyz';
const DEFAULT_STORE_URL = 'https://vortex-mc.craftingstore.net';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('vortex_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('IP Copied to Clipboard!');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isStaffApplyOpen, setIsStaffApplyOpen] = useState(false);

  // Synchronize HTML dir attribute with language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleToggleLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('vortex_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    handleCopyText('', newLang === 'ar' ? 'تم تحويل اللغة إلى العربية (AR)' : 'Language switched to English (EN)');
  };

  // CraftingStore state
  const [storeUrl, setStoreUrl] = useState(DEFAULT_STORE_URL);
  const [selectedPackage, setSelectedPackage] = useState<StorePackage | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBrowserModalOpen, setIsBrowserModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Sync hash routing for staff apply
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#staff' || hash === '#staff-apply' || hash === '#apply' || hash === '#join') {
        setIsStaffApplyOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Load custom CraftingStore URL from localStorage if saved
  useEffect(() => {
    const savedUrl = localStorage.getItem('vortex_craftingstore_url');
    if (savedUrl) {
      setStoreUrl(savedUrl);
    }
  }, []);

  const handleSaveStoreUrl = (newUrl: string) => {
    setStoreUrl(newUrl);
    localStorage.setItem('vortex_craftingstore_url', newUrl);
    handleCopyText('', 'CraftingStore URL updated successfully!');
  };

  const [status, setStatus] = useState<ServerStatusData>({
    online: false,
    playersNow: 0,
    playersMax: 500,
    loading: true,
  });

  // Copy handler with iframe fallback
  const handleCopyText = useCallback(async (text: string, customMessage?: string) => {
    const textToCopy = text || SERVER_IP;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const area = document.createElement('textarea');
        area.value = textToCopy;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.focus();
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopied(true);
      setToastMessage(customMessage || (text ? 'Copied to Clipboard!' : 'IP Copied to Clipboard!'));
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      setTimeout(() => {
        setShowToast(false);
      }, 2400);
    } catch {
      setToastMessage(customMessage || `Address: ${textToCopy}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, []);

  // Fetch server status from live API with graceful fallback
  const fetchStatus = useCallback(async () => {
    try {
      // Primary: mcapi.us
      const res = await fetch(`https://mcapi.us/server/status?ip=${SERVER_IP}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.online === 'boolean') {
          const isOnline = Boolean(data.online);
          setStatus({
            online: isOnline,
            playersNow: isOnline ? (data.players?.now || 0) : 0,
            playersMax: data.players?.max || 500,
            loading: false,
          });
          return;
        }
      }
      throw new Error('Primary API error or missing online status');
    } catch {
      // Try secondary API if primary is blocked by CORS/network
      try {
        const altRes = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
        if (altRes.ok) {
          const altData = await altRes.json();
          const isOnline = Boolean(altData.online);
          setStatus({
            online: isOnline,
            playersNow: isOnline ? (altData.players?.online || 0) : 0,
            playersMax: altData.players?.max || 500,
            loading: false,
          });
          return;
        }
      } catch {
        // Fallback default state (Server Offline)
        setStatus({
          online: false,
          playersNow: 0,
          playersMax: 500,
          loading: false,
        });
      }
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleSelectPackage = (pkg: StorePackage) => {
    setSelectedPackage(pkg);
    setIsCheckoutModalOpen(true);
  };

  // Dedicated Staff Application Portal View
  if (isStaffApplyOpen) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col selection:bg-[#00d2ff]/30 selection:text-[#00d2ff]">
        <StaffApplyPortal
          serverIp={SERVER_IP}
          status={status}
          copied={copied}
          onCopyIp={() => handleCopyText(SERVER_IP)}
          onCopyText={handleCopyText}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onCloseToHome={() => {
            setIsStaffApplyOpen(false);
            if (window.location.hash) {
              window.history.pushState('', document.title, window.location.pathname + window.location.search);
            }
          }}
        />

        {/* Toast Notification */}
        <div
          id="toast"
          className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-[200] flex items-center gap-2.5 bg-[#0f172a] text-white border border-[#00d2ff] px-6 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] font-bold text-sm transition-all duration-300 pointer-events-none ${
            showToast
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff]">
            <Check className="w-3.5 h-3.5 text-[#39f77e]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-[#00d2ff]/30 selection:text-[#00d2ff]">
      {/* Floating Side Language Switcher (Always accessible on side) */}
      <LanguageSwitcher
        language={language}
        onToggleLanguage={handleToggleLanguage}
        position="floating-side"
      />

      {/* Top Navigation */}
      <Navbar
        serverIp={SERVER_IP}
        status={status}
        onCopyIp={() => handleCopyText(SERVER_IP)}
        copied={copied}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenWebstore={() => setIsBrowserModalOpen(true)}
        onOpenStaffApply={() => setIsStaffApplyOpen(true)}
        onCopyText={handleCopyText}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          serverIp={SERVER_IP}
          status={status}
          onCopyIp={() => handleCopyText(SERVER_IP)}
          copied={copied}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          onOpenWebstore={() => setIsBrowserModalOpen(true)}
          onCopyText={handleCopyText}
          language={language}
        />

        <StoreSection
          storeUrl={storeUrl}
          onSelectPackage={handleSelectPackage}
          onOpenBrowser={() => setIsBrowserModalOpen(true)}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          onCopyText={handleCopyText}
          language={language}
        />

        <RulesSection
          language={language}
          onCopyText={handleCopyText}
        />

        <StaffSection
          language={language}
          onCopyText={handleCopyText}
          onOpenStaffApply={() => setIsStaffApplyOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenStaffApply={() => setIsStaffApplyOpen(true)}
        language={language}
      />

      {/* Connection Guide Modal */}
      <ConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        serverIp={SERVER_IP}
        status={status}
        onCopyIp={() => handleCopyText(SERVER_IP)}
        copied={copied}
      />

      {/* CraftingStore Checkout Assistant Modal */}
      <CraftingStoreCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        pkg={selectedPackage}
        storeUrl={storeUrl}
        onCopyText={handleCopyText}
      />

      {/* CraftingStore Embedded Browser Modal */}
      <CraftingStoreBrowserModal
        isOpen={isBrowserModalOpen}
        onClose={() => setIsBrowserModalOpen(false)}
        storeUrl={storeUrl}
      />

      {/* CraftingStore URL Configuration Modal */}
      <CraftingStoreConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentUrl={storeUrl}
        onSaveUrl={handleSaveStoreUrl}
      />

      {/* Toast Notification */}
      <div
        id="toast"
        className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-[200] flex items-center gap-2.5 bg-[#0f172a] text-white border border-[#00d2ff] px-6 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] font-bold text-sm transition-all duration-300 pointer-events-none ${
          showToast
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        <div className="w-5 h-5 rounded-full bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff]">
          <Check className="w-3.5 h-3.5 text-[#39f77e]" />
        </div>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
