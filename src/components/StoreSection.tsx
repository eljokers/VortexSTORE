import React, { useState, useEffect } from 'react';
import { 
  Check, Sparkles, ExternalLink, ShieldCheck, Crown, Flame, Gem, 
  Key, Coins, Palette, ShoppingBag, Terminal, Copy, Settings, ArrowRight, 
  PhoneCall, CreditCard, MessageSquare, Search
} from 'lucide-react';
import { StorePackage, StoreCategory, StoreOrder } from '../types';
import { Language, translations } from '../translations';
import { fetchOrders } from '../services/api';

interface StoreSectionProps {
  storeUrl: string;
  onSelectPackage: (pkg: StorePackage) => void;
  onOpenBrowser: () => void;
  onOpenConfig: () => void;
  onCopyText: (text: string, message?: string) => void;
  language?: Language;
  onOpenTracker?: () => void;
}

// Secure payment gateways configured
// Personal merchant credentials are encrypted and processed securely via the gateway backend


export const StoreSection: React.FC<StoreSectionProps> = ({
  storeUrl,
  onSelectPackage,
  onOpenBrowser,
  onOpenConfig,
  onCopyText,
  language = 'en',
  onOpenTracker,
}) => {
  const [activeCategory, setActiveCategory] = useState<StoreCategory>('ranks');
  const [currencyMode, setCurrencyMode] = useState<'both' | 'egp' | 'usd'>('both');
  const [realOrders, setRealOrders] = useState<StoreOrder[]>([]);
  const t = translations[language].store;
  const isAr = language === 'ar';

  const loadRealOrders = async () => {
    try {
      const orders = await fetchOrders();
      setRealOrders(orders);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadRealOrders();

    const handleOrdersUpdated = () => {
      loadRealOrders();
    };

    window.addEventListener('vortex_order_created', handleOrdersUpdated);
    window.addEventListener('vortex_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);

    return () => {
      window.removeEventListener('vortex_order_created', handleOrdersUpdated);
      window.removeEventListener('vortex_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, []);

  // All store packages with both USD and Vodafone Cash (EGP) pricing
  const allPackages: StorePackage[] = [
    // Ranks Category
    {
      id: 'vip',
      category: 'ranks',
      tier: 'Starter',
      name: 'VIP',
      price: '$0.99',
      egpPrice: '50 EGP',
      numericPrice: 0.99,
      currency: 'USD',
      popular: false,
      color: '#38bdf8',
      features: [
        'Kit VIP Access',
        '/fly in Lobby',
        '2x Claim Blocks',
        'VIP Chat Prefix',
      ],
      buyUrl: `${storeUrl}/package/vip`,
    },
    {
      id: 'mvp',
      category: 'ranks',
      tier: 'Popular',
      name: 'MVP',
      price: '$1.99',
      egpPrice: '100 EGP',
      numericPrice: 1.99,
      currency: 'USD',
      popular: true,
      color: '#00d2ff',
      features: [
        'Kit MVP Access',
        '/heal Command',
        '/workbench Command',
        '5x Claim Blocks',
      ],
      buyUrl: `${storeUrl}/package/mvp`,
    },
    {
      id: 'mvp-plus',
      category: 'ranks',
      tier: 'Premium',
      name: 'MVP+',
      price: '$3.49',
      egpPrice: '180 EGP',
      numericPrice: 3.49,
      currency: 'USD',
      popular: false,
      color: '#818cf8',
      features: [
        'All MVP Perks Included',
        '/feed Command',
        'Unlimited Homes',
        'Custom Particles',
      ],
      buyUrl: `${storeUrl}/package/mvp-plus`,
    },
    {
      id: 'custom',
      category: 'ranks',
      tier: 'Ultimate',
      name: 'CUSTOM',
      price: '$5.99',
      egpPrice: '290 EGP',
      numericPrice: 5.99,
      currency: 'USD',
      popular: false,
      color: '#f59e0b',
      features: [
        'Custom Prefix & Color',
        'Private World Access',
        'Priority Staff Support',
        'All Commands Unlocked',
      ],
      buyUrl: `${storeUrl}/package/custom`,
    },

    // Crate Keys Category
    {
      id: 'keys-vortex',
      category: 'keys',
      tier: 'Starter Keys',
      name: '5x Vortex Keys',
      price: '$0.99',
      egpPrice: '50 EGP',
      numericPrice: 0.99,
      currency: 'USD',
      popular: false,
      color: '#38bdf8',
      features: [
        '5x Rare Crate Keys',
        'Tier 1-3 Enchanted Armor',
        '35% Chance for Spawners',
        'Usable at /warp crates',
      ],
      buyUrl: `${storeUrl}/category/crates`,
    },
    {
      id: 'keys-mythic',
      category: 'keys',
      tier: 'Best Value',
      name: '15x Mythic Keys',
      price: '$1.79',
      egpPrice: '90 EGP',
      numericPrice: 1.79,
      currency: 'USD',
      popular: true,
      color: '#00d2ff',
      features: [
        '15x Mythic Crate Keys',
        'Tier 4-5 Custom Enchants',
        'High Chance for Extra Hearts',
        'Legendary Voucher Drops',
      ],
      buyUrl: `${storeUrl}/category/crates`,
    },
    {
      id: 'keys-legendary',
      category: 'keys',
      tier: 'Master Keys',
      name: '30x Legendary Keys',
      price: '$2.99',
      egpPrice: '150 EGP',
      numericPrice: 2.99,
      currency: 'USD',
      popular: false,
      color: '#f59e0b',
      features: [
        '30x Legendary Keys',
        'Guaranteed God Apple Bundle',
        'Exclusive Lifesteal Beacon',
        'Instant Global Broadcast on Open',
      ],
      buyUrl: `${storeUrl}/category/crates`,
    },

    // Coins & Economy
    {
      id: 'coins-starter',
      category: 'coins',
      tier: 'Coin Pouch',
      name: '15,000 Coins',
      price: '$0.99',
      egpPrice: '50 EGP',
      numericPrice: 0.99,
      currency: 'USD',
      popular: false,
      color: '#eab308',
      features: [
        '15,000 In-Game Coins',
        'Direct /balance Deposit',
        'Buy Blocks & Spawners at Shop',
        'No Expiration Date',
      ],
      buyUrl: `${storeUrl}/category/coins`,
    },
    {
      id: 'coins-vault',
      category: 'coins',
      tier: 'Coin Vault',
      name: '60,000 Coins',
      price: '$2.39',
      egpPrice: '120 EGP',
      numericPrice: 2.39,
      currency: 'USD',
      popular: true,
      color: '#00d2ff',
      features: [
        '60,000 In-Game Coins',
        '+ 1x Free Mythic Crate Key',
        'Instant Server-Wide Balance Boost',
        'Unlocks Auction House Elite Slots',
      ],
      buyUrl: `${storeUrl}/category/coins`,
    },
    {
      id: 'coins-booster',
      category: 'coins',
      tier: 'Global Booster',
      name: '2x XP Booster (3 hrs)',
      price: '$1.39',
      egpPrice: '70 EGP',
      numericPrice: 1.39,
      currency: 'USD',
      popular: false,
      color: '#a855f7',
      features: [
        '2x XP for ENTIRE Server',
        '3 Hours Duration',
        'Your Name Broadcasted in Chat',
        'Appreciation Gift Crate for Buyer',
      ],
      buyUrl: `${storeUrl}/category/boosters`,
    },

    // Cosmetics
    {
      id: 'cosmetic-particles',
      category: 'cosmetics',
      tier: 'Visual FX',
      name: 'Vortex Particle Pack',
      price: '$0.99',
      egpPrice: '50 EGP',
      numericPrice: 0.99,
      currency: 'USD',
      popular: false,
      color: '#ec4899',
      features: [
        'Cyan Plasma Footstep Trail',
        'Angel & Demon Wings FX',
        'Lightning Kill Effects',
        'Toggleable via /particles',
      ],
      buyUrl: `${storeUrl}/category/cosmetics`,
    },
    {
      id: 'cosmetic-tags',
      category: 'cosmetics',
      tier: 'Chat Style',
      name: 'Custom Tag Bundle',
      price: '$1.59',
      egpPrice: '80 EGP',
      numericPrice: 1.59,
      currency: 'USD',
      popular: true,
      color: '#00d2ff',
      features: [
        '25+ Animated Chat Prefixes',
        'Custom RGB Gradient Nicknames',
        'Crown Icon Next to IGN',
        'Special Discord Role Linked',
      ],
      buyUrl: `${storeUrl}/category/cosmetics`,
    },
  ];

  // Filtered packages
  const filteredPackages = allPackages.filter((p) => p.category === activeCategory);

  const getRankIcon = (tier: string = '') => {
    if (tier.includes('Starter')) return <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />;
    if (tier.includes('Popular') || tier.includes('Best Value')) return <Flame className="w-4 h-4 text-[#00d2ff]" />;
    if (tier.includes('Premium') || tier.includes('Master')) return <Gem className="w-4 h-4 text-[#818cf8]" />;
    if (tier.includes('Ultimate')) return <Crown className="w-4 h-4 text-[#f59e0b]" />;
    return <Sparkles className="w-4 h-4 text-[#00d2ff]" />;
  };

  return (
    <section id="store" className="py-24 px-4 relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 border border-[#00d2ff]/25 bg-[#00d2ff]/[0.08] px-4 py-1.5 rounded-full text-[#00d2ff] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">
            {t.title}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Highlighted Payment Methods Notification Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-sky-950/40 border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto">
            {/* Vodafone Cash pill */}
            <div className="flex items-center gap-2.5 bg-rose-500/15 border border-rose-500/30 px-3.5 py-2 rounded-xl">
              <span className="text-base">📱</span>
              <div className="text-left">
                <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">فودافون كاش (مصر)</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>تحويل سريع ومجاني بالجنيه</span>
                  <span className="text-rose-400 font-mono text-[11px] bg-rose-500/20 px-1.5 py-0.5 rounded">EGP</span>
                </div>
              </div>
            </div>

            {/* CraftingStore & Cards pill */}
            <div className="flex items-center gap-2.5 bg-[#00d2ff]/15 border border-[#00d2ff]/30 px-3.5 py-2 rounded-xl">
              <CreditCard className="w-4 h-4 text-[#00d2ff]" />
              <div className="text-left">
                <div className="text-[10px] text-[#00d2ff] font-bold uppercase tracking-wider">CraftingStore & Cards</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>بطاقات دولية ومشتريات المتجر</span>
                  <span className="text-[#00d2ff] font-mono text-[11px] bg-[#00d2ff]/20 px-1.5 py-0.5 rounded">USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery badge & Tracker Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenTracker && (
              <button
                type="button"
                onClick={onOpenTracker}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="متابعة حالة وتفعيل طلب الشراء"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>🔍 تتبع حالة طلبي</span>
              </button>
            )}

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#39f77e] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>تفعيل فوري خلال 1-5 دقائق</span>
              </div>
              <div className="text-[11px] text-slate-400">عبر تذكرة الديسكورد (#store-tickets)</div>
            </div>

            <a
              href="https://discord.gg/dq36cMFef"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-all shadow-sm"
              title="فتح تذكرة دعم بالديسكورد"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ticket Support</span>
            </a>
          </div>
        </div>

        {/* Store Control & Status Bar */}
        <div className="mb-10 bg-[#0c121d]/90 border border-[#00d2ff]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          {/* Real Live Purchases ticker */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${realOrders.length > 0 ? 'bg-[#39f77e] animate-pulse' : 'bg-slate-500'}`} />
              <span>آخر المشتريات الحقيقية:</span>
            </span>

            {realOrders.length > 0 ? (
              <div className="flex items-center gap-3">
                {realOrders.slice(0, 5).map((order) => (
                  <div key={order.orderId} className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5 shrink-0">
                    <img 
                      src={`https://mc-heads.net/avatar/${encodeURIComponent(order.player)}/32`} 
                      alt={order.player} 
                      className="w-4 h-4 rounded-sm" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/32';
                      }}
                    />
                    <span className="text-slate-300 font-semibold">{order.player}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[#00d2ff] font-bold">{order.package}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      order.status === 'accepted' 
                        ? 'text-emerald-400 bg-emerald-500/15' 
                        : 'text-amber-300 bg-amber-500/15'
                    }`}>
                      {order.status === 'accepted' ? 'تم التفعيل ✅' : 'قيد المراجعة ⏳'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 bg-slate-900/60 px-3 py-1 rounded-lg border border-white/5">
                <span className="text-xs text-slate-400">
                  لا توجد مشتريات مسجلة حالياً • العمليات مربوطة بسيرفر حقيقي وبدون بيانات وهمية
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons & Currency Selector */}
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5 text-xs font-bold">
              <button
                onClick={() => setCurrencyMode('both')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  currencyMode === 'both' ? 'bg-[#00d2ff] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل ($/ج.م)
              </button>
              <button
                onClick={() => setCurrencyMode('egp')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  currencyMode === 'egp' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ج.م EGP
              </button>
              <button
                onClick={() => setCurrencyMode('usd')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  currencyMode === 'usd' ? 'bg-[#0070ba] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              onClick={() => onCopyText('/buy', 'Copied command "/buy" to clipboard!')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold transition-colors"
              title="Copy in-game store command"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span><strong>/buy</strong></span>
            </button>

            <button
              onClick={onOpenBrowser}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 text-[#00d2ff] border border-[#00d2ff]/30 text-xs font-bold transition-all shadow-sm"
              title="Open embedded CraftingStore viewer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Webstore</span>
            </button>

            <button
              onClick={onOpenConfig}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Store Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          <button
            onClick={() => setActiveCategory('ranks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeCategory === 'ranks'
                ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] shadow-[0_0_20px_rgba(0,210,255,0.3)]'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-[#00d2ff]/40'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>رتب السيرفر (Ranks)</span>
          </button>

          <button
            onClick={() => setActiveCategory('keys')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeCategory === 'keys'
                ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] shadow-[0_0_20px_rgba(0,210,255,0.3)]'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-[#00d2ff]/40'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>مفاتيح الصناديق (Keys)</span>
          </button>

          <button
            onClick={() => setActiveCategory('coins')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeCategory === 'coins'
                ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] shadow-[0_0_20px_rgba(0,210,255,0.3)]'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-[#00d2ff]/40'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>الكوينز والمضاعفات</span>
          </button>

          <button
            onClick={() => setActiveCategory('cosmetics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeCategory === 'cosmetics'
                ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] shadow-[0_0_20px_rgba(0,210,255,0.3)]'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-[#00d2ff]/40'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>المؤثرات والتأثيرات</span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => (
            <article
              key={pkg.id}
              className={`relative bg-[#0f1624]/80 border rounded-2xl p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,162,255,0.22)] ${
                pkg.popular
                  ? 'border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-[0_0_30px_rgba(0,210,255,0.18)]'
                  : 'border-[#00d2ff]/20 hover:border-[#00d2ff]/50'
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] text-[11px] font-black uppercase tracking-wider py-0.5 px-3 rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>الأكثر طلباً • Most Popular</span>
                </div>
              )}

              <div>
                {/* Tier Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5"
                    style={{ color: pkg.color }}
                  >
                    {getRankIcon(pkg.tier)}
                    {pkg.tier || pkg.category}
                  </span>
                </div>

                {/* Package Name */}
                <h3 className="text-2xl font-black text-white mb-2.5 tracking-wide">
                  {pkg.name}
                </h3>

                {/* Price Display */}
                <div className="mb-5">
                  {currencyMode === 'egp' ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-rose-400">{pkg.egpPrice}</span>
                      <span className="text-xs text-slate-400">فودافون كاش</span>
                    </div>
                  ) : currencyMode === 'usd' ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-white">{pkg.price}</span>
                      <small className="text-slate-400 text-xs font-semibold uppercase">{pkg.currency}</small>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-white">{pkg.price}</span>
                        <small className="text-slate-400 text-xs font-semibold uppercase">{pkg.currency}</small>
                      </div>
                      <div className="inline-block mt-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-extrabold px-2.5 py-0.5 rounded-md">
                        🇪🇬 {pkg.egpPrice} فودافون كاش
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 text-slate-300 text-sm">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button: Opens the Vodafone Cash & PayPal checkout modal */}
              <div>
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-sm transition-all duration-200 cursor-pointer ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:shadow-[0_0_30px_rgba(0,210,255,0.5)]'
                      : 'border border-[#00d2ff]/30 text-white bg-gradient-to-br from-[#00d2ff]/15 to-[#0080ff]/05 hover:border-[#00d2ff] hover:shadow-[0_0_25px_rgba(0,210,255,0.25)]'
                  }`}
                >
                  <span>شراء الآن • Pay Now</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Guarantees & Features */}
        <div className="mt-14 p-6 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#39f77e]" />
              <span>تحويل سريع ومجاني عبر فودافون كاش</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#39f77e]" />
              <span>متجر CraftingStore للبطاقات الدولية</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#39f77e]" />
              <span>تفعيل فوري خلال 1-5 دقائق عبر الديسكورد</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#39f77e]" />
              <span>حماية كاملة وخصوصية 100%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500">متجر إلكتروني:</span>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d2ff] font-mono hover:underline flex items-center gap-1"
            >
              <span>{storeUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
