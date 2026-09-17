import React, { useState } from 'react';
import { 
  User, MessageSquare, Globe, Clock, ShieldCheck, ChevronRight, 
  ChevronLeft, CheckCircle2, AlertCircle, Sparkles, Send, Copy, 
  Check, Lock, ExternalLink, HelpCircle, Gamepad2, FileText, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { StaffApplication } from '../../types';
import { Language } from '../../translations';

interface StaffApplicationFormProps {
  onApplicationSubmit: (application: StaffApplication) => void;
  onBackToHome: () => void;
  onCopyText: (text: string, message?: string) => void;
  language?: Language;
}

export const StaffApplicationForm: React.FC<StaffApplicationFormProps> = ({
  onApplicationSubmit,
  onBackToHome,
  onCopyText,
  language = 'en',
}) => {
  const isAr = language === 'ar';

  // Current Step: 1, 2, 3, 4, or 5 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<StaffApplication | null>(null);
  const [copiedAppId, setCopiedAppId] = useState(false);

  // Form State
  // Step 1: Personal Info
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');

  // Step 2: Experience
  const [hasStaffExperience, setHasStaffExperience] = useState<'yes' | 'no'>('no');
  const [previousServers, setPreviousServers] = useState('');
  const [previousStaffRank, setPreviousStaffRank] = useState('');
  const [playingDuration, setPlayingDuration] = useState('');
  const [activeHoursPerDay, setActiveHoursPerDay] = useState('');

  // Step 3: Scenario & Staff Questions
  const [whyVortex, setWhyVortex] = useState('');
  const [whyChooseYou, setWhyChooseYou] = useState('');
  const [goodStaffDefinition, setGoodStaffDefinition] = useState('');
  const [handleToxicPlayer, setHandleToxicPlayer] = useState('');
  const [friendBrokeRules, setFriendBrokeRules] = useState('');
  const [accusationOfCheating, setAccusationOfCheating] = useState('');
  const [playerArgument, setPlayerArgument] = useState('');
  const [staffAbuse, setStaffAbuse] = useState('');

  // Step 4: Final
  const [contribution, setContribution] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [truthfulConfirmed, setTruthfulConfirmed] = useState(false);
  const [rulesAgreed, setRulesAgreed] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Avatar url with fallback
  const cleanedUsername = minecraftUsername.trim() || 'Steve';
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(cleanedUsername)}/80`;

  // Validate current step before proceeding (Minimum age 15y, 15+)
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!minecraftUsername.trim()) {
        newErrors.minecraftUsername = isAr
          ? 'اسمك في ماينكرافت مطلوب.'
          : 'Minecraft username is required.';
      } else if (!/^[a-zA-Z0-9_.]{3,16}$/.test(minecraftUsername.trim())) {
        newErrors.minecraftUsername = isAr
          ? 'يجب أن يكون اسم الحساب بين 3 إلى 16 حرفاً أو رقماً.'
          : 'Username must be between 3 and 16 characters.';
      }
      if (!discordUsername.trim()) {
        newErrors.discordUsername = isAr
          ? 'اسم حساب الديسكورد مطلوب للتواصل معك.'
          : 'Discord username is required so we can contact you.';
      }
      if (!age.trim()) {
        newErrors.age = isAr ? 'العمر مطلوب.' : 'Age is required.';
      } else {
        const numAge = parseInt(age, 10);
        if (isNaN(numAge) || numAge < 15) {
          newErrors.age = isAr
            ? 'شرط السن: يجب أن يكون عمرك 15 سنة فما فوق للتقديم (15+ سنة).'
            : 'Age requirement: You must be at least 15 years old (15+ years).';
        }
      }
      if (!country.trim()) {
        newErrors.country = isAr
          ? 'يرجى تحديد دولتك أو بلد الإقامة.'
          : 'Please enter your country of residence.';
      }
      if (!timezone.trim()) {
        newErrors.timezone = isAr
          ? 'يرجى تحديد منطقتك الزمنية أو التوقيت المحلي.'
          : 'Please enter your timezone.';
      }
    }

    if (step === 2) {
      if (hasStaffExperience === 'yes' && !previousServers.trim()) {
        newErrors.previousServers = isAr
          ? 'يرجى كتابة أسماء السيرفرات السابقة التي كنت إدارياً فيها.'
          : 'Please list the servers where you previously held a staff role.';
      }
      if (hasStaffExperience === 'yes' && !previousStaffRank.trim()) {
        newErrors.previousStaffRank = isAr
          ? 'يرجى تحديد الرتب الإدارية التي شغلتها سابقاً.'
          : 'Please specify the staff positions you held.';
      }
      if (!playingDuration.trim()) {
        newErrors.playingDuration = isAr
          ? 'يرجى إخبارنا منذ كم سنة تلعب ماينكرافت.'
          : 'Please tell us how long you have played Minecraft.';
      }
      if (!activeHoursPerDay.trim()) {
        newErrors.activeHoursPerDay = isAr
          ? 'يرجى كتابة عدد ساعات تواجدك اليومية في السيرفر.'
          : 'Please indicate your daily active hours.';
      }
    }

    if (step === 3) {
      if (whyVortex.trim().length < 15) {
        newErrors.whyVortex = isAr
          ? 'يرجى كتابة إجابة لا تقل عن 15 حرفاً توضح سبب رغبتك بالانضمام لفورتكس.'
          : 'Please write at least 15 characters explaining why you want to join VortexMC.';
      }
      if (whyChooseYou.trim().length < 15) {
        newErrors.whyChooseYou = isAr
          ? 'يرجى كتابة ما يميّزك عن باقي المتقدمين.'
          : 'Please explain what distinguishes you from other applicants.';
      }
      if (goodStaffDefinition.trim().length < 15) {
        newErrors.goodStaffDefinition = isAr
          ? 'يرجى توضيح ما هي صفات الإداري الناجح في نظرك.'
          : 'Please describe the qualities of a successful staff member.';
      }
      if (handleToxicPlayer.trim().length < 15) {
        newErrors.handleToxicPlayer = isAr
          ? 'يرجى توضيح طريقتك بالتفصيل في التعامل مع اللاعب السام أو المسيء.'
          : 'Please describe how you handle a toxic or abusive player in detail.';
      }
      if (friendBrokeRules.trim().length < 15) {
        newErrors.friendBrokeRules = isAr
          ? 'يرجى شرح تصرفك إذا خالف صديقك المقرب قوانين السيرفر.'
          : 'Please explain your reaction if a close friend violates server rules.';
      }
      if (accusationOfCheating.trim().length < 15) {
        newErrors.accusationOfCheating = isAr
          ? 'يرجى شرح خطواتك للتأكد من بلاغات الهاك والغش.'
          : 'Please describe how you investigate and verify cheating allegations.';
      }
      if (playerArgument.trim().length < 15) {
        newErrors.playerArgument = isAr
          ? 'يرجى توضيح كيف تتدخل لفض نزاع أو شجار بين لاعبين في الشات.'
          : 'Please explain how you resolve a public chat dispute between players.';
      }
      if (staffAbuse.trim().length < 15) {
        newErrors.staffAbuse = isAr
          ? 'يرجى توضيح تصرفك إذا رأيت إدارياً آخر يسيء استخدام رتبته أو صلاحياته.'
          : 'Please state what you do if you witness another staff member abusing their rank.';
      }
    }

    if (step === 4) {
      if (contribution.trim().length < 15) {
        newErrors.contribution = isAr
          ? 'يرجى ذكر ما يمكنك تقديمه لمساعدة السيرفر واللاعبين.'
          : 'Please share what you can contribute to the server and community.';
      }
      if (!truthfulConfirmed) {
        newErrors.truthfulConfirmed = isAr
          ? 'يجب الموافقة والإقرار بصحة ودقة جميع البيانات المدخلة وتأكيد أن عمرك 15 سنة فما فوق.'
          : 'You must confirm that all details are truthful and you are 15+ years of age.';
      }
      if (!rulesAgreed) {
        newErrors.rulesAgreed = isAr
          ? 'يجب الموافقة والالتزام بقوانين إدارة سيرفر فورتكس MC.'
          : 'You must agree to abide by the VortexMC staff guidelines.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      document.getElementById('staff-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    document.getElementById('staff-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const appId = `VTX-APP-${randCode}`;

    const newApp: StaffApplication = {
      id: appId,
      submittedAt: formattedDate,
      status: 'pending',
      minecraftUsername: minecraftUsername.trim(),
      discordUsername: discordUsername.trim(),
      age: parseInt(age, 10) || 15,
      country: country.trim(),
      timezone: timezone.trim(),
      hasStaffExperience,
      previousServers: previousServers.trim() || undefined,
      previousStaffRank: previousStaffRank.trim() || undefined,
      playingDuration: playingDuration.trim(),
      activeHoursPerDay: activeHoursPerDay.trim(),
      whyVortex: whyVortex.trim(),
      whyChooseYou: whyChooseYou.trim(),
      goodStaffDefinition: goodStaffDefinition.trim(),
      handleToxicPlayer: handleToxicPlayer.trim(),
      friendBrokeRules: friendBrokeRules.trim(),
      accusationOfCheating: accusationOfCheating.trim(),
      playerArgument: playerArgument.trim(),
      staffAbuse: staffAbuse.trim(),
      contribution: contribution.trim(),
      additionalInfo: additionalInfo.trim() || undefined,
      truthfulConfirmed,
      rulesAgreed,
    };

    setTimeout(() => {
      onApplicationSubmit(newApp);
      setSubmittedApp(newApp);
      setIsSubmitting(false);
      setCurrentStep(5);
      document.getElementById('staff-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  const handleCopyId = () => {
    if (!submittedApp) return;
    onCopyText(submittedApp.id, isAr ? 'تم نسخ رقم الطلب بنجاح!' : 'Application ID copied!');
    setCopiedAppId(true);
    setTimeout(() => setCopiedAppId(false), 2500);
  };

  const stepsMeta = [
    { num: 1, title: isAr ? 'البيانات الشخصية' : 'Personal Info', desc: isAr ? 'الاسم والعمر والديسكورد' : 'IGN, Discord & Age' },
    { num: 2, title: isAr ? 'الخبرات والنشاط' : 'Experience', desc: isAr ? 'السيرفرات والنشاط اليومي' : 'Past roles & hours' },
    { num: 3, title: isAr ? 'الأسئلة الإدارية' : 'Scenarios', desc: isAr ? 'كيف تتصرف في المواقف' : 'Handling server situations' },
    { num: 4, title: isAr ? 'المراجعة والتأكيد' : 'Confirmation', desc: isAr ? 'الإقرار وإرسال الطلب' : 'Agreement & submission' },
  ];

  return (
    <div id="staff-form-container" className="max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-24" dir={isAr ? 'rtl' : 'ltr'}>
      {/* STEP 5: SUCCESS STATE */}
      {currentStep === 5 && submittedApp ? (
        <div className="rounded-3xl bg-slate-950/90 border border-[#39f77e]/40 p-8 sm:p-12 text-center shadow-[0_0_50px_rgba(57,247,126,0.2)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-[#39f77e]/15 border border-[#39f77e]/30 flex items-center justify-center mx-auto mb-6 text-[#39f77e] shadow-[0_0_30px_rgba(57,247,126,0.3)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block font-mono text-xs font-bold text-[#39f77e] uppercase tracking-widest bg-[#39f77e]/10 px-3 py-1 rounded-full mb-3">
            {isAr ? 'تم استلام طلب التقديم بنجاح' : 'Application Received Successfully'}
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            {isAr ? 'شكراً لك، تم إرسال طلبك للإدارة!' : 'Thank You! Your Application Is Under Review!'}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            {isAr
              ? 'تم تسجيل طلب انضمامك إلى طاقم إدارة Vortex MC. يقوم فريق القيادة بمراجعة الطلبات بدقة، وسنتواصل معك عبر الديسكورد في حال القبول المبدئي.'
              : 'Your staff application has been registered. The leadership team reviews all applications carefully and will reach out to you via Discord if shortlisted.'}
          </p>

          {/* Receipt Info Card */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#090d16] border border-white/10 space-y-4 mb-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-slate-400">{isAr ? 'رقم الطلب المرجعي:' : 'Reference ID:'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#00d2ff] text-base" dir="ltr">{submittedApp.id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={isAr ? 'نسخ رقم الطلب' : 'Copy Application ID'}
                >
                  {copiedAppId ? <Check className="w-3.5 h-3.5 text-[#39f77e]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <img
                src={avatarUrl}
                alt={submittedApp.minecraftUsername}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className={isAr ? 'text-right' : 'text-left'}>
                <div className="font-bold text-white flex items-center gap-1.5" dir="ltr">
                  <span>{submittedApp.minecraftUsername}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-purple-400 font-mono">@{submittedApp.discordUsername}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isAr
                    ? `الدولة: ${submittedApp.country} (${submittedApp.timezone}) • العمر: ${submittedApp.age} سنة (15+)`
                    : `Country: ${submittedApp.country} (${submittedApp.timezone}) • Age: ${submittedApp.age} y/o (15+)`}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2 text-start">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'متوسط وقت المراجعة هو 24 إلى 48 ساعة. يرجى التأكد من فتح الرسائل الخاصة (DMs) في الديسكورد حتى يتمكن الإداريون (@el_joker_. أو @filstiny_) من التواصل معك.'
                  : 'Average review time is 24 to 48 hours. Please ensure your Discord direct messages (DMs) are open so staff leadership can reach out to you.'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] font-black text-sm tracking-wide shadow-[0_0_25px_rgba(0,210,255,0.3)] hover:shadow-[0_0_35px_rgba(0,210,255,0.5)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {isAr ? 'العودة للموقع الرئيسي' : 'Back to Home'}
            </button>
            <a
              href="https://discord.gg/dq36cMFef"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-[#5865F2] hover:text-white border border-white/10 text-slate-300 font-bold text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isAr ? 'تذكرة الدعم بالديسكورد' : 'Discord Support Ticket'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      ) : (
        /* APPLICATION MULTI-STEP CARD */
        <div className="relative rounded-3xl bg-slate-950/85 border border-purple-500/30 shadow-[0_0_50px_rgba(88,28,135,0.3)] backdrop-blur-2xl overflow-hidden">
          {/* Header & Progress Bar */}
          <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-950/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#00d2ff] uppercase tracking-widest block">
                  {isAr ? `تقديم الإدارة • الخطوة ${currentStep} من 4` : `Staff Application • Step ${currentStep} of 4`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stepsMeta[currentStep - 1].title}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-xl w-fit">
                <ShieldCheck className="w-4 h-4 text-[#00d2ff]" />
                <span>VORTEX MC NETWORK</span>
              </div>
            </div>

            {/* Visual Step Timeline */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-2">
              {stepsMeta.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;
                return (
                  <div key={s.num} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isPassed
                            ? 'bg-[#39f77e] text-slate-950'
                            : isActive
                            ? 'bg-[#00d2ff] text-slate-950 ring-4 ring-[#00d2ff]/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed ? '✓' : s.num}
                      </div>
                      <span className={`hidden sm:inline text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {s.title}
                      </span>
                    </div>
                    {/* Progress Bar Segment */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isPassed
                            ? 'bg-[#39f77e] w-full'
                            : isActive
                            ? 'bg-gradient-to-r from-[#00d2ff] to-purple-500 w-full'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? 'يرجى كتابة معلومات التواصل بدقة حتى نتمكن من الوصول إليك في الديسكورد وتحديد موعد المقابلة.'
                      : 'Please enter accurate contact information so we can reach you on Discord for your interview.'}
                  </span>
                </div>

                {/* Age restriction alert - strictly 15+ years and above */}
                <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#00d2ff] shrink-0" />
                  <span>
                    <strong>{isAr ? 'شرط السن الرسمي:' : 'Official Age Policy:'}</strong>{' '}
                    {isAr
                      ? 'التقديم مخصص لمن هم 15 سنة فما فوق (15+ Years) فقط. يُمنع التقديم لمن هم أقل من 15 سنة.'
                      : 'You must be at least 15 years old (15+ Years). Anyone under 15 years old will not be accepted.'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Minecraft Username with live avatar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {isAr ? 'اسم الحساب في ماينكرافت (Minecraft Username)' : 'Minecraft Username (IGN)'} <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl}
                          alt="Minecraft Skin Head"
                          className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 shadow-inner object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={minecraftUsername}
                          onChange={(e) => setMinecraftUsername(e.target.value)}
                          placeholder={isAr ? 'مثال: Notch أو Steve' : 'e.g. Notch or Steve'}
                          dir="ltr"
                          className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none transition-all text-left ${
                            errors.minecraftUsername ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                          }`}
                        />
                      </div>
                    </div>
                    {errors.minecraftUsername && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.minecraftUsername}</span>
                      </p>
                    )}
                  </div>

                  {/* Discord Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {isAr ? 'يوزر الديسكورد (Discord Username)' : 'Discord Username'} <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative" dir="ltr">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono">
                        @
                      </div>
                      <input
                        type="text"
                        value={discordUsername}
                        onChange={(e) => setDiscordUsername(e.target.value)}
                        placeholder={isAr ? 'مثال: username أو user#0000' : 'e.g. username or user#0000'}
                        className={`w-full bg-[#0d1422] border rounded-xl pl-9 pr-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none transition-all text-left ${
                          errors.discordUsername ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                        }`}
                      />
                    </div>
                    {errors.discordUsername && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.discordUsername}</span>
                      </p>
                    )}
                  </div>

                  {/* Age (15+ Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                        {isAr ? 'العمر بالسنوات (Age)' : 'Age (Years)'} <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-[#00d2ff] bg-[#00d2ff]/15 px-2 py-0.5 rounded border border-[#00d2ff]/25">
                        {isAr ? 'الحد الأدنى 15 سنة فما فوق (15+)' : 'Minimum 15+ Years'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="15"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={isAr ? 'مثال: 15 أو 16 أو 17...' : 'e.g. 15, 16, 17...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.age ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.age && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.age}</span>
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {isAr ? 'الدولة / بلد الإقامة (Country)' : 'Country of Residence'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder={isAr ? 'مثال: مصر، السعودية، فلسطين، المغرب...' : 'e.g. USA, UK, Egypt, Saudi Arabia...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.country ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.country && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.country}</span>
                      </p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {isAr ? 'المنطقة الزمنية / التوقيت المحلي (Timezone)' : 'Timezone'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder={isAr ? 'مثال: GMT+2 أو توقيت مكة GMT+3' : 'e.g. UTC+2, EST, PST, GMT+3'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.timezone ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.timezone && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.timezone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Experience */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Previous Staff Experience Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    {isAr
                      ? 'هل لديك خبرة إدارية سابقة في سيرفرات ماينكرافت؟'
                      : 'Do you have previous staff experience on Minecraft servers?'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() => setHasStaffExperience('yes')}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        hasStaffExperience === 'yes'
                          ? 'bg-[#00d2ff]/20 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.2)]'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'نعم، لدي خبرة سابقة' : 'Yes, I have experience'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasStaffExperience('no')}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        hasStaffExperience === 'no'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span>{isAr ? 'لا، هذه أول تجربة لي' : 'No, this is my first time'}</span>
                    </button>
                  </div>
                </div>

                {/* Conditional fields if Yes */}
                {hasStaffExperience === 'yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-[#0b101c] border border-white/10">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                        {isAr ? 'أسماء السيرفرات السابقة' : 'Previous Server Names'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={previousServers}
                        onChange={(e) => setPreviousServers(e.target.value)}
                        placeholder={isAr ? 'مثال: سيرفر كرافت، شبكة النخبة...' : 'e.g. Hypixel, CraftNetwork...'}
                        className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                          errors.previousServers ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                        }`}
                      />
                      {errors.previousServers && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.previousServers}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                        {isAr ? 'الرتبة التي كنت تشغلها' : 'Staff Rank Held'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={previousStaffRank}
                        onChange={(e) => setPreviousStaffRank(e.target.value)}
                        placeholder={isAr ? 'مثال: Helper أو Moderator أو ديسكورد مود...' : 'e.g. Helper, Moderator, Admin...'}
                        className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                          errors.previousStaffRank ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                        }`}
                      />
                      {errors.previousStaffRank && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.previousStaffRank}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Playing Duration & Active Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {isAr ? 'منذ متى وأنت تلعب ماينكرافت؟' : 'How long have you played Minecraft?'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={playingDuration}
                      onChange={(e) => setPlayingDuration(e.target.value)}
                      placeholder={isAr ? 'مثال: 4 سنوات، أو منذ 2020...' : 'e.g. 4 years, since 2020...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.playingDuration ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.playingDuration && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.playingDuration}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      {isAr ? 'كم عدد الساعات التي يمكنك التواجد فيها يومياً؟' : 'How many hours can you dedicate daily?'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={activeHoursPerDay}
                      onChange={(e) => setActiveHoursPerDay(e.target.value)}
                      placeholder={isAr ? 'مثال: 3 إلى 5 ساعات يومياً' : 'e.g. 3-5 hours daily'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.activeHoursPerDay ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.activeHoursPerDay && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.activeHoursPerDay}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Staff Questions */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 text-xs text-[#b9ecff] flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? 'هذه الأسئلة تساعدنا في قياس مدى هدوئك، وحكمتك، والتزامك بالعدل والحيادية أثناء مواجهة المشاكل.'
                      : 'These scenario questions help us assess your maturity, neutrality, and communication during critical situations.'}
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Q1: Why Vortex */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '1. لماذا ترغب في أن تصبح إدارياً في سيرفر Vortex MC؟'
                        : '1. Why do you want to become staff on VortexMC?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={whyVortex}
                      onChange={(e) => setWhyVortex(e.target.value)}
                      placeholder={isAr ? 'اشرح ما الذي يعجبك في السيرفر ومجتمعه وما يحفزك للانضمام...' : 'Explain what inspires you about our community and network...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.whyVortex ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.whyVortex && <p className="text-xs text-rose-400 mt-1">{errors.whyVortex}</p>}
                  </div>

                  {/* Q2: Why choose you */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '2. لماذا يجب أن نختارك أنت بدلاً من باقي المتقدمين؟'
                        : '2. Why should we choose you over other candidates?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={whyChooseYou}
                      onChange={(e) => setWhyChooseYou(e.target.value)}
                      placeholder={isAr ? 'اذكر نقاط قوتك، صبرك، مهاراتك في التعامل والتواصل...' : 'Highlight your strengths, patience, and moderation mindset...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.whyChooseYou ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.whyChooseYou && <p className="text-xs text-rose-400 mt-1">{errors.whyChooseYou}</p>}
                  </div>

                  {/* Q3: Good staff definition */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '3. في رأيك، ما الذي يجعل الإداري شخصاً ناجحاً ومميزاً؟'
                        : '3. In your opinion, what makes a great staff member?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={goodStaffDefinition}
                      onChange={(e) => setGoodStaffDefinition(e.target.value)}
                      placeholder={isAr ? 'الأخلاق، الحيادية، الصبر، احترام اللاعبين وعدم استغلال الرتبة...' : 'Fairness, calm temperament, listening to players without bias...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.goodStaffDefinition ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.goodStaffDefinition && <p className="text-xs text-rose-400 mt-1">{errors.goodStaffDefinition}</p>}
                  </div>

                  {/* Q4: Toxic player */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '4. كيف تتصرف إذا قام لاعب بشتم الآخرين أو نشر رسائل مسيئة في الشات؟'
                        : '4. How would you handle a player spamming toxicity or insults in chat?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={handleToxicPlayer}
                      onChange={(e) => setHandleToxicPlayer(e.target.value)}
                      placeholder={isAr ? 'خطوات التنبيه أولاً، ثم الميوت إذا تكرر الأمر، وتوثيق السبب...' : 'Give clear warnings first, apply proper mute duration, document proof...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.handleToxicPlayer ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.handleToxicPlayer && <p className="text-xs text-rose-400 mt-1">{errors.handleToxicPlayer}</p>}
                  </div>

                  {/* Q5: Friend broke rules */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '5. ماذا تفعل إذا خالف صديقك المقرب قوانين السيرفر أمامك؟'
                        : '5. What would you do if a close personal friend breaks server rules?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={friendBrokeRules}
                      onChange={(e) => setFriendBrokeRules(e.target.value)}
                      placeholder={isAr ? 'اشرح كيف ستتعامل بحيادية تامة دون أي مجاملة وتطبق القوانين بالتساوي...' : 'Explain how you maintain absolute impartiality and apply rules equally...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.friendBrokeRules ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.friendBrokeRules && <p className="text-xs text-rose-400 mt-1">{errors.friendBrokeRules}</p>}
                  </div>

                  {/* Q6: Accusation of Cheating */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '6. كيف تتصرف إذا اتهم لاعب لاعباً آخر بالغش أو استخدام الهاك؟'
                        : '6. How do you respond to player reports accusing someone of hacking?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={accusationOfCheating}
                      onChange={(e) => setAccusationOfCheating(e.target.value)}
                      placeholder={isAr ? 'طلب دليل فيديو، مراقبة اللاعب المشتبه به في وضع التخفي (Vanish)، وعدم المعاقبة دون إثبات مؤكد...' : 'Request video proof, spectate in vanish mode, and never punish without conclusive evidence...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.accusationOfCheating ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.accusationOfCheating && <p className="text-xs text-rose-400 mt-1">{errors.accusationOfCheating}</p>}
                  </div>

                  {/* Q7: Player argument */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '7. كيف تتعامل مع مشاجرة وجدال حاد بين لاعبين في الشات العام؟'
                        : '7. How do you de-escalate a heated argument between two players in public chat?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={playerArgument}
                      onChange={(e) => setPlayerArgument(e.target.value)}
                      placeholder={isAr ? 'تهدئة الطرفين، توجيههم لإنهاء الخلاف أو فتحه في تذكرة خاصة...' : 'Calm both sides, redirect to direct messages or ticket support, maintain chat order...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.playerArgument ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.playerArgument && <p className="text-xs text-rose-400 mt-1">{errors.playerArgument}</p>}
                  </div>

                  {/* Q8: Staff abuse */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {isAr
                        ? '8. ماذا تفعل إذا رأيت إدارياً آخر يسيء استخدام أوامره أو صلاحياته؟'
                        : '8. What action do you take if you witness another staff member abusing their rank?'} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={staffAbuse}
                      onChange={(e) => setStaffAbuse(e.target.value)}
                      placeholder={isAr ? 'تصوير وتسجيل الإثباتات، عدم المشاجرة أمامه في الشات العام، وإبلاغ أصحاب السيرفر فوراً في الخاص...' : 'Collect screenshots/recordings calmly, do not argue in public chat, and report immediately to owners in private...'}
                      className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                        errors.staffAbuse ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                      }`}
                    />
                    {errors.staffAbuse && <p className="text-xs text-rose-400 mt-1">{errors.staffAbuse}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Final */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                    {isAr
                      ? 'ما الذي يمكنك تقديمه وإضافته لسيرفر Vortex MC؟'
                      : 'What can you uniquely contribute to VortexMC?'} <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    placeholder={isAr ? 'مثال: تواجد يومي منتظم، مساعدة اللاعبين الجدد والرد على استفساراتهم، إقامة الفعاليات...' : 'e.g. Steady daily presence, helping new players, organizing events...'}
                    className={`w-full bg-[#0d1422] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                      errors.contribution ? 'border-rose-500' : 'border-white/15 focus:border-[#00d2ff]'
                    }`}
                  />
                  {errors.contribution && <p className="text-xs text-rose-400 mt-1">{errors.contribution}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                    {isAr
                      ? 'هل هناك أي معلومات إضافية تود إخبارنا بها؟ (اختياري)'
                      : 'Any additional notes or skills you would like to mention? (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder={isAr ? 'مثال: مهارات في البناء، المونتاج، بوتات الديسكورد، التحدث في الروم الصوتي...' : 'e.g. Building skills, video editing, Discord bots, microphone/voice chat readiness...'}
                    className="w-full bg-[#0d1422] border border-white/15 focus:border-[#00d2ff] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Confirmation Checkboxes */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="truthful"
                      checked={truthfulConfirmed}
                      onChange={(e) => setTruthfulConfirmed(e.target.checked)}
                      className="mt-1 rounded bg-slate-950 border-white/20 text-[#00d2ff] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="truthful" className="text-xs sm:text-sm text-slate-300 select-none cursor-pointer">
                      <strong>
                        {isAr
                          ? 'أقر وأؤكد أن جميع المعلومات المدخلة صحيحة تماماً (بما فيها أن عمري 15 سنة فما فوق 15+).'
                          : 'I declare and confirm that all submitted details are 100% accurate (including that I am 15 years or older).'}
                      </strong>{' '}
                      {isAr
                        ? 'وأعلم أن أي كذب في العمر أو الخبرة سيؤدي للاستبعاد الفوري والإدراج في القائمة السوداء.'
                        : 'I understand that any falsification will result in immediate disqualification.'}
                    </label>
                  </div>
                  {errors.truthfulConfirmed && (
                    <p className="text-xs text-rose-400 pr-7">{errors.truthfulConfirmed}</p>
                  )}

                  <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                    <input
                      type="checkbox"
                      id="rules"
                      checked={rulesAgreed}
                      onChange={(e) => setRulesAgreed(e.target.checked)}
                      className="mt-1 rounded bg-slate-950 border-white/20 text-[#00d2ff] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="rules" className="text-xs sm:text-sm text-slate-300 select-none cursor-pointer">
                      <strong>
                        {isAr
                          ? 'أوافق على الالتزام الكامل بقوانين طاقم إدارة Vortex MC.'
                          : 'I agree to strictly adhere to the VortexMC Staff Guidelines & Server Rules.'}
                      </strong>{' '}
                      {isAr
                        ? 'وأدرك أن الإداري قدوة للاعبين وعليه التحلي بالاحترام والأمانة وحفظ الأسرار.'
                        : 'I understand staff members are role models and must remain respectful, honest, and confidential.'}
                    </label>
                  </div>
                  {errors.rulesAgreed && (
                    <p className="text-xs text-rose-400 pr-7">{errors.rulesAgreed}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons: Back / Continue / Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-bold border border-white/10 transition-colors cursor-pointer"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{isAr ? 'السابق' : 'Previous'}</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0080ff] text-[#00111a] font-black text-xs sm:text-sm uppercase tracking-wide shadow-[0_0_25px_rgba(0,210,255,0.3)] hover:shadow-[0_0_35px_rgba(0,210,255,0.5)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{isAr ? 'التالي' : 'Next Step'}</span>
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#39f77e] via-[#22c55e] to-[#00d2ff] text-slate-950 font-black text-sm uppercase tracking-wide shadow-[0_0_35px_rgba(57,247,126,0.4)] hover:shadow-[0_0_45px_rgba(57,247,126,0.6)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال طلب التقديم' : 'Submit Application')}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
