import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, User, Gift, Monitor, Smartphone, ShoppingCart, 
  ArrowRight, ShieldCheck, CreditCard, Send, MessageSquare, 
  ExternalLink, Sparkles, AlertCircle, RefreshCw, Lock, CheckCircle2,
  PhoneCall, Hash, Crown, Headphones, Settings, Upload, Image as ImageIcon,
  Trash2, Eye, Download
} from 'lucide-react';
import { StorePackage, StoreOrder } from '../types';
import { submitOrder, fetchClientIp } from '../services/api';

interface CraftingStoreCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: StorePackage | null;
  storeUrl: string;
  onCopyText: (text: string, message?: string) => void;
  onOpenTracker?: () => void;
}

export type PaymentMethod = 'vodafone' | 'craftingstore';

// Server owner & staff contacts
const OWNER_DISCORD = 'el_joker_.'; // المالك ومسؤول الرتب والدفع
const CO_OWNER_DISCORD = 'filstiny_'; // المالك والمسؤول العام
const STAFF_DISCORD_1 = '_palto_';
const STAFF_DISCORD_2 = 'sjad__';

const VODAFONE_NUMBER = '01091905797';
const DISCORD_SERVER_URL = 'https://discord.gg/vUCeFXeUH';
const TICKET_SUPPORT_URL = 'https://discord.gg/dq36cMFef';

/**
 * Process and optionally compress receipt image to clean Base64
 */
const processImageFile = (file: File): Promise<{ base64: string; sizeText: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المرفوع يجب أن يكون صورة صالحة (PNG أو JPG أو WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('فشل قراءة ملف الصورة'));
        return;
      }

      // If file is already smaller than 1.5MB, resolve directly
      if (file.size < 1.5 * 1024 * 1024) {
        const sizeText = file.size > 1024 ? `${Math.round(file.size / 1024)} KB` : `${file.size} B`;
        resolve({ base64: result, sizeText });
        return;
      }

      // Scale down large photos using HTML5 Canvas to prevent excessive payload size
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1800;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64: result, sizeText: `${Math.round(file.size / 1024)} KB` });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
        const estSize = Math.round((compressedBase64.length * 3) / 4 / 1024);
        resolve({ base64: compressedBase64, sizeText: `${estSize} KB` });
      };
      img.onerror = () => {
        resolve({ base64: result, sizeText: `${Math.round(file.size / 1024)} KB` });
      };
      img.src = result;
    };
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة'));
    reader.readAsDataURL(file);
  });
};

export const CraftingStoreCheckoutModal: React.FC<CraftingStoreCheckoutModalProps> = ({
  isOpen,
  onClose,
  pkg,
  storeUrl,
  onCopyText,
  onOpenTracker,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vodafone');
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState<'java' | 'bedrock'>('java');
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Player information for Vodafone Cash transfer
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Payment proof / Receipt attachment state
  const [paymentProofBase64, setPaymentProofBase64] = useState('');
  const [paymentProofName, setPaymentProofName] = useState('');
  const [paymentProofSize, setPaymentProofSize] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [clientIp, setClientIp] = useState('127.0.0.1');

  // Step state: 1 = Enter IGN & Phone, 2 = Transfer Instructions & Confirmation
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);

  // Final Order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  // Webhook for sending directly to #passcode in Discord
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('vortex_discord_passcode_webhook') || '';
  });
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [showWebhookSetup, setShowWebhookSetup] = useState(false);
  const [tempWebhookInput, setTempWebhookInput] = useState('');
  const [webhookSavedNotice, setWebhookSavedNotice] = useState(false);

  // Dynamic Security Passcode generator - guarantees 100% unique, changing codes on every trigger
  const generateDynamicSecurityCodes = () => {
    const timeComponent = Date.now().toString(36).toUpperCase().slice(-4);
    const randAlpha = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const randPin = Math.floor(1000 + Math.random() * 9000);

    const newOrderId = `VTX-VC-${timeComponent}-${randDigits}`;
    const newPasscode = `PASS-${randPin}-${randAlpha}`;

    setOrderId(newOrderId);
    setSecurityPin(newPasscode);
    return { newOrderId, newPasscode };
  };

  const handleRegenerateCode = () => {
    const { newPasscode } = generateDynamicSecurityCodes();
    onCopyText(newPasscode, `تم توليد كود أمان جديد: ${newPasscode}`);
  };

  // Fetch client IP
  useEffect(() => {
    fetchClientIp().then((ip) => {
      if (ip) setClientIp(ip);
    });
  }, []);

  // Default to stored username if available
  useEffect(() => {
    const savedName = localStorage.getItem('vortex_mc_ign');
    if (savedName) {
      setUsername(savedName);
    }
  }, []);

  // Generate unique order ID whenever modal opens for a package
  useEffect(() => {
    if (isOpen && pkg) {
      setCheckoutStep(1);
      setOrderSubmitted(false);
      setIsSubmitting(false);
      setTransactionRef('');
      setWebhookStatus('idle');
      setPaymentProofBase64('');
      setPaymentProofName('');
      setPaymentProofSize('');
      setImageError(null);
      setShowReceiptPreview(false);

      // Generate a fresh dynamic passcode on every modal open
      generateDynamicSecurityCodes();
    }
  }, [isOpen, pkg?.id]);

  if (!isOpen || !pkg) return null;

  // Clean username for Bedrock or Java
  const effectivePlayerName = platform === 'bedrock' && username && !username.startsWith('.') && !username.startsWith('*')
    ? `.${username}`
    : username;

  const targetPlayer = isGift ? giftRecipient : effectivePlayerName;

  // Calculate numeric EGP value for dial code
  const numericEgp = parseInt(pkg.egpPrice.replace(/\D/g, ''), 10) || Math.round(pkg.numericPrice * 50);
  const vodafoneUssdCode = `*9*7*${VODAFONE_NUMBER}*${numericEgp}#`;
  const dialUrl = `tel:${encodeURIComponent(vodafoneUssdCode)}`;

  const handleCopyUssdCode = () => {
    onCopyText(vodafoneUssdCode, `تم نسخ كود التحويل السريع: ${vodafoneUssdCode}`);
  };

  const handleCopyVodafoneNumber = () => {
    onCopyText(VODAFONE_NUMBER, `تم نسخ رقم فودافون كاش: ${VODAFONE_NUMBER}`);
  };

  const handleCopyUser = (discordUser: string, roleTitle: string) => {
    onCopyText(discordUser, `تم نسخ يوزر ديسكورد (${roleTitle}): ${discordUser}`);
    setCopiedTarget(discordUser);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  // Payment proof file handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('الملف المرفوع يجب أن يكون صورة صالحة (PNG أو JPG أو WebP)');
      return;
    }
    setImageError(null);
    setIsProcessingImage(true);

    try {
      const result = await processImageFile(file);
      setPaymentProofBase64(result.base64);
      setPaymentProofName(file.name);
      setPaymentProofSize(result.sizeText);
    } catch (err: any) {
      setImageError(err?.message || 'حدث خطأ أثناء معالجة صورة الإيصال');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveReceipt = () => {
    setPaymentProofBase64('');
    setPaymentProofName('');
    setPaymentProofSize('');
    setImageError(null);
    const input = document.getElementById('paymentProof') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  // Step 1 validation to proceed to transfer screen
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (selectedMethod === 'vodafone') {
      const cleanPhone = senderPhone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        alert('يرجى إدخال رقم هاتفك المحول منه بشكل صحيح (مثال: 01012345678)');
        return;
      }
      // Re-generate a fresh dynamic code for this checkout step
      generateDynamicSecurityCodes();
      setCheckoutStep(2);
    } else {
      // CraftingStore external webstore
      window.open(storeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Final Order Submission
  const handleFinalConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return;
    localStorage.setItem('vortex_mc_ign', username.trim());

    setIsSubmitting(true);

    // Generate a fresh unique passcode for this finalized order
    const { newOrderId, newPasscode } = generateDynamicSecurityCodes();

    // Compute rank command e.g. lp user {username} parent add mvp
    const p = (targetPlayer || 'Player').trim();
    const cleanPkg = (pkg.tier || pkg.name || '').toLowerCase();
    let rank = 'vip';
    if (cleanPkg.includes('mvp+')) rank = 'mvpplus';
    else if (cleanPkg.includes('mvp')) rank = 'mvp';
    else if (cleanPkg.includes('vip+')) rank = 'vipplus';
    else if (cleanPkg.includes('vip')) rank = 'vip';
    else if (cleanPkg.includes('vortex')) rank = 'vortex';
    else if (cleanPkg.includes('titan')) rank = 'titan';
    else if (cleanPkg.includes('hero')) rank = 'hero';
    else if (cleanPkg.includes('legend')) rank = 'legend';
    else rank = cleanPkg.replace(/[^a-z0-9_]/g, '') || 'vip';
    const rankCommand = `lp user ${p} parent add ${rank}`;

    // Save real order to backend server and local storage
    const orderData: StoreOrder = {
      orderId: newOrderId,
      securityPin: newPasscode,
      package: pkg.name,
      tier: pkg.tier || pkg.category,
      priceEgp: pkg.egpPrice,
      priceUsd: pkg.price,
      paymentMethod: 'فودافون كاش (تحويل مباشر)',
      player: targetPlayer,
      platform,
      senderPhone: senderPhone.trim(),
      transactionRef: transactionRef.trim() || 'في انتظار المراجعة والتسليم',
      adminRecipient: OWNER_DISCORD,
      timestamp: new Date().toLocaleString(),
      status: 'pending',
      paymentProof: paymentProofBase64 || undefined,
      paymentProofName: paymentProofName || undefined,
      clientIp: clientIp || '127.0.0.1',
      rankCommand,
    };

    try {
      await submitOrder(orderData);
    } catch (e) {
      console.error('Failed to submit order', e);
    }

    // Try posting to Discord Webhook for #passcode channel if configured
    const activeWebhook = webhookUrl.trim() || localStorage.getItem('vortex_discord_passcode_webhook');
    if (activeWebhook) {
      setWebhookStatus('sending');
      try {
        const payload = {
          content: `🛡️ **[VortexMC - إثبات كود الأمان وإيصال الدفع في #passcode]**\n👑 **موجه مباشرة إلى مسؤول الرتب والدفع:** <@${OWNER_DISCORD}> (@${OWNER_DISCORD})\n🛡️ **إدارة السيرفر:** @${CO_OWNER_DISCORD}\n🔑 كود الأمان: **\`${newPasscode}\`** | 👤 اللاعب: **${targetPlayer}** (${platform.toUpperCase()}) | 💰 المبلغ: **${pkg.egpPrice}**\n📸 صورة إيصال التحويل مرفقة بالأسفل 👇`,
          embeds: [
            {
              title: `🛡️ [VortexMC - إثبات كود الأمان وإيصال الدفع في #passcode]`,
              description: `تم إرسال طلب تفعيل رتبة جديد مع صورة إيصال التحويل المرفقة أدناه. يرجى من مسؤول الرتب والدفع (**@${OWNER_DISCORD}**) مطابقة كود الأمان وصورة الإيصال مع تحويل فودافون كاش وتفعيل الرتبة للاعب فوراً في روم **#passcode**.`,
              color: 0x00d2ff,
              fields: [
                { name: '🔑 كود الأمان (Passcode)', value: `\`\`\`${newPasscode}\`\`\``, inline: false },
                { name: '📌 كود العملية الفريد', value: `\`${newOrderId}\``, inline: true },
                { name: '👤 اسم اللاعب (IGN)', value: `**${targetPlayer}** (${platform.toUpperCase()})`, inline: true },
                { name: '📦 الرتبة المطلوبة', value: `**${pkg.name}** (${pkg.tier || pkg.category})`, inline: true },
                { name: '💰 المبلغ المحول', value: `**${pkg.egpPrice}**`, inline: true },
                { name: '📱 رقم الهاتف المحول منه', value: `\`${senderPhone}\``, inline: true },
                { name: '🔢 رقم الحوالة/العملية', value: `\`${transactionRef || 'تم إرسال الحوالة كاش'}\``, inline: true },
                { name: '🌐 عنوان IP المشتري', value: `\`${clientIp || '127.0.0.1'}\``, inline: true },
                { 
                  name: '🧾 صورة الإيصال المرفقة', 
                  value: paymentProofBase64 
                    ? '✅ مرفق صورة الإيصال بالكامل أدناه' 
                    : '⚠️ لم يرفق صورة إيصال', 
                  inline: true 
                },
                { name: '👑 موجه مباشرة إلى مسؤول الرتب والدفع', value: `@${OWNER_DISCORD}`, inline: true },
                { name: '🛡️ إدارة السيرفر', value: `@${CO_OWNER_DISCORD}`, inline: true },
                { name: '💬 قناة السيرفر وروم الإثبات', value: `https://discord.gg/vUCeFXeUH (#passcode)`, inline: false },
                { name: '⚡ أمر تفعيل الرتبة للكونسول', value: `\`\`\`${rankCommand}\`\`\``, inline: false },
              ],
              footer: { text: `VortexMC Store Security • روم #passcode • إيصال فودافون كاش المرفق` },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        let dispatched = false;
        // First attempt: via server proxy /api/discord/webhook (handles multipart attachments safely)
        try {
          const proxyRes = await fetch('/api/discord/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webhookUrl: activeWebhook,
              payloadJson: payload,
              imageBase64: paymentProofBase64 || undefined,
              imageName: paymentProofName || `receipt_${newOrderId}.png`,
            }),
          });
          if (proxyRes.ok) {
            dispatched = true;
          }
        } catch {
          // fallback to client-side dispatch
        }

        // Second attempt: direct client fetch if proxy didn't dispatch
        if (!dispatched) {
          if (paymentProofBase64) {
            const match = paymentProofBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            const base64Data = match ? match[2] : paymentProofBase64;
            const mimeType = match ? match[1] : 'image/png';
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            const payloadCopy = JSON.parse(JSON.stringify(payload));
            payloadCopy.embeds[0].image = { url: 'attachment://receipt.png' };

            const fd = new FormData();
            fd.append('files[0]', blob, 'receipt.png');
            fd.append('payload_json', JSON.stringify(payloadCopy));

            const directRes = await fetch(activeWebhook, {
              method: 'POST',
              body: fd,
            });
            if (directRes.ok) dispatched = true;
          } else {
            const directRes = await fetch(activeWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (directRes.ok) dispatched = true;
          }
        }

        if (dispatched) {
          setWebhookStatus('sent');
        } else {
          setWebhookStatus('failed');
        }
      } catch (err) {
        console.error('Webhook dispatch error:', err);
        setWebhookStatus('failed');
      }
    } else {
      setWebhookStatus('idle');
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSubmitted(true);
    }, 700);
  };

  // Receipt image link if hosted/accessible
  const receiptDirectUrl = typeof window !== 'undefined' && orderId
    ? `${window.location.origin}/api/orders/${orderId}/receipt-image`
    : '';

  const receiptProofLine = paymentProofBase64
    ? `📸 صورة إيصال التحويل: مرفقة بالصورة (اضغط Ctrl+V في الديسكورد للصقها)\n🔗 رابط فحص الإيصال: ${receiptDirectUrl}`
    : `📸 صورة إيصال التحويل: تم إرسال الحوالة كاش (بدون إرفاق صورة)`;

  // Pre-formatted message addressed directly to #passcode and el_joker_.
  const passcodeDiscordMessage = `🛡️ [VortexMC - إثبات كود الأمان في #passcode]
🔑 كود الأمان (Passcode): ${securityPin}
📌 كود العملية الفريد: ${orderId}
👤 اسم اللاعب (IGN): ${targetPlayer} (${platform.toUpperCase()})
📦 الرتبة المطلوبة: ${pkg.name} (${pkg.tier || pkg.category})
💰 المبلغ المحول: ${pkg.egpPrice}
📱 رقم الهاتف المحول منه: ${senderPhone}
🔢 رقم الحوالة/العملية: ${transactionRef || 'تم إرسال الحوالة كاش'}
${receiptProofLine}
------------------------------------
👑 موجه مباشرة إلى مسؤول الرتب والدفع: @${OWNER_DISCORD}
🛡️ إدارة السيرفر: @${CO_OWNER_DISCORD}
💬 السيرفر وروم الإثبات: https://discord.gg/vUCeFXeUH (#passcode)
✅ تم التحويل عبر فودافون كاش، يرجى مطابقة كود الأمان وتفعيل الرتبة للاعب فوراً.`;

  const handleSendToPasscodeChannel = () => {
    onCopyText(
      passcodeDiscordMessage, 
      paymentProofBase64 
        ? `تم نسخ كود الأمان ورسالة الطلب! الصقها الآن في روم #passcode، ويمكنك أيضاً نسخ صورة الإيصال بالزر المخصص.`
        : `تم نسخ كود الأمان ورسالة الطلب! الصقها الآن في روم #passcode.`
    );
  };

  // Copy receipt image blob to clipboard so user can press Ctrl+V in Discord
  const handleCopyReceiptImage = async () => {
    if (!paymentProofBase64) {
      onCopyText('', '⚠️ لم يتم إرفاق صورة إيصال في هذا الطلب.');
      return;
    }
    try {
      const res = await fetch(paymentProofBase64);
      const blob = await res.blob();
      let pngBlob = blob;
      if (blob.type !== 'image/png') {
        const img = new Image();
        img.src = paymentProofBase64;
        await new Promise((resolve) => { img.onload = resolve; });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const converted = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (converted) pngBlob = converted;
      }

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
          }),
        ]);
        onCopyText('', '✅ تم نسخ صورة الإيصال للحافظة بنجاح! افتح الديسكورد واضغط Ctrl+V للصقها مباشرة.');
      } else {
        onCopyText('', '⚠️ متصفحك لا يدعم نسخ الصور مباشرة، اضغط زر "تحميل الإيصال" لإرفاق الصورة.');
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      onCopyText('', 'تعذر نسخ الصورة، اضغط زر "تحميل الإيصال" لإرفاق الصورة يدوياً.');
    }
  };

  // Download receipt image file
  const handleDownloadReceiptImage = () => {
    if (!paymentProofBase64) return;
    const a = document.createElement('a');
    a.href = paymentProofBase64;
    a.download = `vortex_receipt_${orderId || 'proof'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onCopyText('', '📥 تم بدء تحميل صورة الإيصال.');
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = tempWebhookInput.trim();
    if (cleanUrl) {
      localStorage.setItem('vortex_discord_passcode_webhook', cleanUrl);
      setWebhookUrl(cleanUrl);
      setWebhookSavedNotice(true);
      setTimeout(() => setWebhookSavedNotice(false), 3000);
      setShowWebhookSetup(false);
      onCopyText('', 'تم حفظ رابط Webhook لروم #passcode بنجاح!');
    }
  };

  const avatarSrc = targetPlayer.trim() && !avatarError
    ? `https://mc-heads.net/avatar/${encodeURIComponent(targetPlayer.replace(/^[.*]/, ''))}/70`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#0b101b] border border-[#00d2ff]/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,210,255,0.22)] text-white my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors z-10"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d2ff]/20 to-[#0080ff]/10 border border-[#00d2ff]/30 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-6 h-6 text-[#00d2ff]" />
              </div>
              <div className="pr-8">
                <div className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                  <span>VortexMC Store Checkout</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-rose-400 font-semibold">فودافون كاش مجاناً</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  شراء رتبة {pkg.name}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  كود عملية فريد لكل معاملة يتم إرساله مباشرة للإدارة على ديسكورد (<span className="text-amber-400 font-mono font-bold">@{OWNER_DISCORD}</span>).
                </p>
              </div>
            </div>

            {/* Selected Package Summary Box */}
            <div className="p-4 rounded-2xl bg-[#121a2a]/90 border border-[#00d2ff]/20 mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: pkg.color }}>
                  {pkg.tier || pkg.category}
                </div>
                <div className="font-extrabold text-lg text-white">{pkg.name}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#39f77e]" />
                  <span>تفعيل فوري خلال دقائق بواسطة الأدمن: <strong className="text-amber-400">{OWNER_DISCORD}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#39f77e]">{pkg.egpPrice}</div>
                <div className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md mt-0.5">
                  {pkg.price} USD
                </div>
              </div>
            </div>

            {/* STEP 1: Enter Player Info */}
            {checkoutStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Minecraft Username & Platform */}
                <div className="bg-[#0f1726]/80 p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      1. اسم حسابك في ماين كرافت (Minecraft IGN)
                    </label>
                    {/* Platform switch */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPlatform('java')}
                        className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          platform === 'java' ? 'bg-[#00d2ff] text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Java</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlatform('bedrock')}
                        className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          platform === 'bedrock' ? 'bg-[#00d2ff] text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Bedrock</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setAvatarError(false);
                        }}
                        placeholder="اكتب اسمك في اللعبة (مثال: Steve أو Notch)"
                        className="w-full bg-[#131c2d] border border-white/10 focus:border-[#00d2ff] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>

                    {/* Skin Avatar Preview */}
                    <div 
                      className="w-11 h-11 rounded-xl bg-slate-900 border border-[#00d2ff]/30 overflow-hidden shrink-0 flex items-center justify-center shadow-inner"
                      title="Minecraft skin preview"
                    >
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={targetPlayer}
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {username.trim() && (
                    <div className="flex items-center gap-1.5 text-xs text-[#39f77e]">
                      <Check className="w-3.5 h-3.5" />
                      <span>سيتم تسليم الرتبة للحساب: <strong>{effectivePlayerName}</strong></span>
                    </div>
                  )}

                  {/* Gift Option */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsGift(!isGift)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#00d2ff] transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5 text-[#00d2ff]" />
                      <span>{isGift ? 'شراء كهدية لصديق (مفعل)' : 'هل ترغب في إهداء هذه الرتبة لصديق؟'}</span>
                    </button>

                    {isGift && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={giftRecipient}
                          onChange={(e) => setGiftRecipient(e.target.value)}
                          placeholder="أدخل اسم حساب صديقك في ماين كرافت بدقة"
                          className="w-full bg-[#131c2d] border border-[#00d2ff]/40 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Choose Payment Method */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    2. اختر طريقة الدفع
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Vodafone Cash */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('vodafone')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        selectedMethod === 'vodafone'
                          ? 'border-rose-500 bg-rose-500/15 text-white shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/50'
                          : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-rose-500/30'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1 text-base">
                        📱
                      </div>
                      <span className="text-xs font-bold">فودافون كاش (مصر)</span>
                      <span className="text-[11px] text-rose-300 font-bold mt-0.5">{pkg.egpPrice}</span>
                      <span className="text-[10px] text-[#39f77e] mt-0.5 font-medium">بدون أي عمولات إضافية</span>
                    </button>

                    {/* CraftingStore Global Cards */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('craftingstore')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        selectedMethod === 'craftingstore'
                          ? 'border-[#00d2ff] bg-[#00d2ff]/15 text-white shadow-[0_0_20px_rgba(0,210,255,0.25)] ring-1 ring-[#00d2ff]/50'
                          : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-[#00d2ff]/30'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center mb-1">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">بطاقات دولية / متجر</span>
                      <span className="text-[11px] text-[#00d2ff] font-bold mt-0.5">{pkg.price}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Visa / Mastercard</span>
                    </button>
                  </div>
                </div>

                {/* Player's phone number */}
                {selectedMethod === 'vodafone' && (
                  <div className="bg-[#0f1726]/80 p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      رقم الهاتف الذي ستقوم بالتحويل منه <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="010XXXXXXXX (رقم محفظتك)"
                      maxLength={11}
                      className="w-full bg-[#131c2d] border border-rose-500/30 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-400">
                      💡 هذا الرقم ضروري للأدمن <span className="text-amber-400 font-mono">@{OWNER_DISCORD}</span> لمطابقة رسالة الاستلام وتفعيل رتبتك فوراً.
                    </p>
                  </div>
                )}

                {/* Unique Code Preview Badge */}
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>كود العملية المخصص لك:</span>
                  </span>
                  <span className="font-mono font-bold text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded">
                    {orderId}
                  </span>
                </div>

                {/* Proceed Button */}
                <button
                  type="submit"
                  disabled={!username.trim() || (selectedMethod === 'vodafone' && !senderPhone.trim())}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white font-black text-sm shadow-[0_0_25px_rgba(244,63,94,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>متابعة لبيانات التحويل السريع ({pkg.egpPrice})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Transfer Instructions for Vodafone Cash */}
            {checkoutStep === 2 && (
              <form onSubmit={handleFinalConfirmOrder} className="space-y-4">
                <div className="bg-gradient-to-b from-rose-950/25 to-slate-900/90 p-4 sm:p-5 rounded-2xl border border-rose-500/40 space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-white">خطوات تحويل فودافون كاش:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[#39f77e] bg-[#39f77e]/10 px-2.5 py-1 rounded-lg">
                        المطلوب: {pkg.egpPrice}
                      </span>
                    </div>
                  </div>

                  {/* Direct USSD Dial Code Card */}
                  <div className="bg-[#090e17] p-3.5 sm:p-4 rounded-2xl border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">الطريقة الأولى: كود الاتصال السريع من هاتفك</span>
                      <span className="text-[10px] text-[#39f77e] font-semibold bg-[#39f77e]/10 px-2 py-0.5 rounded">الأسرع ⚡</span>
                    </div>
                    
                    <div className="bg-slate-950 p-3 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <code className="text-[#00d2ff] font-mono font-black text-sm sm:text-base tracking-wider text-center sm:text-left w-full sm:w-auto">
                        {vodafoneUssdCode}
                      </code>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={dialUrl}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                          title="فتح لوحة الاتصال في الهاتف"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>اتصال من الهاتف</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyUssdCode}
                          className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors shrink-0"
                        >
                          نسخ الكود
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>تنبيه هام:</strong> الموقع لا يسحب رصيدك تلقائياً. <strong>يجب أن تطلب الكود أعلاه من هاتفك</strong> وتدخل الرقم السري لمحفظتك ليصل المبلغ لحساب السيرفر.
                      </div>
                    </div>
                  </div>

                  {/* Ana Vodafone App Alternative */}
                  <div className="bg-[#090e17] p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">الطريقة الثانية: تطبيق Ana Vodafone</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">رقم فودافون كاش للسيرفر:</span>
                        <span className="text-rose-400 font-mono font-black text-sm">{VODAFONE_NUMBER}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyVodafoneNumber}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                      >
                        نسخ الرقم
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Passcode Preview & Generator */}
                  <div className="bg-gradient-to-r from-[#00d2ff]/10 via-slate-900 to-[#5865F2]/10 p-3.5 rounded-2xl border border-[#00d2ff]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#00d2ff]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>كود الأمان لروم #passcode:</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                        title="توليد كود أمان جديد تماماً"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>🔄 تغيير كود الأمان</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-white/10 font-mono text-sm">
                      <span className="text-emerald-400 font-black tracking-wider text-base">{securityPin}</span>
                      <span className="text-[10px] text-slate-400 font-sans">كود فريد يتغير مع كل ضغطة</span>
                    </div>
                  </div>

                  {/* Transaction Ref Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      رقم العملية / الحوالة من رسالة فودافون (اختياري لتسريع التفعيل)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="مثال: 9482910"
                      className="w-full bg-[#131c2d] border border-white/15 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                    />
                  </div>

                  {/* Payment Proof / Receipt Attachment Box */}
                  <div className="bg-[#090e17] p-3.5 sm:p-4 rounded-2xl border border-rose-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="paymentProof" className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <ImageIcon className="w-4 h-4 text-rose-400" />
                        <span>إرفاق إيصال الدفع / الفاتورة (سكرين شوت)</span>
                      </label>
                      {paymentProofBase64 ? (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تم إرفاق الإيصال بنجاح</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                          موصى به للتأكيد الفوري
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      يرجى إرفاق صورة/سكرين شوت لإيصال التحويل لتأكيد العملية
                    </p>

                    {/* The requested input element */}
                    <input
                      type="file"
                      accept="image/*"
                      id="paymentProof"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!paymentProofBase64 ? (
                      <label
                        htmlFor="paymentProof"
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleProcessFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          isDragging
                            ? 'border-rose-400 bg-rose-500/10'
                            : 'border-white/15 hover:border-rose-500/50 bg-slate-950/60 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
                          {isProcessingImage ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-white text-center">
                          {isProcessingImage ? 'جاري معالجة وضغط صورة الإيصال...' : 'اضغط لاختيار صورة الإيصال أو اسحبها هنا'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          يدعم PNG, JPG, JPEG, WebP (يتم التحويل التلقائي إلى Base64)
                        </div>
                      </label>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            onClick={() => setShowReceiptPreview(true)}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/20 bg-black cursor-pointer group shrink-0"
                            title="اضغط لمعاينة الإيصال بحجم كامل"
                          >
                            <img
                              src={paymentProofBase64}
                              alt="Payment Receipt Preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate" title={paymentProofName}>
                              {paymentProofName || 'receipt_proof.jpg'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>{paymentProofSize}</span>
                              <span className="text-emerald-400 font-bold">• تم حفظ الإيصال بنجاح</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowReceiptPreview(true)}
                              className="text-[10px] text-[#00d2ff] hover:underline font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>معاينة الإيصال بالحجم الكامل</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <label
                            htmlFor="paymentProof"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="تغيير الصورة"
                          >
                            <Upload className="w-4 h-4" />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveReceipt}
                            className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {imageError && (
                      <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{imageError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="terms-confirm"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 rounded bg-slate-900 border-white/20 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="terms-confirm" className="text-xs text-slate-400 cursor-pointer select-none">
                    أؤكد أنني قمت بتحويل مبلغ {pkg.egpPrice} إلى محفظة السيرفر من رقمي {senderPhone}.
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !termsAccepted}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#39f77e] via-[#22c55e] to-[#16a34a] text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(57,247,126,0.35)] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>جاري إصدار كود الأمان وإرسال الإشعار...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم التحويل • إنشاء كود الأمان لروم #passcode</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* SUCCESS SCREEN */
          <div className="py-2 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#39f77e]/20 border border-[#39f77e]/40 mx-auto flex items-center justify-center text-[#39f77e] shadow-[0_0_30px_rgba(57,247,126,0.3)]">
              <Check className="w-7 h-7" />
            </div>

            <div>
              <div className="text-xs font-bold text-[#39f77e] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>تم تأكيد العملية وتوليد كود الأمان بنجاح!</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                طلب رتبة {pkg.name}
              </h3>
              <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                أرسل كود الأمان هذا مباشرة في روم <strong className="text-[#00d2ff] font-bold">#passcode</strong> في سيرفر الديسكورد للتفعيل الفوري.
              </p>
            </div>

            {/* Distinct Unique Dynamic Code Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00d2ff]/20 via-slate-900 to-[#5865F2]/20 border border-[#00d2ff]/40 max-w-md mx-auto shadow-[0_0_35px_rgba(0,210,255,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#00d2ff] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>كود الأمان لروم #passcode</span>
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                  title="اضغط لتوليد كود أمان جديد"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>توليد كود جديد</span>
                </button>
              </div>

              {/* Huge dynamic passcode */}
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#39f77e] tracking-widest py-1 bg-slate-950/80 rounded-xl border border-white/10 select-all">
                {securityPin}
              </div>

              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>كود العملية: <strong className="text-white font-mono">{orderId}</strong></span>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> كود فريد لا يتكرر
                </span>
              </div>
            </div>

            {/* Webhook notification status banner */}
            <div className="max-w-md mx-auto">
              {webhookStatus === 'sent' ? (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>✅ تم إرسال كود الأمان تلقائياً إلى روم #passcode في ديسكورد!</span>
                </div>
              ) : webhookStatus === 'sending' ? (
                <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                  <span>⏳ جاري إرسال كود الأمان إلى ديسكورد...</span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-900 border border-[#00d2ff]/30 text-xs text-slate-300 flex items-center justify-between gap-2 text-right">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>لإرسال الكود فوراً: اضغط الزر الأزرق أدناه لفتح روم <strong>#passcode</strong>.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-slate-400">اسم اللاعب (IGN):</span>
                <span className="font-bold text-white font-mono">{targetPlayer} ({platform.toUpperCase()})</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-slate-400">الرتبة:</span>
                <span className="font-bold text-emerald-400">{pkg.name}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-slate-400">المبلغ المحول:</span>
                <span className="font-bold text-[#39f77e]">{pkg.egpPrice}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-slate-400">رقم المحول:</span>
                <span className="font-mono text-slate-300">{senderPhone}</span>
              </div>
              {paymentProofBase64 && (
                <div className="pt-1.5 pb-1 border-b border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#00d2ff]" />
                      <span>إيصال الدفع الفعلي:</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> مرفق بالبرومبت والويبهوك
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowReceiptPreview(true)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#00d2ff]/40 shadow-sm"
                        title="اضغط للتكبير"
                      >
                        <img
                          src={paymentProofBase64}
                          alt="إيصال الدفع"
                          className="w-12 h-12 object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                      <div className="text-right">
                        <div className="text-white font-bold text-[11px] truncate max-w-[140px]">
                          {paymentProofName || 'صورة الإيصال'}
                        </div>
                        <div className="text-[10px] text-slate-400">{paymentProofSizeText}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyReceiptImage}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="نسخ الصورة للحافظة للصقها في الديسكورد"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ الصورة (Ctrl+V)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadReceiptImage}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all cursor-pointer"
                        title="تحميل صورة الإيصال"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">المسؤول عن التفعيل:</span>
                <span className="font-bold text-amber-400 font-mono">@{OWNER_DISCORD}</span>
              </div>
            </div>

            {/* Leadership & Staff Contact Grid */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 max-w-md mx-auto text-xs">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>إدارة السيرفر المعتمدة للتفعيل:</span>
                <span className="text-[10px] text-[#00d2ff]">اضغط للنسخ 📋</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* filstiny_ */}
                <button
                  type="button"
                  onClick={() => handleCopyUser(OWNER_DISCORD, 'مسؤول الرتب والدفع')}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    copiedTarget === OWNER_DISCORD 
                      ? 'bg-[#39f77e]/20 border-[#39f77e]/50 text-[#39f77e]' 
                      : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-right">
                    <div className="text-[10px] text-amber-400 font-bold">👑 مسؤول الرتب والدفع</div>
                    <div className="font-mono font-bold text-xs">{OWNER_DISCORD}</div>
                  </div>
                  {copiedTarget === OWNER_DISCORD ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                </button>

                {/* el_joker_. */}
                <button
                  type="button"
                  onClick={() => handleCopyUser(CO_OWNER_DISCORD, 'المالك والمسؤول العام')}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    copiedTarget === CO_OWNER_DISCORD 
                      ? 'bg-[#39f77e]/20 border-[#39f77e]/50 text-[#39f77e]' 
                      : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">👑 المالك والمسؤول العام</div>
                    <div className="font-mono font-bold text-xs">{CO_OWNER_DISCORD}</div>
                  </div>
                  {copiedTarget === CO_OWNER_DISCORD ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                </button>

                {/* _palto_ */}
                <button
                  type="button"
                  onClick={() => handleCopyUser(STAFF_DISCORD_1, 'استاف')}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    copiedTarget === STAFF_DISCORD_1 
                      ? 'bg-[#39f77e]/20 border-[#39f77e]/50 text-[#39f77e]' 
                      : 'bg-slate-900 border-emerald-500/30 text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">⚔️ استاف</div>
                    <div className="font-mono font-bold text-xs">{STAFF_DISCORD_1}</div>
                  </div>
                  {copiedTarget === STAFF_DISCORD_1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                </button>

                {/* sjad__ */}
                <button
                  type="button"
                  onClick={() => handleCopyUser(STAFF_DISCORD_2, 'استاف')}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    copiedTarget === STAFF_DISCORD_2 
                      ? 'bg-[#39f77e]/20 border-[#39f77e]/50 text-[#39f77e]' 
                      : 'bg-slate-900 border-purple-500/30 text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">⚔️ استاف</div>
                    <div className="font-mono font-bold text-xs">{STAFF_DISCORD_2}</div>
                  </div>
                  {copiedTarget === STAFF_DISCORD_2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                </button>
              </div>
            </div>

            {/* Discord-Only Action Buttons for #passcode */}
            <div className="space-y-2 pt-1 max-w-md mx-auto">
              {/* Live Order Tracking Button */}
              {onOpenTracker && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTracker();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>🔍 تتبع حالة طلبك في سجل العمليات المباشر</span>
                </button>
              )}

              {/* Discord primary action to open server and copy #passcode text */}
              <a
                href={DISCORD_SERVER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSendToPasscodeChannel}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(88,101,242,0.4)] transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>🚀 فتح روم #passcode ولصق كود الأمان في ديسكورد</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Direct Ticket Support Button */}
              <a
                href={TICKET_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff]/20 to-[#5865F2]/20 hover:from-[#00d2ff]/30 hover:to-[#5865F2]/30 border border-[#00d2ff]/40 text-[#00d2ff] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
              >
                <Headphones className="w-4 h-4 text-[#00d2ff]" />
                <span>🎫 فتح تذكرة دعم بالديسكورد (Ticket Support)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Copy receipt image button if available */}
              {paymentProofBase64 && (
                <button
                  type="button"
                  onClick={handleCopyReceiptImage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🖼️ نسخ صورة الإيصال للديسكورد (اضغط Ctrl+V في الشات)</span>
                  <Copy className="w-3.5 h-3.5 opacity-70" />
                </button>
              )}

              {/* Copy passcode secondary button */}
              <button
                type="button"
                onClick={handleSendToPasscodeChannel}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#00d2ff]/30 text-[#00d2ff] font-bold text-xs transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>📋 نسخ رسالة كود الأمان المنسقة لروم #passcode</span>
              </button>

              {/* Automatic Discord Webhook Setting for el_joker_. */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowWebhookSetup(!showWebhookSetup)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>⚙️ إعداد الإرسال التلقائي المباشر لروم #passcode (Discord Webhook)</span>
                </button>

                {showWebhookSetup && (
                  <form onSubmit={handleSaveWebhook} className="mt-2 p-3 bg-slate-950 rounded-xl border border-white/15 text-right space-y-2 text-xs animate-in fade-in">
                    <div className="text-[11px] text-slate-300">
                      لإرسال كود الأمان آلياً بدون الحاجة للنسخ واللصق:
                      <ol className="list-decimal list-inside text-slate-400 mt-1 space-y-0.5 text-[10px]">
                        <li>في الديسكورد، افتح إعدادات روم <strong>#passcode</strong></li>
                        <li>اختر <strong>Integrations</strong> ثم <strong>Webhooks</strong> واضغط <strong>New Webhook</strong></li>
                        <li>انسخ رابط الويب هوك والصقه هنا:</li>
                      </ol>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={tempWebhookInput || webhookUrl}
                        onChange={(e) => setTempWebhookInput(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="flex-1 bg-[#131c2d] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#00d2ff]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#00d2ff] hover:bg-[#00b4dc] text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        حفظ
                      </button>
                    </div>
                    {webhookSavedNotice && (
                      <div className="text-emerald-400 text-[10px] font-bold">
                        ✅ تم حفظ الرابط بنجاح! سيتم إرسال الأكواد مباشرة لروم #passcode.
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-slate-400 text-center">
                🛡️ رابط السيرفر وروم الإثبات: <span className="font-mono text-white font-bold">{DISCORD_SERVER_URL}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إغلاق والعودة للمتجر
              </button>
            </div>
          </div>
        )}

        {/* Payment Receipt Full Lightbox Modal */}
        {showReceiptPreview && paymentProofBase64 && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md"
            onClick={() => setShowReceiptPreview(false)}
          >
            <div 
              className="relative max-w-3xl w-full max-h-[90vh] bg-[#0b101b] border border-[#00d2ff]/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#00d2ff]" />
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    صورة إيصال التحويل / الفاتورة
                  </h4>
                  {paymentProofSize && (
                    <span className="text-[11px] text-slate-400 font-mono">({paymentProofSize})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={paymentProofBase64}
                    download={paymentProofName || `receipt_${orderId || 'proof'}.jpg`}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    title="تحميل الصورة"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowReceiptPreview(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2 min-h-[250px] max-h-[70vh]">
                <img
                  src={paymentProofBase64}
                  alt="Payment Receipt"
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>اسم اللاعب: <strong className="text-white">{targetPlayer}</strong></span>
                <span>كود الأمان: <strong className="text-emerald-400 font-mono">{securityPin}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
