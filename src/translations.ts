export type Language = 'en' | 'ar';

export const translations = {
  en: {
    nav: {
      home: 'Home',
      store: 'Store',
      rules: 'Rules',
      staffApply: 'Staff Apply',
      howToJoin: 'How to Join',
      discord: 'Discord',
      supportTicket: 'Support Ticket',
      openBadge: 'OPEN',
    },
    hero: {
      badge: 'Minecraft Java & Bedrock Network',
      title: 'ENTER THE ULTIMATE MINECRAFT EXPERIENCE',
      subtitle: 'Join thousands of players in VortexMC. Battle, build, and conquer with custom survival mechanics, lag-free servers, and an active community.',
      visitStore: 'Visit Store',
      joinDiscord: 'Join Discord',
      serverIp: 'Server IP',
      online: 'ONLINE',
      offline: 'OFFLINE',
      playersOnline: 'Players Online',
      clickToCopy: 'Click to copy IP',
      ipCopied: 'Server IP copied to clipboard!',
    },
    rules: {
      badge: 'Server Rules & Guidelines',
      title: 'VortexMC Server Rules',
      subtitle: 'Official Discord and Minecraft community guidelines to ensure a fair, respectful, and enjoyable experience for everyone.',
      copyPromptBtn: 'Copy Discord Rules Prompt',
      copiedPromptBtn: 'Discord Rules Copied!',
      discordPromptDesc: 'Formatted with Markdown & Emojis — ready to paste directly into your Discord #rules channel.',
      categories: {
        general: {
          title: 'General Rules',
          icon: '⚙️',
          items: [
            { label: 'Mutual Respect', desc: 'Treat all members with respect. Harassment, insults, bullying, racism, or hate speech are strictly prohibited.' },
            { label: 'Discord TOS', desc: 'All members must abide by the Discord Terms of Service and Community Guidelines.' },
            { label: 'Names & Avatars', desc: 'Usernames and avatars containing inappropriate, political, suggestive, or discriminatory content are forbidden.' },
            { label: 'Sensitive Content', desc: 'Adult content (+18) and violent/graphic media (NSFW) are strictly forbidden.' },
          ]
        },
        chat: {
          title: 'Chat Rules',
          icon: '💬',
          items: [
            { label: 'Stick to Channels', desc: 'Please chat and send images only in the designated channels for those topics.' },
            { label: 'No Spam', desc: 'Repeated messages, random mass pings, character flood, or chat disruption are not allowed.' },
            { label: 'Advertising & Promo', desc: 'Do not post links to other servers, channels, or personal social accounts without staff permission.' },
            { label: 'Staff Pings', desc: 'Please refrain from pinging Moderators or Owners unless there is an urgent emergency.' },
          ]
        },
        voice: {
          title: 'Voice Rules',
          icon: '🔊',
          items: [
            { label: 'Voice Disturbance', desc: 'No screaming, loud microphone music playback, or ear-rape sound changers.' },
            { label: 'Recording', desc: 'Recording voice channels without the explicit consent of all participants is strictly prohibited.' },
            { label: 'Respect Space', desc: 'Respect personal space and do not repeatedly interrupt speakers intentionally.' },
          ]
        },
        enforcement: {
          title: 'Enforcement & Penalties',
          icon: '🔨',
          chainTitle: 'Violations will result in escalating penalties:',
          steps: ['Warning ⚠️', 'Temporary Mute 🚫', 'Kick or Permanent Ban 🔨'],
          footnote: '*Sanctions depend on violation severity and prior infractions.*',
          closing: '💌 We wish you a fantastic time! Thank you for helping us keep our community safe.',
        }
      }
    },
    staff: {
      badge: 'VortexMC Leadership & Staff',
      title: 'Administration & Support Team',
      subtitle: 'Contact the VortexMC leadership team on Discord for assistance and rank activation.',
      hiringBadge: 'Staff Applications Open • 15+ Years',
      hiringTitle: 'Want to Join Our Staff Team?',
      hiringDesc: 'We are constantly looking for active members to assist players, moderate chat, and organize events. Apply now through our official portal or open a support ticket on Discord.',
      rolesAvailable: 'Available Positions:',
      applyBtn: 'Submit Staff Application',
      ticketBtn: 'Discord Support Ticket',
      discordUser: 'Discord User',
      copyUser: 'Copy Discord username',
      openTicket: 'Open Discord Ticket',
    },
    store: {
      badge: 'Official Webstore',
      title: 'SERVER STORE',
      subtitle: 'Support the server and elevate your gameplay with exclusive ranks, cosmetics, and perks.',
      tabRanks: 'Ranks',
      tabKeys: 'Crate Keys',
      tabCoins: 'Coins',
      tabCosmetics: 'Cosmetics',
      viewAll: 'Browse Webstore',
      buyNow: 'Purchase',
      configureStore: 'Configure Store URL',
    },
    footer: {
      rights: '© 2026 VortexMC Network. All rights reserved. Not affiliated with Mojang or Microsoft.',
      support: 'Support Ticket',
      discord: 'Discord',
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      store: 'المتجر',
      rules: 'القوانين',
      staffApply: 'تقديم الإدارة',
      howToJoin: 'دليل الدخول',
      discord: 'ديسكورد',
      supportTicket: 'تذكرة الدعم',
      openBadge: 'مفتوح',
    },
    hero: {
      badge: 'شبكة ماينكرافت جافا وبدروك',
      title: 'عِش المغامرة الأقوى في ماين كرافت',
      subtitle: 'انضم لآلاف اللاعبين في سيرفر VortexMC. خوض أقوى معارك السيرفايفل بنظام متطور وبدون لاج ومجتمع متفاعل 24/7.',
      visitStore: 'زيارة المتجر',
      joinDiscord: 'سيرفر الديسكورد',
      serverIp: 'آي بي السيرفر',
      online: 'أونلاين',
      offline: 'أوفلاين',
      playersOnline: 'لاعب متصل',
      clickToCopy: 'انقر لنسخ الآي بي',
      ipCopied: 'تم نسخ آي بي السيرفر بنجاح!',
    },
    rules: {
      badge: 'قوانين وإرشادات السيرفر',
      title: 'قوانين السيرفر | SERVER RULES',
      subtitle: 'قوانين مجتمع ديسكورد وماين كرافت الرسمية لضمان بيئة لعب وتواصل عادلة ومحترمة للجميع.',
      copyPromptBtn: 'نسخ برومبت القوانين لديسكورد',
      copiedPromptBtn: 'تم نسخ البرومبت بنجاح!',
      discordPromptDesc: 'منسق بماركداون وإيموجي — جاهز للصق المباشر في روم #rules على ديسكورد.',
      categories: {
        general: {
          title: 'القوانين العامة (General Rules)',
          icon: '⚙️',
          items: [
            { label: 'الاحترام المتبادل', desc: 'يجب معاملة جميع الأعضاء باحترام. يمنع تماماً السب، التنمر، أو إهانة أي عضو.' },
            { label: 'شروط ديسكورد', desc: 'يجب على جميع الأعضاء اتباع شروط خدمة ديسكورد وإرشادات المجتمع (Discord TOS).' },
            { label: 'الأسماء والصور', desc: 'يمنع استخدام أسماء حسابات أو صور شخصية تحتوي على إيحاءات غير لائقة، سياسية، أو عنصرية.' },
            { label: 'المحتوى الحساس', desc: 'يمنع تماماً نشر أي محتوى مخصص للبالغين (+18) أو محتوى عنيف (NSFW).' },
          ]
        },
        chat: {
          title: 'قوانين الدردشة (Chat Rules)',
          icon: '💬',
          items: [
            { label: 'الالتزام بالرومات', desc: 'يرجى التحدث وإرسال الصور في الرومات المخصصة لها فقط.' },
            { label: 'منع السبام (Spam)', desc: 'يمنع تكرار الرسائل، الإشارات العشوائية، أو إرسال نصوص طويلة جداً لتخريب الشات.' },
            { label: 'الإعلانات والترويج', desc: 'يمنع نشر روابط لسيرفرات أخرى، قنوات، أو حسابات شخصية دون إذن الإدارة.' },
            { label: 'إشارات الإدارة', desc: 'يرجى عدم الإشارة (Ping) للمشرفين أو المالك إلا في الحالات الطارئة.' },
          ]
        },
        voice: {
          title: 'قوانين الرومات الصوتية (Voice Rules)',
          icon: '🔊',
          items: [
            { label: 'إزعاج الصوت', desc: 'يمنع الصراخ، تشغيل الموسيقى عبر المايك، أو استخدام مغيرات الصوت المزعجة.' },
            { label: 'التسجيل', desc: 'يمنع تماماً تسجيل الأصوات داخل الرومات الصوتية دون موافقة جميع المتواجدين.' },
            { label: 'احترام المساحة', desc: 'احترم خصوصية الآخرين ولا تقاطع المتحدثين بشكل مستفز.' },
          ]
        },
        enforcement: {
          title: 'العقوبات (Enforcement)',
          icon: '🔨',
          chainTitle: 'مخالفة القوانين ستعرض حسابك لـ:',
          steps: ['تحذير ⚠️', 'كتم مؤقت 🚫', 'طرد أو باند نهائي 🔨'],
          footnote: '*تحدد العقوبة بناءً على حجم المخالفة وتكرارها.*',
          closing: '💌 نتمنى لكم وقتاً ممتعاً! شكراً لتعاونكم في الحفاظ على مجتمعنا.',
        }
      }
    },
    staff: {
      badge: 'فريق إدارة وقيادة VortexMC',
      title: 'فريق الإدارة والدعم الفني',
      subtitle: 'تواصل مباشرة مع إدارة واستاف VortexMC عبر الديسكورد للمساعدة وتأكيد تفعيل الرتب.',
      hiringBadge: 'تقديم الاستاف مفتوح • 15 سنة فما فوق (15+)',
      hiringTitle: 'هل ترغب في الانضمام لطاقم العمل؟',
      hiringDesc: 'نبحث دائماً عن أعضاء نشطين لمساعدة اللاعبين وإدارة السيرفر وصناعة الفعاليات. يمكنك التقديم الآن عبر بوابة التقديم الرسمية أو تذاكر الدعم الفني بالديسكورد.',
      rolesAvailable: 'الرتب المتاحة للتقديم:',
      applyBtn: 'تقديم طلب انضمام للإدارة (Staff Apply)',
      ticketBtn: 'تذكرة الدعم بالديسكورد (Ticket Support)',
      discordUser: 'يوزر الديسكورد',
      copyUser: 'نسخ يوزر الديسكورد',
      openTicket: 'فتح تذكرة بالديسكورد',
    },
    store: {
      badge: 'المتجر الرسمي',
      title: 'متجر السيرفر',
      subtitle: 'ادعم استمرار السيرفر وارتقِ بتجربتك عبر رتب مميزة، مفاتيح الصناديق، وكوزمتكس حصرية.',
      tabRanks: 'الرتب',
      tabKeys: 'المفاتيح',
      tabCoins: 'الكوينز',
      tabCosmetics: 'الكوزمتكس',
      viewAll: 'تصفح المتجر',
      buyNow: 'شراء الآن',
      configureStore: 'تعديل رابط المتجر',
    },
    footer: {
      rights: '© 2026 شبكة سيرفر VortexMC. جميع الحقوق محفوظة. هذا الموقع غير تابع لشركة Mojang أو Microsoft.',
      support: 'تذكرة الدعم',
      discord: 'ديسكورد',
    }
  }
};

export const RAW_DISCORD_RULES_TEXT = `=======================================
     📜  قوانين السيرفر | SERVER RULES  📜
=======================================

⚙️  القوانين العامة (General Rules)
◀ الاحترام المتبادل: يجب معاملة جميع الأعضاء باحترام. يمنع تماماً السب، التنمر، أو إهانة أي عضو.
◀ شروط ديسكورد: يجب على جميع الأعضاء اتباع شروط خدمة ديسكورد وإرشادات المجتمع (Discord TOS).
◀ الأسماء والصور: يمنع استخدام أسماء حسابات أو صور شخصية تحتوي على إيحاءات غير لائقة، سياسية، أو عنصرية.
◀ المحتوى الحساس: يمنع تماماً نشر أي محتوى مخصص للبالغين (+18) أو محتوى عنيف (NSFW).

💬  قوانين الدردشة (Chat Rules)
◀ الالتزام بالرومات: يرجى التحدث وإرسال الصور في الرومات المخصصة لها فقط.
◀ منع السبام (Spam): يمنع تكرار الرسائل، الإشارات العشوائية، أو إرسال نصوص طويلة جداً لتخريب الشات.
◀ الإعلانات والترويج: يمنع نشر روابط لسيرفرات أخرى، قنوات، أو حسابات شخصية دون إذن الإدارة.
◀ إشارات الإدارة: يرجى عدم الإشارة (Ping) للمشرفين أو المالك إلا في الحالات الطارئة.

🔊  قوانين الرومات الصوتية (Voice Rules)
◀ إزعاج الصوت: يمنع الصراخ، تشغيل الموسيقى عبر المايك، أو استخدام مغيرات الصوت المزعجة.
◀ التسجيل: يمنع تماماً تسجيل الأصوات داخل الرومات الصوتية دون موافقة جميع المتواجدين.
◀ احترام المساحة: احترم خصوصية الآخرين ولا تقاطع المتحدثين بشكل مستفز.

🔨  العقوبات (Enforcement)
مخالفة القوانين ستعرض حسابك لـ: 
[ تحذير ⚠️ ] ──> [ كتم مؤقت 🚫 ] ──> [ طرد أو باند نهائي 🔨 ]
*تحدد العقوبة بناءً على حجم المخالفة وتكرارها.*

=======================================
💌 نتمنى لكم وقتاً ممتعاً! شكراً لتعاونكم في الحفاظ على مجتمعنا.`;
