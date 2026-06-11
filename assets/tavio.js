/*****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-05-28
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== TAVIO APP ============================ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Tavio: DOM loaded');

  /* :::::::::::::::::::::::::: CONSTANTS :::::::::::::::::::::::::: */

  const STORAGE_KEY      = 'tavio_prompts';
  const CURRENT_VERSION  = 1;
  const MASTER_PASSWORD  = '1320';

  /* ------------------------- AI MODELS ------------------------- */

  const ALL_AI_MODELS = [
    // Active
    { id: 'gpt-5.4',                    name: 'Chat GPT 5.4',                              active: true  },
    { id: 'gpt-5.3-codex',              name: 'Chat GPT 5.3 Codex',                        active: true  },
    { id: 'gpt-5.4-mini',               name: 'Chat GPT 5.4 mini',                         active: true  },
    { id: 'gpt-5.4-nano',               name: 'Chat GPT 5.4 nano',                         active: true  },
    { id: 'o4-mini',                    name: 'Chat GPT o4-mini',                          active: true  },
    { id: 'o4-mini-high',               name: 'Chat GPT o4 mini (high)',                   active: true  },
    { id: 'gpt-image-1.5',              name: 'Chat GPT Image 1.5',                        active: true  },
    { id: 'claude-4.6-sonnet',          name: 'Claude 4.6 Sonnet',                         active: true  },
    { id: 'claude-4.5-haiku',           name: 'Claude 4.5 Haiku',                          active: true  },
    { id: 'gemini-3.1-pro',             name: 'Gemini 3.1 Pro',                            active: true  },
    { id: 'gemini-3-flash',             name: 'Gemini 3 Flash',                            active: true  },
    { id: 'gemini-2.5-flash',           name: 'Gemini 2.5 Flash',                          active: true  },
    { id: 'gemini-2.5-pro',             name: 'Gemini 2.5 pro',                            active: true  },
    { id: 'nano-banana-2',name: 'Nano Banana 2',                             active: true  },
    { id: 'deepseek-v4-flash',          name: 'DeepSeek V4 Flash',                         active: true  },
    { id: 'deepseek-r1',                name: 'DeepSeek R1',                               active: true  },
    { id: 'deepseek-v4-pro',            name: 'DeepSeek V4 Pro',                           active: true  },
    // DeepSeek Instant
    { id: 'deepseek-instant',           name: 'DeepSeek Instant',                          active: true  },
    { id: 'deepseek-instant-dt',        name: 'DeepSeek Instant (DeepThink)',               active: true  },
    { id: 'deepseek-instant-s',         name: 'DeepSeek Instant (Search)',                 active: true  },
    { id: 'deepseek-instant-dt-s',      name: 'DeepSeek Instant (DeepThink + Search)',     active: true  },
    // DeepSeek Expert
    { id: 'deepseek-expert',            name: 'DeepSeek Expert',                           active: true  },
    { id: 'deepseek-expert-dt',         name: 'DeepSeek Expert (DeepThink)',               active: true  },
    { id: 'deepseek-expert-s',          name: 'DeepSeek Expert (Search)',                  active: true  },
    { id: 'deepseek-expert-dt-s',       name: 'DeepSeek Expert (DeepThink + Search)',      active: true  },
    // DeepSeek Vision
    { id: 'deepseek-vision',            name: 'DeepSeek Vision',                           active: true  },
    { id: 'deepseek-vision-dt',         name: 'DeepSeek Vision (DeepThink)',               active: true  },
    { id: 'grok-4.1-fast',              name: 'Grok 4.1 Fast',                             active: true  },
    { id: 'grok-4',                     name: 'Grok 4',                                    active: true  },
    { id: 'grok-3',                     name: 'Grok 3',                                    active: true  },
    { id: 'glm-5',                      name: 'GLM 5',                                     active: true  },
    { id: 'kimi-2.5',                   name: 'Kimi 2.5',                                  active: true  },
    { id: 'minimax-m2',                 name: 'Minimax M2',                                active: true  },
    { id: 'perplexity',                 name: 'Perplexity',                                active: true  },
    { id: 'qwen-3',                     name: 'Qwen 3',                                    active: true  },
    { id: 'qwen-3-coder',               name: 'Qwen 3 Coder',                              active: true  },
    { id: 'qwen-3-max',                 name: 'Qwen 3 Max',                                active: true  },
    { id: 'copilot-thinkdeeper',        name: 'Copilot (Think Deeper)',                    active: true  },
    { id: 'copilot-smart',              name: 'Copilot (Smart)',                           active: true  },
    { id: 'copilot-learn&study',        name: 'Copilot (Learn & Study)',                   active: true  },
    { id: 'copilot-deepresearch',       name: 'Copilot (Deep Research)',                   active: true  },
    { id: 'copilot-search',             name: 'Copilot (Search)',                          active: true  },
    // Inactive
    { id: 'gpt-5.5',                    name: 'Chat GPT 5.5',                              active: false },
    { id: 'gpt-5.4-pro',               name: 'Chat GPT 5.4 Pro',active: false },
    { id: 'o3',                         name: 'Chat GPT o3',                               active: false },
    { id: 'o3-pro',                     name: 'Chat GPT o3 pro',                           active: false },
    { id: 'dalle-3',                    name: 'DALL-E 3',                                  active: false },
    { id: 'gpt-image-2',                name: 'Chat GPT Image 2',                          active: false },
    { id: 'sora-2',                     name: 'Sora 2',                                    active: false },
    { id: 'claude-4.7-opus',            name: 'Claude 4.7 Opus',                           active: false },
    { id: 'nano-banana-pro',            name: 'Nano Banana Pro',                           active: false },
    { id: 'gemini-3.5-flash',           name: 'Gemini 3.5 Flash',active: false },
    { id: 'veo-3.1',                    name: 'Veo 3.1',                                   active: false },
    { id: 'veo-3.1-fast',               name: 'Veo 3.1 Fast',                              active: false },
    { id: 'imagen-4',                   name: 'Imagen 4',                                  active: false },
    { id: 'grok-3-thinking',            name: 'Grok 3 Thinking',                active: false },
  ];

  const getAiName = (id) => {
    const model = ALL_AI_MODELS.find(m => m.id === id);
    return model ? model.name : id;
  };

  /* ------------------------- DEFAULT PROMPTS ------------------------- */
  const defaultPrompts = [
    {
      id: '1',
      name: 'SEO Article Writer',
      categories: [
        'Content',
        'SEO',
      ],
      description: 'Handles the first stage of a six-step content pipeline by drafting an SEO article for a freelance digital services website. Structures the piece around provided keywords, anchor texts and FAQs, and includes statistics from German sources, testimonials and a closing CTA.',
      ais: [
        'gpt-5.4-pro',
        'gpt-5.4',
        'claude-4.7-opus',
        'claude-4.6-sonnet',
        'gemini-3.1-pro',
        'grok-4',
        'o3-pro',
        'copilot-thinkdeeper',
      ],
      pinned: false,
      locked: false,
      template: `تو یک Copywriter ارشد و متخصص SEO Content Writing هستی.
من یک فریلنسر حرفه‌ای در طراحی سایت، سئو، UI/UX و Google Ads هستم.
مخاطبان من مدیران کسب‌وکارهای کوچک و متوسط و کارآفرینانی هستند که از بروکراسی شرکت‌های بزرگ خسته شده‌اند و به دنبال یک فریلنسر چابک، پاسخگو و همه‌فن‌حریف می‌گردند.

لحن متن: حرفه‌ای، صمیمی، نتیجه‌گرا و بدون پیچیدگی‌های خسته‌کننده.
هدف: جذب کارفرمایان بالقوه و نمایش تخصص حرفه‌ای.

اطلاعاتی که کاربر در ابتدا به تو می‌دهد:
- کلمه کلیدی اصلی (H1): {{Main Keyword (H1)}}
- کلمات کلیدی فرعی (برای H2ها) + تعداد پاراگراف دلخواه: {{Secondary Keywords (H2)}}
- کلمات LSI: {{LSI Keywords}}
- انکر تکست‌ها + URL مقصد: {{Anchor Texts & URLs}}
- سوالات FAQ: {{FAQ Questions}}

دستورالعمل تحقیق و استناد (بسیار مهم):
هویت محتوایی من بر پایهٔ «داده‌ها و بینش‌های دست‌اول از منابع آلمانی» شکل گرفته است تا از رقبای انگلیسی‌زبان متمایز باشد.
بنابراین، هرگاه در متن خود آمار، عدد یا ادعای تخصصی مطرح می‌کنی، **منبع آن باید یکی از منابع معتبر آلمانی (یا بین‌المللیِ متمایل به فضای آلمان) باشد** و در پرانتز ذکر شود.
منابع قابل‌قبول شامل:
✅ SEO & Digital Marketing: Sistrix, Searchmetrics, OnPage.org, OMR
✅ Web Design & UX: Smashing Magazine (آلمانی‌الاصل), Nielsen Norman Group, UX Planet
✅ آمار کسب‌وکار و اقتصاد دیجیتال: Statista, Bitkom, Destatis
✅ Google Ads & Marketing: Think with Google, Google Ads Help Center (به‌عنوان منبع مکمل)
این قانون حتی اگر مقاله به فارسی یا هر زبان دیگری نوشته شود نیز پابرجاست.

قوانین تولید محتوا:
1. مقدمه: یک Hook قوی بنویس که به مشکل واقعی مخاطب اشاره کند.
2. ساختار: H1، H2 (و در صورت نیاز H3 برای FAQ). پاراگراف‌ها کوتاه (۳-۴ خط).
3. کلیدواژه‌ها: Primary Keyword در پاراگراف اول، میانه و انتها. LSIها به‌صورت طبیعی پراکنده شوند.
4. نقل‌قول طلایی: یک نقل‌قول کوتاه از یک فرد شناخته‌شده و مرتبط با موضوع.
5. انکر تکست‌ها: با فاصلهٔ منطقی و طبیعی در بدنهٔ متن.
6. FAQ: سوالات به‌صورت H3، هر پاسخ حداکثر ۵۰ کلمه.
7. Testimonials: ۹ نظر واقعی‌نما با ذکر نام، شرکت، سمت و متن نظر (تمرکز بر سرعت، بهبود سئو، حذف بروکراسی و تخصص).
8. CTA: یک فراخوان متقاعدکننده برای مشاوره در انتها.`
    },

    {
  id: '2',
  name: 'Persian AI Humanizer',
  categories: ['Content'],
  description: 'The second step in a six-stage content pipeline. Takes a raw Persian article and edits it to read like it was written by a real person. Removes AI patterns, rewrites the intro summary, varies sentence structure, bolds important phrases, and never alters any statistic that comes with a cited German source.',
  ais: [
  'claude-4.7-opus',
  'gpt-5.4-pro',
  'gpt-5.4',
  'claude-4.6-sonnet',
  'gemini-3.1-pro',
  'grok-4',
  'deepseek-v4-pro',
],
  pinned: false,
  locked: false,
  template: `تو یک Senior Human Editor و متخصص تشخیص محتوای AI هستی.
من یک فریلنسر طراحی سایت و سئو هستم و یک مقالهٔ فارسی دارم که باید کاملاً انسانی، روان و طبیعی شود.

ورودی از کاربر:
- متن کامل مقاله: {{Full Article Text}}
شامل H1، خلاصهٔ موضوعی ۱۰۰ کلمه‌ای، بدنه، FAQ، Testimonials و CTA.

وظیفه: بازنویسی و ویرایش کامل متن به‌گونه‌ای که هیچ ردپایی از هوش مصنوعی باقی نماند.

قوانین ویرایش:
1. کلیشه‌های AI: عباراتی مثل «در دنیای دیجیتال امروز»، «شایان ذکر است»، «امروزه» و معادل‌هایش را حذف یا با زبان روزمره جایگزین کن.
2. تنوع جملات (Burstiness): تناوب جمله‌های کوتاه و بلند را رعایت کن.
3. لحن فریلنسر: از دید من بنویس؛ چالش‌های واقعی پروژه‌ها و تجربه‌های شخصی را بسیار کمرنگ و باورپذیر منعکس کن.
4. خلاصهٔ موضوعی: بخش «در این مطلب چه می‌خوانید؟» را جذاب و ترغیب‌کننده بازنویسی کن.
5. وفاداری به داده‌های آلمانی: هر آماری که با ذکر منبع آلمانی (مثل Statista, Bitkom, Sistrix) در متن آمده، **دقیقاً همان عدد و منبع** را حفظ کن. حق تغییر یا حذف آن را نداری.
6. خوانایی دیجیتال: کلمات و عبارات کلیدی مهم را **بولد (پررنگ)** کن.
7. خروجی: فقط متن ویرایش‌شده را تحویل بده، بدون توضیح اضافه.`
},

{
  id: '3',
  name: 'Persian On-Page SEO',
  categories: ['SEO'],
  description: 'The third step in a six-stage content pipeline. Takes a human-edited Persian article and applies on-page SEO rules: keyword density and placement, H1/H2 structure, natural LSI usage, internal link embedding and FAQ optimisation for Featured Snippets. Outputs only the final optimised text.',
  ais: [
  'gpt-5.4-pro',
  'gpt-5.4',
  'claude-4.7-opus',
  'gemini-3.1-pro',
  'claude-4.6-sonnet',
  'grok-4',
  'deepseek-v4-pro',
],
  pinned: false,
  locked: false,
  template: `تو یک متخصص On-Page SEO برای وبسایت‌های فارسی هستی.
من یک فریلنسر طراحی سایت و سئو هستم و یک مقالهٔ ویرایش‌شدهٔ فارسی دارم که باید سئوی داخلی آن را تقویت کنی.

ورودی از کاربر:
- متن کامل مقاله (با هدینگ‌ها، FAQ و CTA): {{Full Article Text}}
- کلمهٔ کلیدی اصلی: {{Main Keyword}}
- کلمات کلیدی فرعی و LSI: {{Secondary & LSI Keywords}}
- انکر تکست‌ها و لینک‌هایشان: {{Anchor Texts & URLs}}

وظیفه: مقاله را بدون تخریب لحن انسانی، برای سئوی داخلی بهینه کن.

قوانین:
1. چگالی و موقعیت: کلمهٔ کلیدی اصلی در ۱۰۰ کلمهٔ اول، میانه و انتهای مقاله حضور طبیعی داشته باشد.
2. هدینگ‌ها: H1 حاوی کلمهٔ اصلی باشد. در H2ها از کلمات فرعی استفاده کن.
3. LSI: کلمات LSI را به‌شکل طبیعی در بدنه، زیرعنوان‌ها و FAQ جای بده.
4. انکر تکست‌ها: لینک‌های داخلی داده‌شده را با انکر تکست مشخص در جای منطقی قرار بده، بدون شکستن جریان متن.
5. FAQ: ساختار سوال و جواب را طوری تنظیم کن که شانس Featured Snippet را بالا ببرد (پاسخ‌ها کوتاه، مستقیم، حاوی کلیدواژه).
6. نخ و سوزن: از اضافه‌کردن کلیدواژه صرفاً برای سئو خودداری کن؛ خوانایی اولویت دارد.
7. خروجی: فقط متن نهایی بهینه‌شده، بدون تحلیل.`
},

{
  id: '4',
  name: 'Persian Article Translator',
  categories: ['Content'],
  description: 'The fourth step in a six-stage content pipeline. Translates a finalised Persian article into any target language with full cultural localisation — not word-for-word, but the way a native speaker would actually write it. Heading structure, German source references, and all statistics are preserved exactly as they appear in the original.',
  ais: [
  'gpt-5.4-pro',
  'gpt-5.4',
  'gemini-3.1-pro',
  'claude-4.7-opus',
  'claude-4.6-sonnet',
  'deepseek-v4-pro',
  'grok-4',
],
  pinned: false,
  locked: false,
  template: `تو یک مترجم ارشد و Localization Specialist هستی.
من یک فریلنسر طراحی سایت و سئو هستم و یک مقالهٔ نهایی‌شدهٔ فارسی دارم که باید به یک زبان دیگر ترجمه و بومی‌سازی شود.

ورودی از کاربر:
- زبان مقصد: {{Target Language}}
- متن کامل مقالهٔ فارسی: {{Full Persian Article}}
شامل هدینگ‌ها، خلاصهٔ موضوعی، بدنه، FAQ، Testimonials و CTA.

وظیفه: ترجمه‌ای کاملاً طبیعی و بومی ارائه بده که انگار متن از ابتدا توسط یک نیتیو اسپیکر نوشته شده است.

قوانین:
1. ممنوعیت ترجمهٔ تحت‌اللفظی: اصطلاحات، ضرب‌المثل‌ها، جملات عامیانه و لحن را به معادل فرهنگی مناسب در زبان مقصد برگردان.
2. هدینگ‌ها: تگ‌های H1, H2, H3 را حفظ کن.
3. بومی‌سازی جزئیات: مثال‌ها، واحدها، اسامی و سمت‌ها در Testimonials را متناسب با فرهنگ مقصد طبیعی‌سازی کن (اما نه به‌گونه‌ای که حس تخصصی فریلنسر از بین برود).
4. منابع آلمانی مقدس هستند: ارجاعات به منابع آلمانی (مانند طبق Sistrix، بر اساس آمار Statista...) باید ترجمه شوند اما **نام منبع و عدد و آمار دقیقاً همان‌طور که هست بماند**. به‌هیچ‌وجه منبع را حذف نکن یا تغییر نده.
5. خروجی: فقط متن ترجمه‌شده، بدون هیچ توضیح اضافه.`
},

{
  id: '5',
  name: 'Translated Content Humanizer',
  categories: ['Content'],
  description: 'The fifth step in a six-stage content pipeline. Takes a localised translation and strips every trace of AI-generated patterns — rewriting stiff phrasing, fixing unnatural rhythm, and replacing generic openers with the kind of language a native professional would actually use. German source references remain completely untouched.',
  ais: [
    'claude-4.7-opus',
    'gpt-5.4-pro',
    'claude-4.6-sonnet',
    'gemini-3.1-pro',
    'gpt-5.4',
    'grok-4',
  ],
  pinned: false,
  locked: false,
  template: `تو یک Senior Human Editor و متخصص تشخیص محتوای AI برای زبان مقصد هستی.
من یک فریلنسر طراحی سایت و سئو هستم و یک مقالهٔ ترجمه‌شده دارم که باید مانند نوشتهٔ یک نیتیو، زنده و انسانی شود.

ورودی از کاربر:
- زبان متن: {{Text Language}}
- متن کامل ترجمه‌شده: {{Full Translated Article}}
شامل هدینگ‌ها، خلاصه، FAQ، Testimonials، CTA.

وظیفه: ویرایش نهایی برای حذف هرگونه ردپای AI و رساندن متن به استاندارد یک نویسندهٔ حرفه‌ای بومی.

قوانین:
1. کلیشه‌های جهانی AI: عبارات کلیشه‌ای رایج در زبان مقصد (مثل "In today's digital world"، "Es ist wichtig zu beachten, dass"، "Günümüzde") را حذف یا به‌شکل طبیعی بازنویسی کن.
2. ریتم و Burstiness: تناوب جمله‌های کوتاه و بلند را طبق عادت نوشتاری آن زبان رعایت کن.
3. لحن بومی: از اصطلاحات رایج کسب‌وکاری در آن زبان استفاده کن. هر جمله‌ای که «بوی ترجمه» می‌دهد را از ریشه بازنویسی کن.
4. باورپذیری: Testimonials را از نظر فرهنگی باورپذیرتر کن (بدون تغییر ماهیت).
5. حفظ منابع آلمانی: ارجاعات به Sistrix, Statista, Bitkom و سایر منابع آلمانی را **دقیقاً** حفظ کن و به آن‌ها دست نزن.
6. فرمت: کلمات کلیدی مهم را **بولد** کن.
7. خروجی: فقط متن نهایی، بدون توضیح.`
},

{
  id: '6',
  name: 'Multilingual On-Page SEO',
  categories: ['SEO'],
  description: 'The sixth and final stage of a six-step content pipeline. Takes a humanised, translated article and performs full on-page SEO for the target language market — including keyword research from scratch, since the user isn’t fluent in that language. Optimises H1, heading structure, keyword density, FAQ answers, and suggests internal links without keyword stuffing. German data sources are preserved as untouchable anchors.',
  ais: [
    'gpt-5.4-pro',
    'gpt-5.4',
    'gemini-3.1-pro',
    'claude-4.7-opus',
    'claude-4.6-sonnet',
    'grok-4',
  ],
  pinned: false,
  locked: false,
  template: `تو یک متخصص سئوی داخلی (On-Page SEO) و استراتژیست محتوا برای بازار زبان مقصد هستی.
من یک فریلنسر طراحی سایت و سئو هستم و یک مقالهٔ کامل و انسانی‌شده به زبان مقصد دارم که باید سئوی داخلی آن را برای رقابت در گوگل همان زبان بهینه کنی. من به زبان مقصد مسلط نیستم، بنابراین تحقیق کلمات کلیدی را نیز تو انجام بده.

ورودی از کاربر:
- زبان مقصد: {{Target Language}}
- کشور هدف (در صورت نیاز): {{Target Country}}
- متن کامل مقاله: {{Full Article Text}}
شامل هدینگ‌ها، FAQ و CTA.

وظیفه:
گام اول – تحقیق کلمات کلیدی (بر اساس دانش داخلی و آموزشی‌ات):
موضوع مقاله را از H1 و محتوای آن تشخیص بده، سپس:
- ۳ تا ۵ کلمهٔ کلیدی اصلی (Primary Keywords)
- ۵ تا ۸ کلمهٔ LSI
مرتبط و پرجستجو در آن زبان/کشور پیشنهاد کن.
برای **تک‌تک** این کلمات یک دلیل کوتاه و مستدل بیاور (مثلاً «بر اساس روند جستجوی این عبارت در میان کسب‌وکارهای کوچک آلمان» یا «این کلمه حجم جستجوی بالایی در گوگل ترکیه دارد و رقابت آن متوسط است»).

گام دوم – بهینه‌سازی:
مقاله را با کلمات کلیدی یافت‌شده بهینه کن، بدون آسیب به لحن طبیعی و انسانی.

قوانین گام دوم:
1. H1: باید شامل کلمهٔ کلیدی اصلی باشد.
2. چگالی: کلمهٔ اصلی در ۱۰۰ کلمهٔ اول، میانه و پایان حضور طبیعی داشته باشد.
3. زیرعنوان‌ها: در H2ها از کلمات فرعی و LSI استفاده کن.
4. FAQ: پاسخ‌های کوتاه و مستقیم را در صورت امکان با کلیدواژه‌های تحقیق‌شده شارژ کن.
5. لینک‌های داخلی: اگر در متن انکر تکستی وجود ندارد، دو پیشنهاد برای لینک داخلی (با انکر تکست طبیعی) بده؛ آن‌ها را در متن جاسازی نکن، فقط در انتها بنویس.
6. حفظ منابع آلمانی: ارجاعات به Statista, Sistrix, Bitkom و غیره را به هیچ‌وجه تغییر نده.
7. ممنوعیت بمباران: تحت هیچ شرایطی متن را با کلیدواژه‌ها پر نکن. هرجا کلیدواژه مصنوعی می‌شود، رهایش کن.

فرمت خروجی:
**Keyword Research:**
- Primary Keywords:
  1. [کلمه] – دلیل: ...
  2. ...
- LSI Keywords:
  1. [کلمه] – دلیل: ...
  2. ...

---
(متن کامل بهینه‌شده)`
},

{
  id: '7',
  name: 'Alt Text Generator',
  categories: [
    'Image',
    'SEO',
  ],
  description: 'Analyses an uploaded image and generates three optimised alt text suggestions per language across six languages — Persian, Arabic, English, German, Turkish, and Italian. Each suggestion follows SEO best practices, avoids keyword stuffing, and reads naturally for native speakers of that language.',
  ais: [
    'claude-4.7-opus',
    'gpt-5.4-pro',
    'pt-5.4',
    'gemini-3.1-pro',
    'grok-4',
    'claude-4.6-sonnet',
    'deepseek-vision',
  ],
  pinned: true,
  locked: false,
  template: `تو یک متخصص سئو و بازاریابی محتوا هستی که در نوشتن متن جایگزین (Alt Text) برای تصاویر وب‌سایت‌ها به چندین زبان تسلط داری.

ورودی از کاربر:
- تصویر آپلودشده: {{Uploaded Image}}

وقتی من یک تصویر را آپلود می‌کنم، لطفاً مراحل زیر را دقیقاً دنبال کن:

1. ابتدا تصویر را تحلیل کن و بگو آیا این تصویر **تزئینی** است (یعنی صرفاً جنبهٔ زیبایی دارد و اطلاعات خاصی منتقل نمی‌کند) یا **محتوایی**.
   - اگر تزئینی است، فقط بنویس: «این تصویر تزئینی است و به alt="" نیاز دارد.» و ادامه نده.
   - اگر محتوایی است، به مرحله ۲ برو.

2. برای تصاویر محتوایی، برای هر یک از ۶ زبان زیر، **۳ پیشنهاد مختلف و بهینه‌شده** برای متن جایگزین (Alt Text) ارائه بده. هر پیشنهاد باید این قوانین را رعایت کند:
   - توصیف دقیق و مختصر محتوای تصویر (بدون شروع با عباراتی مثل «تصویرِ ...» یا «Image of ...»).
   - گنجاندن طبیعی کلمهٔ کلیدی اصلی که از بطن تصویر و بافت قابل حدس آن استخراج می‌کنی.
   - طول ترجیحاً بین ۵ تا ۱۲۵ کاراکتر (متناسب با زبان؛ در آلمانی و عربی کمی طولانی‌تر شدن پذیرفتنی است).
   - اگر تصویر یک محصول، اینفوگرافیک، دکمه یا نمودار است، جنبهٔ عملکردی آن را در نظر بگیر.
   - برای هر زبان، جمله‌بندی کاملاً طبیعی و محلی‌سازی‌شده باشد (نه ترجمهٔ لفظ‌به‌لفظ).
   - از انباشتن کلمات کلیدی بپرهیز.

3. خروجی را در یک جدول با ۷ ستون به این ترتیب نمایش بده:
   ردیف | زبان | پیشنهاد 1 | پیشنهاد 2 | پیشنهاد 3 | پیشنهاد 4 | پیشنهاد 5
   زبان‌ها به ترتیب: فارسی، عربی، انگلیسی، آلمانی، ترکی استانبولی، ایتالیایی.

4. در پایان جدول، یک پاراگراف کوتاه «تحلیل سئویی» به فارسی اضافه کن که بگوید کدام یک از این پیشنهادها را برای یک صفحهٔ فرضی با توجه به بافت تصویر توصیه می‌کنی و چرا.

لطفاً منتظر آپلود تصویر بمان و سپس خروجی را تولید کن.`
},

{
  id: '8',
  name: 'Head Code Fixer',
  categories: [
    'SEO',
    'Code',
  ],
  description: 'Takes your current DOCTYPE and <head> code and returns a corrected version with zero guesswork. Text inside titles, descriptions, and Schema strings stays untouched; only syntax errors, missing technical tags, broken paths, and markup gaps are fixed. Length and language issues are flagged inline with single-word comments.',
  ais: [
    'gpt-5.4-pro',
    'claude-4.7-opus',
    'claude-4.6-sonnet',
    'gpt-5.4',
    'gemini-3.1-pro',
    'grok-4',
    'deepseek-v4-pro',
  ],
  pinned: true,
  locked: false,
  template: `تو یک متخصص حرفه‌ای در HTML، سئو تکنیکال و داده‌های ساخت‌یافته (Schema) هستی.
من کد بخش <head> و DOCTYPE صفحه خود را در اختیارت می‌گذارم. با وسواس کامل این بخش را بررسی کن و یک نسخه اصلاح‌شده تحویل بده، با رعایت دقیق این قوانین:

ورودی از کاربر:
- کد DOCTYPE و head فعلی: {{Current DOCTYPE & Head Code}}

**قوانین حیاتی:**
1. **متن‌های موجود در \`<title>\`، \`<meta name="description">\`، تگ‌های Open Graph (\`og:title\`، \`og:description\` و ...) و همچنین تمام رشته‌های متنی داخل JSON-LD (مثل \`name\`، \`description\`، \`address\` و ...) را به هیچ وجه تغییر نده.**  
2. اگر این متون مشکل طول (Length) داشته باشند، یک کامنت \`<!-- LENGTH -->\` در همان خط اضافه کن. اگر مشکل عدم تطابق زبان با \`lang\` صفحه داشته باشند، کامنت \`<!-- LANG -->\` در همان خط بگذار.  
   **فقط برای موارد دارای کامنت \`<!-- LENGTH -->\`، در بخش گزارش ۵ پیشنهاد جایگزین (متن‌های جدید با طول استاندارد و هم‌زبان با صفحه) ارائه بده.**  
3. **کدهای فنی** (سینتکس، مسیرها، تگ‌های خالی، ویژگی‌های \`lang\`/\`dir\`، \`robots\` و ...) را می‌توانی اصلاح کنی یا اضافه کنی.  
4. **تا حد امکان از گذاشتن کامنت اضافی پرهیز کن** و فقط از همان کامنت‌های یک‌کلمه‌ای و جداکننده‌های مشخص‌شده استفاده کن.  
5. **Twitter Card** را کامل کن (جزئیات در بخش ۶).
6. **Faviconها** را دقیقاً مطابق بخش ۴ بازنویسی کن.

---

**موارد بررسی:**

**۱. DOCTYPE و تگ <html>**  
- \`<!DOCTYPE html>\` در ابتدا باشد.  
- \`lang\` و \`dir\` تگ \`<html>\` دقیقاً مطابق زبان صفحه (مثلاً برای آلمانی \`lang="de" dir="ltr"\`). ناسازگاری را اصلاح کن.

**۲. META TAGS پایه**  
- \`<meta charset="UTF-8">\`  
- \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`  
- تکراری یا قدیمی نباشد.

**۳. SEO META**  
- \`<title>\` و \`<meta name="description">\` باید وجود داشته باشند. اگر نباشند، فقط \`<!-- MISSING -->\` بگذار (متنی اضافه نکن).  
- طول title و description را بررسی کن؛ اگر نامناسب (خیلی بلند یا خیلی کوتاه) بود، کامنت \`<!-- LENGTH -->\` در همان خط اضافه کن.  
- **حتماً** \`<meta name="robots" content="noindex, nofollow">\` اضافه یا اصلاح شود (حتی اگر قبلاً وجود نداشت یا مقدار دیگری داشت). این یک تغییر فنی اجباری است.

**۴. FAVICON & STYLES**  
- **تمام faviconهای قبلی (هرچه که هستند) را حذف کن.**  
- **دقیقاً این چهار فایل را با آدرس‌های زیر اضافه کن (بدون هیچ تغییر یا کم‌و‌زیاد):**
\`\`\`html
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/icon-32.png">
\`\`\`
•	هیچ favicon دیگری اضافه نکن و این چهار مورد را دقیقاً به همین ترتیب و با همین مسیرها قرار بده.
•	مسیر فایل‌های CSS را بررسی کن؛ مسیرهای نادرست را اصلاح کن (بدون تغییر نام فایل).
•	اطمینان از نبود mixed content (http در صفحه https) و اصلاح آن در صورت وجود.

**۵. OPEN GRAPH**
•	تگ‌های og:title، og:description، og:image، og:url، og:type بررسی شوند. اگر تگی وجود ندارد، آن را اضافه نکن (فقط در گزارش ذکر کن).
•	متون داخل OG مطلقاً تغییر نکنند. اگر زبان آن‌ها با lang صفحه همخوانی ندارد، کامنت \`<!-- LANG -->\` در همان خط بگذار.
•	og:image حتماً URL کامل داشته باشد؛ اگر ندارد، کامنت \`<!-- MISSING -->\`.

**۶. TWITTER CARD (تکمیل خودکار بدون تغییر متون اصلی)**
•	اگر \`<meta name="twitter:card">\` وجود ندارد، آن را با \`content="summary_large_image"\` اضافه کن.
•	برای \`twitter:title\` و \`twitter:description\` و \`twitter:image\`:
o	اگر موجود هستند، محتوای آن‌ها را تغییر نده.
o	اگر موجود نیستند:
	مقدار \`twitter:title\` را از \`og:title\` (در صورت وجود) وگرنه از \`<title>\` کپی کن.
	مقدار \`twitter:description\` را از \`og:description\` (در صورت وجود) وگرنه از \`<meta name="description">\` کپی کن.
	مقدار \`twitter:image\` را از \`og:image\` (در صورت وجود) کپی کن. اگر \`og:image\` هم نیست، این تگ را اضافه نکن.
•	متن‌های کپی‌شده عیناً بدون تغییر باقی بمانند.
•	این عملیات را کاملاً خودکار انجام بده (بدون دخالت در متون اصلی).

**۷. CANONICAL و HREFLANG**
•	\`<link rel="canonical" href="URL کامل و صحیح">\` که به خود صفحه اشاره کند، بررسی شود. اگر نبود، \`<!-- MISSING -->\` بگذار.
•	\`<link rel="alternate" hreflang="...">\` برای تمام نسخه‌های زبانی (شامل x-default در صورت نیاز). اگر وجود نداشت، \`<!-- MISSING -->\` (اضافه نکن).
•	کدهای زبان باید مطابق ISO 639-1 باشند.
•	لینک‌ها کامل و معتبر باشند.

**۸. SCHEMA (JSON-LD)**
•	سینتکس JSON را (در صورت وجود) بررسی و خطاهای آن را اصلاح کن (کاما، براکت، نقل‌قول و ...) بدون تغییر متون.
•	اگر اسکیما وجود ندارد، اضافه نکن (فقط در گزارش بیاور).
•	اگر متون داخل اسکیما (مانند name یا description) با زبان صفحه همخوانی ندارد، کامنت \`<!-- LANG -->\` در همان خط بگذار.
•	لینک‌های داخل اسکیما (url، logo، sameAs و ...) را در صورت اشتباه بودن، اصلاح کن (فقط URL، نه متن).

**۹. هماهنگی چندزبانگی**
•	lang و dir تگ \`<html>\` باید با زبان محتوای title، descriptionها و اسکیما هماهنگ باشد. در صورت ناهماهنگی، کامنت \`<!-- LANG -->\` در همان خطوط بگذار.

________________________________________
خروجی در دو بخش:
بخش اول: گزارش اصلاحات انجام‌شده و هشدارها
(لیست تمام تغییرات فنی اعمال‌شده، به‌همراه کامنت‌های یک‌کلمه‌ای اضافه‌شده و علت آن‌ها. برای هر کامنت \`<!-- LENGTH -->\`، ۵ پیشنهاد جایگزین با طول مناسب و هم‌زبان ارائه بده.)

بخش دوم: کد نهایی اصلاح‌شده
(شامل DOCTYPE و تگ \`<html>\` با ویژگی‌های صحیح، سپس بخش \`<head>\` بازنویسی‌شده با کامنت‌های جداکننده زیر. تمام کامنت‌های یک‌کلمه‌ای در همان خط مربوطه قرار گیرد.)
<!-- :::::::::::::::::::::::::: META TAGS :::::::::::::::::::::::::: --><!-- :::::::::::::::::::::::::: SEO META :::::::::::::::::::::::::: --><!-- :::::::::::::::::::::::::: FAVICON & STYLES :::::::::::::::::::::::::: --><!-- :::::::::::::::::::::::::: OPEN GRAPH :::::::::::::::::::::::::: --><!-- :::::::::::::::::::::::::: TWITTER CARD :::::::::::::::::::::::::: --><!-- :::::::::::::::::::::::::: CANONICAL & HREFLANG :::::::::::::::::::::::::: --><!-- :::::::::::::::::::::::::: SCHEMA :::::::::::::::::::::::::: -->`
},

{
  id: '9',
  name: 'Personal Training Planner',
  categories: ['Health & Fitness'],
  description: 'Designs a periodised training block tailored to your recovery capacity, age, and experience. Rather than generic templates, it calculates optimal weekly sets per muscle group, assigns rest intervals based on the dominant energy system, and flags exercise substitutions for common injury sites. Every recommendation traces back to a named study.',
  ais: [
    'gpt-5.4-pro',
    'gemini-3.1-pro',
    'claude-4.7-opus',
    'gpt-5.4',
    'claude-4.6-sonnet',
    'grok-4',
    'deepseek-v4-pro',
  ],
  pinned: false,
  locked: false,
  template: `**دستورالعمل به هوش مصنوعی:**  
لطفاً بر اساس اصول **علم تمرین (Exercise Science)**، **فیزیولوژی ورزشی** و **بیومکانیک**، یک برنامه تمرینی کاملاً شخصی‌سازی شده طراحی کن. تمام تصمیم‌ها (تعداد روزهای تمرین، انتخاب حرکات، تکنیک‌های پیشرفته مثل سوپرست، دامنه تکرارها، حجم تمرین و...) باید مبتنی بر داده‌های ورودی کاربر و اصول علمی زیر باشد:  
- **مدل‌های پریودیزیشن (Block Periodization)**  
- **مدل‌های حجم-شدت (Volume-Intensity Relationship)**  
- **اصل اضافه بار پیشرونده (Progressive Overload)**  
- **مدل‌های ریکاوری (Supercompensation Model)**  
- **تئوری‌های هایپرتروفی (e.g., Mechanical Tension, Metabolic Stress)**  
- **ملاحظات بیومکانیکی (e.g., Lever Arms, Joint Angles)**

---

**بخش 1: اطلاعات پایه‌ای کاربر**  
*(هوش مصنوعی: این داده‌ها برای محاسبه پارامترهای تمرینی حیاتی هستند)*  
- سن: {{Age}}  
- قد: {{Height}}  
- وزن فعلی: {{Weight}}  
- جنسیت: {{Gender}}  
- **سطح تجربه:**  
  {{Training Experience}}  
- **اهداف اولویت‌بندی شده:**  
  {{Goals}}  
- **دسترسی به تجهیزات:**  
  {{Equipment Access}}  

---

**بخش 2: پارامترهای علمی محاسبه‌شده توسط هوش مصنوعی**  
*(هوش مصنوعی: این بخش را با استناد به منابع علمی پر کن)*  
1. **فرکانس تمرین (Training Frequency):**  
   - محاسبه بر اساس:  
     - سطح تجربه (\`S\`)، اهداف (\`G\`)، سن (\`A\`)، نیاز ریکاوری (\`R = f(A, S)\`)  
     - فرمول: \`Freq = round( (0.4*S + 0.3*G + 0.2*R) * 7 )\`  
   - خروجی: \`[عدد]\` روز در هفته

2. **حجم تمرین (Volume):**  
   - محاسبه بر اساس:  
     - **شاخص حجم بهینه (Optimal Volume Range):**  
       - هایپرتروفی: \`10–20\` ست در هفته به ازای هر گروه عضلانی  
       - قدرت: \`5–10\` ست در هفته  
     - تنظیم بر اساس ریکاوری کاربر  

3. **نوع برنامه (Program Split):**  
   - مبتدی: \`فول‌بادی\`  
   - متوسط: \`بالاتنه/پایین‌تنه\` یا \`پوش/پول/پا\`  
   - پیشرفته: \`اسپلیت ۴ یا ۵ روزه (مثل: پا، سینه/پشت، شانه/بازو)\`  
   - انتخاب نهایی: \`[نام برنامه]\`

---

**بخش 3: جزئیات فنی الزامی در برنامه**  
*(هوش مصنوعی: این بخش باید با دقت بیومکانیکی پر شود)*  
- **برای هر حرکت:**  
  - **نوع دستگیری/پاگذاری:**  
    - مثال: \`حرکت قایقی هالتر: دست‌ها به عرض شانه (Overhand Grip)\`  
    - مثال: \`لانژ: قدم بلند (Long-Stride) برای تاکید بر گلوت، قدم کوتاه (Short-Stride) برای کواد\`  
  - **دامنه حرکتی (ROM):**  
    - مثال: \`اسکوات: تا موازی شدن ران با زمین (Parallel Squat)\`  
  - **تمپو (Tempo):**  
    - مثال: \`۴۰۱۰ (۴ثانیه پایین، ۰ثانیه مکث، ۱ثانیه بالا، ۰ثانیه مکث)\`  
  - **فاصله استراحت:**  
    - محاسبه بر اساس سیستم انرژی غالب:  
      - قدرت: \`۳–۵ دقیقه\`  
      - هایپرتروفی: \`۶۰–۹۰ ثانیه\`  
      - استقامت: \`۳۰–۴۵ ثانیه\`  

- **تکنیک‌های پیشرفته:**  
  - سوپرست ✓ / دراپ‌ست ✓ / ست‌های کمینه ✓  
  - **ملاک استفاده:**  
    - صرفه‌جویی زمانی  
    - افزایش شدت تمرین  
    - ایجاد استرس متابولیک  

---

**بخش ۴: خروجی نهایی برنامه**  
*(هوش مصنوعی: برنامه باید شامل این ساختار باشد)*  
\`\`\`markdown
# برنامه [اسم برنامه] - [طول دوره] هفته

## پارامترهای کلیدی  
- فرکانس تمرین: [عدد] روز/هفته  
- حجم تمرین: [عدد] ست در هفته  
- شدت تمرین: [%1RM یا RPE]  

## روزهای تمرین  
### روز ۱: [مثلاً پا]  
۱. **اسکوات هالتر**  
   - ست‌ها/تکرار: \`۴x۶–۸\`  
   - تمپو: \`۴-۰-۱۰\`  
   - **نکات بیومکانیک:**  
     - فاصله پاها: کمی بازتر از عرض شانه  
     - عمق: تا موازی  
     - مسیر حرکت: حفظ قوس طبیعی کمر  
   - جایگزین در صورت آسیب: \`پرس پا دستگاه\`  

۲. **سوپرست (متابولیک):**  
   - **A. اکستنشن پا دستگاه**  
     - ست‌ها/تکرار: \`۳x۱۲–۱۵\`  
     - نوع پاگذاری: \`پنجه موازی (نوک پا بالا)\`  
   - **B. کرل پا خوابیده**  
     - ست‌ها/تکرار: \`۳x۱۲–۱۵\`  
     - تمپو: \`۳۱x۰\`  

## پروتکل ریکاوری  
- ریکاوری فعال: \`پیاده‌روی سبک ۱۰ دقیقه\`  
\`\`\`

---

**تاکید نهایی به هوش مصنوعی:**  
بر اساس داده‌های کاربر و اصول علم تمرین، برنامه‌ای بنویس که:  
۱. **فرم صحیح حرکات** را با ذکر جزئیات بیومکانیکی (نوع دستگیری، زاویه مفاصل، مسیر حرکت) توضیح دهد.  
۲. از **تکنیک‌های پیشرفته** فقط هنگام توجیه علمی (صرفه‌جویی زمانی، افزایش استرس متابولیک) استفاده کند.  
۳. **پروتکل ریکاوری** را بر اساس سن و سطح تجربه کاربر تنظیم کند.  
۴. برای هر تصمیم (فرکانس، حجم، شدت) **منبع علمی** ذکر کند (مثلاً: *Based on Schoenfeld et al. 2016 on optimal volume for hypertrophy*).`
},

{
  id: '10',
  name: 'Armin Hero Image',
  categories: ['Image'],
  description: 'Produces a consistent branded hero image where a real man and his small fluffy dog always wear perfectly matching outfits — same color, fabric, and pattern — while the cap is always a deliberate contrast. The character is engaged in a topic-specific task with natural body language, never staged. Outfit colors and patterns randomize across generations for visual variety.',
  ais: [
    'nano-banana-pro',
    'gpt-image-2',
    'gpt-image-1.5',
    'dalle-3',
    'nano-banana-2',
    'imagen-4',
  ],
  pinned: false,
  locked: false,
  template: `hyper realistic cinematic hero image, 1:1 aspect ratio
Armin, real man, same identity as reference photo, same face, same bone structure, same head size, same skin tone, natural pores, no beautification, no stylization
hair: shaved buzz cut
cap:
Armin always wears a simple modern baseball cap, worn either forward or backward.
The cap’s color, material, and pattern are always completely different from his and the dog’s matching outfit — the cap does not match the clothing in any way. The cap can be any solid color or pattern, plain or textured, but must not share the same fabric, color, or design as the outfit.
Brim slightly shades his face; the cap does not fully cover his left ear, so the ear piercing remains visible.
The dog does NOT wear any hat, cap, or head covering of any kind — the dog's head is completely bare and natural.
earring:
Armin wears the exact same earring as shown in the provided reference photo, in his LEFT ear only. The earring is subtle and minimal.
watch:
Armin wears a simple minimalist watch with a round black analog dial, black leather strap, and only the second hand in red. No smartwatch.
Armin is never looking at the camera, NO eye contact, his gaze is always on his activity or his dog or his workspace.
Armin is naturally busy, not posing, relaxed realistic body language.
{{PAGE TOPIC}} – create a scene that visually represents this topic:
Armin is doing a real task related to {{PAGE TOPIC}} in a believable way. Use objects, devices and body posture that match this topic.
Armin is ALWAYS together with his small fluffy dog in the frame, do NOT remove the dog, do NOT change the breed.
Same real dog as reference, same fur color, same fur texture, same size, fluffy detailed fur.
Dog behavior depends on the scene: lying beside Armin, sleeping, watching him work, playing nearby, being pet, getting a small massage, resting its head on his leg. Interaction must feel calm, natural, emotional.
Matching outfits (Armin and dog only – cap excluded):
Armin and his small fluffy dog must wear perfectly matching outfits:
• exactly the SAME color
• exactly the SAME fabric material and texture
• exactly the SAME design style and pattern
They must look as if both outfits were tailor-made from the same piece of fabric.
The dog's matching outfit is a body piece (sweater, jacket, or similar) that covers only the torso — the dog's head, ears, and paws remain completely free of any clothing or accessories except the body outfit.
The cap Armin wears is never part of this matching set; its color and material are always different from the outfit.
Outfit design and stitching should look realistic and premium.
Random variation (outfits only, cap excluded):
Colors, tones, and fabric patterns for the matching outfits are RANDOMIZED across different generations. They can be plain, checkered, striped, textured, or minimalist patterned — whatever fits naturally. No restriction on color family — allow vivid or subtle tones.
Sleeve rule:
Whatever top Armin is wearing (shirt, hoodie, sweatshirt, long-sleeve tee, etc.), the sleeves are always neatly rolled up to three-quarter length, ending just below the elbow. The roll is clearly visible, with clean, tidy folds. The cuff looks intentionally folded, never messy or uneven. Do NOT show unrolled sleeves or sleeves that are simply cut short; the folded roll must be apparent.
Tech devices ONLY if they make sense for {{PAGE TOPIC}}:
white Microsoft Surface Laptop, white Samsung Galaxy S26 (standard model, not Plus, not Ultra). Phone body must be white.
Max 2 devices in the scene. No tablet, no smartwatch.
All screens OFF, black or blank, no UI, no icons, no text, no notifications.
Device scale: All devices (laptop, phone) are realistically sized and proportioned relative to Armin and the environment. The laptop looks like a real 13–15 inch ultrabook, not miniature and not oversized. The phone fits naturally in his hand, neither too small nor too large.
Phone usage: If Armin is talking on the phone, he holds it correctly with the top earpiece speaker near his ear and the bottom microphone toward his mouth. The phone is never held backwards or upside down; its orientation is always natural and realistic.
Environment:
luxury dark minimalist creative studio. Dark room, walls and furniture in deep tones around #0d0d0d. NOT a bright white room. Minimal dark desk, soft textured dark wall, a few design books, simple shelves, minimal decor. No clutter, no visible text.
Composition:
hero image for website, editorial lifestyle photography style.
Lighting:
natural everyday room lighting, not studio light. Soft shadows, natural falloff, good depth of field.
Requirements:
photorealistic, correct anatomy, natural hands and fingers, detailed realistic skin, detailed realistic dog fur, natural depth of field. No text in the image. No distortions, no extra limbs, no weird artifacts.
matching outfits (Armin and dog only, cap excluded) same color same fabric same pattern ::2
random clothing colors and patterns allowed for the outfit set ::1.5
cap always different color and material from the outfit ::2`
},

{
  id: '11',
  name: 'Metadata Generator',
  categories: ['SEO'],
  description: 'Takes a screenshot of any webpage and a target keyword, then produces five variations each of the page description, SEO title, meta description, Open Graph description, and Open Graph title. Output language matches the page language, with a full Persian translation provided for non-Persian pages.',
  ais: [
    'gpt-5.4-pro',
    'gpt-5.4',
    'claude-4.7-opus',
    'gemini-3.1-pro',
    'claude-4.6-sonnet',
    'grok-4',
    'gemini-2.5-pro',
    'deepseek-visiondeepseek-vision',
  ],
  pinned: true,
  locked: false,
  template: `شما یک متخصص سئو و کپی‌رایتینگ حرفه‌ای هستید. اسکرین‌شات یک صفحه وب (هر نوع صفحه) را می‌بینید. کار شما:

【مرحله ۱ – تشخیص زبان و نام برند مناسب】
ابتدا زبان اصلی متن داخل اسکرین‌شات را تشخیص بده. سپس نام برند را به این شکل تعیین کن:
• اگر زبان صفحه فارسی بود ← نام برند = «آرمین سیلاطانی»
• اگر زبان صفحه عربی بود ← نام برند در نسخهٔ اصلی = « آرمین سيلاطاني » و در نسخهٔ ترجمهٔ فارسی = «آرمین سیلاطانی »
• اگر زبان صفحه غیر از فارسی و غیر از عربی بود (انگلیسی، آلمانی، ترکی و...) → نام برند = «Armin Silatani»

【مرحله ۲ – تولید ۵ گزینه برای هرکدام】
برای من ۵ گزینه متفاوت برای هرکدام از موارد زیر تولید کن:
الف) توضیح صفحه (دوم شخص محترمانه – خطاب با «شما»)
ب) Title (تایتل سئو با نام برند در انتها و جداکننده |)
ج) Meta description (توصیفی، بدون خودستایی و با حداقل استفاده از «من»)
د) Open Graph description (توصیفی، شبیه توضیح صفحه و بدون فراخوان کلیک)
هـ) Open Graph title (بدون جداکننده، فقط عبارت طبیعی + نام برند)

【لحن کلی】
لحن رسمی، محترمانه، ساده و روان. در تمام متن‌ها کاربر را با «شما» خطاب کنید. از هرگونه عبارت ماشینی، اغراق‌آمیز یا شبه‌هوش‌مصنوعی پرهیز کنید. هدف، انتقال مستقیم و شفاف محتوای صفحه به خواننده است.

【بخش الف: توضیح صفحه (دوم شخص محترمانه)】
• ۵ گزینه مجزا، هرکدام بین ۱۲ تا ۲۵ کلمه.
• دقیقاً بگویید کاربر با ورود به این صفحه چه چیزهایی می‌بیند، چه محتوایی در اختیارش قرار می‌گیرد یا چه اطلاعاتی کسب می‌کند.
• به‌هیچ‌وجه از سؤال، عبارت عجیب، قلاب احساسی یا داستان‌پردازی استفاده نکنید. جمله‌ها شفاف و کارکردی باشند.
• مثال قابل قبول: «در این صفحه فهرست کامل خدمات دیجیتال مارکتینگ و تعرفهٔ هر بخش را مشاهده می‌کنید.»
• گزینه‌ها از نظر شروع جمله (مثلاً «در این صفحه ...» یا «شما در این صفحه با ... آشنا می‌شوید») با یکدیگر متفاوت باشند.

【بخش ب: تایتل سئو (SEO Title)】
• طول: ۴۰ تا ۵۵ کاراکتر.
• ساختار اجباری: [متن اصلی] | [نام برند بر اساس زبان]
• متن اصلی باید کاملاً عادی و رسمیِ طبیعی باشد، شبیه جمله‌ای که یک انسان می‌نویسد. از کلمات قدرتی مانند «راز»، «افزایش»، «روش شگفت‌انگیز» و ... استفاده نکنید.
• کلمه کلیدی اصلی که بعداً می‌گویم، حتماً در متن اصلی بیاید، اما بدون تصنع.
• هیچ علامت اضافه‌ای غیر از پایپ (|) با یک فاصله در دو طرف نداشته باشد.
• مثال: «هزینه طراحی سایت فروشگاهی | آرمین سیلاطانی»

【بخش ج: متا دسکریپشن (توصیفی، حداقل استفاده از «من»)】
• طول: ۱۳۰ تا ۱۵۵ کاراکتر.
• هدف این بخش فقط توضیح محتوای صفحه است، نه معرفی نویسنده. از جملاتی مثل «من سال‌ها تجربه دارم» یا «من این مسیر را طی کرده‌ام» پرهیز کنید.
• چنانچه ناچار به استفاده از «من» هستید، آن را به یک یا دو مورد محدود کنید و باقی جمله را به محتوا اختصاص دهید.
• به خواننده بفهمانید که در صفحه با چه اطلاعات، فهرست، راهنمایی یا داده‌ای روبه‌رو می‌شود.
• مثال: «در این صفحه تمام مراحل دریافت ویزای کار آلمان، از جمع‌آوری مدارک تا مصاحبه، به صورت گام‌به‌گام تشریح شده است.»
• مثال دیگر: «شرایط، هزینه‌ها و مدت زمان مورد نیاز برای طراحی لوگوی اختصاصی در این صفحه شفاف‌سازی شده است.»

【بخش د: او جی دسکریپشن (توصیفی، شبیه توضیح صفحه)】
• طول: ۶۰ تا ۹۰ کاراکتر.
• نسخه‌ای فشرده از توضیح صفحه بنویسید؛ دقیقاً بگوید کاربر با دیدن این صفحه به چه محتوایی دسترسی پیدا می‌کند.
• هیچ فراخوان به کلیک (CTA)، وعدهٔ نتیجه یا هیجان‌سازی نداشته باشد. صرفاً توصیف محتوا.
• مانند متا دسکریپشن، استفاده از ضمیر «من» را به حداقل برسانید.
• مثال: «تعرفهٔ دقیق خدمات طراحی سایت، جزئیات هر پلن و زمان تحویل پروژه در این صفحه درج شده است.»

【بخش هـ: او جی تایتل (بدون جداکننده)】
• طول: از نظر کاراکتر محدودیت سختگیرانه ندارد اما نباید طولانی باشد. یک عبارت طبیعی و کوتاه.
• ساختار: [یک عبارت ساده درباره موضوع صفحه] + یک فاصله + [نام برند]
• هیچ علامتی (پایپ، خط تیره، کاما و ...) میان عبارت و نام برند وجود ندارد. جمله با نام برند تمام می‌شود.
• این تایتل نباید شبیه SEO Title (فقط با حذف پایپ) باشد؛ جمله‌ای مستقل و توصیفی است که موضوع صفحه را می‌رساند.
• مثال‌های مورد انتظار: «تعرفه‌های طراحی وب‌سایت آرمین سیلاطانی»، «شرایط همکاری و هزینه‌ها آرمین سیلاطانی»، «نمونه‌کارهای تصویرسازی Armin Silatani».

【قوانین ضد هوش مصنوعی و تنوع】
• سه نقطه (...) در هیچ متنی به کار نرود.
• کلمات ممنوع: «نهایی»، «بهترین»، «راهنما»، «جامع‌ترین»، «کشف کنید»، «غواصی کنید»، «در این مقاله».
• طول جملات در میان ۵ گزینه هر بخش، به‌طور طبیعی متغیر باشد.
• هیچ تکراری در شروع یا ساختار جمله میان گزینه‌ها نباشد.
• متن‌ها باید کاملاً انسانی، ساده و غیررباتیک به نظر برسند.

【قانون ترجمه صفحات غیرفارسی】
اگر زبان صفحه فارسی نبود:
• برای همه بخش‌ها دو نسخه ارائه بده: نسخه اصلی به همان زبان + نسخه ترجمهٔ فارسی.
• در نسخه اصلی: نام برند = Armin Silatani.
• در نسخهٔ ترجمهٔ فارسی:
  - اگر زبان اصلی **عربی** بود، نام برند = «آرمین سيلاطاني» (با يای عربی).
  - در غیر این صورت، نام برند = «آرمین سیلاطانی».
• ساختار تایتل‌ها در نسخهٔ اصلی: [متن همان زبان] | Armin Silatani.
• ساختار تایتل‌ها در نسخهٔ ترجمه: [متن فارسی] | [نام برند مناسب فارسی].
• OG Title در نسخهٔ ترجمه: [عبارت فارسی] + فاصله + [نام برند فارسی] بدون جداکننده.
• نحوه چینش: برای هر گزینه، ابتدا جمله به زبان اصلی، سپس بلافاصله ترجمهٔ فارسی با پیشوند «ترجمه:».
• مثال SEO Title انگلیسی: «Website design pricing | Armin Silatani»
  ترجمه: «تعرفه طراحی وب‌سایت | آرمین سیلاطانی»
• مثال SEO Title عربی: «أسعار تصميم المواقع | آرمين سيلاطاني»
  ترجمه: «تعرفه طراحی وب‌سایت | آرمين سيلاطاني»
• مثال OG Title انگلیسی: «Pricing of design services Armin Silatani»
  ترجمه: «تعرفه خدمات طراحی آرمین سیلاطانی»
• اگر زبان صفحه فارسی بود: فقط یک نسخهٔ فارسی با برند «آرمین سیلاطانی».

【قالب خروجی برای صفحات فارسی】
=== توضیح صفحه (دوم شخص محترمانه – ۵ گزینه) ===
۱. [متن]
...
=== تایتل‌ها ===
۱. [متن اصلی] | آرمین سیلاطانی
...
=== متا دسکریپشن‌ها (توصیفی) ===
۱. [متن]
...
=== او جی دسکریپشن‌ها (توصیفی) ===
۱. [متن]
...
=== او جی تایتل‌ها ===
۱. [عبارت] آرمین سیلاطانی
۲. [عبارت] آرمین سیلاطانی
...

【قالب خروجی برای صفحات غیرفارسی (نمونه با انگلیسی)】
=== توضیح صفحه (دوم شخص محترمانه – ۵ گزینه) ===
۱. [English description]
ترجمه: [Persian translation]
...
=== تایتل‌ها ===
۱. [English Main text] | Armin Silatani
ترجمه: [متن اصلی فارسی] | آرمین سیلاطانی
...
=== متا دسکریپشن‌ها (توصیفی) ===
۱. [English meta description]
ترجمه: [Persian translation]
...
=== او جی دسکریپشن‌ها (توصیفی) ===
۱. [English OG description]
ترجمه: [Persian translation]
...
=== او جی تایتل‌ها ===
۱. [English phrase] Armin Silatani
ترجمه: [عبارت فارسی] آرمین سیلاطانی
...

هیچ توضیح اضافه‌ای بیرون این قالب ننویس.
اکنون کلمه کلیدی اصلی صفحه را وارد می‌کنم:
{{KEYWORD}}
و اسکرین‌شات را ضمیمه می‌کنم`
},

{
  id: '12',
  name: 'Web Tool Maker',
  categories: ['Code'],
  description: 'Reads a Persian tool description and generates a complete three-file SaaS web tool in vanilla HTML, CSS, and JavaScript. It derives all English UI text from the Persian input, applies a consistent dark design system with a custom font and accent colour, and includes a fixed-format branded footer and glass-effect header.Handles',
  ais: [
    'gpt-5.4-pro',
    'gpt-5.4',
    'claude-4.7-opus',
    'gpt-5.3-codex',
    'claude-4.6-sonnet',
    'gemini-3.1-pro',
    'o3-pro',
    'qwen-3-coder',
    'deepseek-v4-pro',
    'grok-4',
  ],
  pinned: false,
  locked: false,
  template: `Generate a modular, minimal, and modern SaaS-style web tool. The tool must be entirely in English. Output **only** three separate files: \`index.html\`, \`assets/{{TOOL_NAME}}.css\`, and \`assets/{{TOOL_NAME}}.js\`. No external libraries or CDNs are allowed – everything must be vanilla HTML, CSS, and JavaScript. **Do not include any extra text, commentary, or explanations. Only output the three code blocks.**

## INPUT PARAMETERS (fill these once – they apply everywhere below)
- TOOL_NAME = {{TOOL_NAME}}
- TITLE = {{TITLE}}
- LOGO_URL = {{LOGO_URL}}
- ACCENT_COLOR = {{ACCENT_COLOR}}
- TOOL_DESCRIPTION_FA = {{TOOL_DESCRIPTION_FA}}

## Important: Generating English UI Text from Persian Description
- Read TOOL_DESCRIPTION_FA carefully. It describes the tool's purpose and functionality in Persian.
- Based on it, generate a concise **English one-line benefit sentence** (SHORT_DESC) that will appear under the header as a tagline.
- Also, generate all necessary English labels, button texts, placeholder texts, and any other visible text in the UI. The entire tool UI must be in English.
- Implement the full interactive logic in JavaScript according to the described functionality.

## Global Design & Branding
- **Colors**:
  - Background: \`#0d0d0d\`
  - Primary text: \`#f5f5f5\`
  - Accent (interactive elements): ACCENT_COLOR
- **Typography**: Use the "Kalameh" font family (see font face rules below). All text uses this font, weight 400 by default, weight 900 for headings or emphasis.
- **Layout**: Extremely clean, minimal, generous whitespace. Fully responsive (mobile first). Subtle borders and smooth hover transitions.
- **File naming**: Replace TOOL_NAME in all file names and paths.
- Use \`var(--border)\` for border colors in CSS, defined in \`:root\` as \`rgba(255,255,255,0.08)\`.
- Use \`var(--accent)\` for the accent color throughout CSS, defined in \`:root\` as ACCENT_COLOR.
- Use \`var(--text)\` for primary text color, defined in \`:root\` as \`#f5f5f5\`.

## Fixed Footer
The footer must be included exactly as shown. Place the HTML in \`index.html\` and the CSS in \`assets/{{TOOL_NAME}}.css\` without modification.

Footer HTML (placed at the end of \`<body>\` in \`index.html\`):
\`\`\`html
<footer class="footer">
    <div class="footer-signature">
        <a href="https://arminsilatani.com/en/"
           target="_blank"
           rel="noopener noreferrer"
           title="Armin Silatani | Official Website">
            <span class="crafted">crafted by</span>
            <img src="assets/ArminSilatani.svg"
                 alt="Armin Silatani"
                 class="signature">
        </a>
    </div>
</footer>
\`\`\`

Footer CSS (copy this block exactly into assets/{{TOOL_NAME}}.css):
\`\`\`css
/* ------------------------- FOOTER ------------------------- */
.footer {
  padding: 30px 0;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border);
}

.footer-signature {
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.footer-signature:hover {
  opacity: 1;
}

.crafted {
  font-size: 10px;
  color: #7a7a7a;
  letter-spacing: 0.08em;
}

.signature {
  height: 20px;
  transform: translateY(-2px);
  opacity: 0.85;
  filter: brightness(0.9) contrast(1.05);
}

/* =========================== FOOTER LINK OVERRIDE ============================ */
.footer-signature a {
  display: contents;
  text-decoration: none;
  color: inherit;
}

.footer-signature a:hover {
  text-decoration: none;
}
\`\`\`

## Font Loading (Fixed CSS)
Include these @font-face rules at the very top of assets/{{TOOL_NAME}}.css:
\`\`\`css
@font-face {
    font-family: "Kalameh";
    src: url("../../assets/fonts/KalamehWeb-Regular.woff2") format("woff2"),
         url("../../assets/fonts/KalamehWeb-Regular.woff") format("woff");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "Kalameh";
    src: url("../../assets/fonts/KalamehWeb-Black.woff2") format("woff2"),
         url("../../assets/fonts/KalamehWeb-Black.woff") format("woff");
    font-weight: 900;
    font-style: normal;
    font-display: swap;
}
\`\`\`

Set the body font to 'Kalameh', sans-serif, background to #0d0d0d, color to #f5f5f5.

## Header Structure (Glass Header)
The header must follow this exact HTML structure, but replace the placeholder text with the generated English content:
\`\`\`html
<div class="glass-header">
    <div class="header-inner">
        <img src="{{LOGO_URL}}"
             alt="{{TOOL_NAME}} Logo"
             class="header-logo"
             onerror="this.style.display='none'">
        <div class="header-text">
            <h1 class="tool-name">{{TOOL_NAME}}</h1>
            <h2 class="tool-tagline">{{TITLE}}</h2>
        </div>
    </div>
    <p class="tool-description"><!-- generated SHORT_DESC --></p>
</div>
\`\`\`

Styling requirements for the header:
• The header itself should have a subtle glassmorphism effect:
background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05);

Fixed header CSS (must use these exact styles):
• \`.header-inner\` must use:
\`\`\`css
.header-inner {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
}
\`\`\`

• \`.tool-name\` must use:
\`\`\`css
.tool-name {
    font-weight: 900;
    font-size: 22px;
    line-height: 22px;
    margin-top: 7px;
    color: var(--text);
}
\`\`\`

• The logo (img.header-logo) must have a fixed height (e.g., 40px). Its width should be auto.
• The \`.header-text\` contains the h1 (tool name) and h2 (tagline, font-weight: 400) stacked vertically with no margin between them.
• The combined line-height of the h1 and h2 must exactly equal the logo's height. The text block sits perfectly aligned with the logo vertically.
• Below \`.header-inner\`, a \`<p class="tool-description">\` displays the generated SHORT_DESC with a slightly muted color, smaller font size, and a little top margin.

## File Paths & Linking
• \`index.html\` must link to the CSS and JS using relative paths:
\`\`\`html
<link rel="stylesheet" href="assets/{{TOOL_NAME}}.css">
<script src="assets/{{TOOL_NAME}}.js" defer></script>
\`\`\`

• The CSS file is located at assets/{{TOOL_NAME}}.css, the JS file at assets/{{TOOL_NAME}}.js. The footer SVG is at assets/ArminSilatani.svg – do not change that path.
• The font file paths ../../assets/fonts/... must remain exactly as written.

## Tool Functionality
The tool must fully implement the functionality described in TOOL_DESCRIPTION_FA. Generate all required English UI text (labels, buttons, placeholders, etc.). Use ACCENT_COLOR for primary buttons, active states, links, and progress indicators. Make the main tool area centered with a max-width container (e.g., 800px) and generous padding. The entire tool must work offline in all modern browsers.

## Output Format
Generate exactly three files with these exact filenames:
1. \`index.html\`
2. \`assets/{{TOOL_NAME}}.css\`
3. \`assets/{{TOOL_NAME}}.js\`

Present each file wrapped in a code block with its filename as a label. Output nothing else.

Example format:
\`\`\`html
[index.html content here]
\`\`\`

\`\`\`css
[assets/{{TOOL_NAME}}.css content here]
\`\`\`

\`\`\`javascript
[assets/{{TOOL_NAME}}.js content here]
\`\`\``
},

{
  id: '13',
  name: 'Code Refactor Pro',
  categories: ['Code'],
  description: 'Takes any HTML, CSS, JavaScript, or PHP file and refactors it — fixing indentation, reordering misplaced blocks, removing redundant code, and adding minimap-friendly structural comments. The website’s appearance, text content, and behaviour remain completely unchanged. A standardised author signature is inserted at the top of the output.',
  ais: [
    'claude-4.7-opus',
    'gpt-5.4-pro',
    'claude-4.6-sonnet',
    'gpt-5.4',
    'gpt-5.3-codex',
    'gemini-3.1-pro',
    'qwen-3-coder',
    'deepseek-v4-pro',
    'o3-pro',
    'grok-4',
  ],
  pinned: true,
  locked: false,
  template: `You are a senior software engineer and code refactoring expert.

Your task is to CLEAN, ORGANIZE, and REFACTOR the provided code while keeping functionality and visuals 100% intact.

═══════════════════════════════════════════
AUTO‑SIGNATURE (MANDATORY – UNIFORM STYLE)
═══════════════════════════════════════════
Insert at the very top of the final code a signature block with the following EXACT appearance:

/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: <today's date in YYYY-MM-DD format>
  *  Version: <existing version if present, otherwise 0.0.0>
  ****************************************************
*/

RULES FOR THE SIGNATURE:
1. The visual structure (asterisk box) MUST be identical in every file.
2. If the outer language does not support /* */ (e.g., HTML), wrap the IDENTICAL block with the correct syntax:
   - For HTML: use <!-- ... --> as the outer wrapper, but keep the exact same text pattern inside.
     Example:
     <!--
       ****************************************************
       *  Author: Armin Silatani
       *  Date: <today's date in YYYY-MM-DD format>
       *  Version: <existing version if present, otherwise 0.0.0>
       ****************************************************
     -->
   - For CSS, JS, PHP: use /* ... */ as shown above (the default).
3. The signature is the very first thing in the output; no other content before it.
4. The Date field MUST be replaced with today's actual date in YYYY-MM-DD format (the date when the output is generated).
   The Version field MUST be exactly the version number that already exists in the original code.
   If no version is present anywhere in the original file, use "0.0.0".
   Never change or reset the existing version; only carry it forward exactly as it was (or set to 0.0.0 if missing).

═══════════════════════════════════════════
LANGUAGE DETECTION & COMMENT SYNTAX
═══════════════════════════════════════════
1. Immediately identify the predominant language of the provided code (HTML, CSS, JavaScript, PHP, etc.).
2. All structural comments you add (Page‑Level, Section‑Level, Global‑Block) MUST use the comment syntax native to that language.
3. If the file contains multiple languages:
   - Use the top‑level file’s comment syntax for main separators placed in the HTML body.
   - Inside <style> or <script> blocks, use CSS/JS comment syntax only for inline organizational notes (keep minimal).

═══════════════════════════════════════════
IMPORTANT & NON‑NEGOTIABLE RULES
═══════════════════════════════════════════
1. You are allowed to modify CODE ONLY (HTML, CSS, JS, PHP, etc.).
2. You are NOT allowed to modify, rewrite, shorten, summarize, or change ANY textual content of the website.
3. You are NOT allowed to change styles, colors, layout, spacing, or any visual aspect of the site.
4. The final output must produce a website that looks and behaves EXACTLY the same as before.

CODE ORGANIZATION REQUIREMENTS:
• Reformat and beautify code for maximum clarity.
• Fix indentation, spacing, and nesting.
• Relocate misplaced blocks into correct logical structure.
• Group related code sections together clearly.
• Ensure CSS rules stay visually identical (no behavioral change).

COMMENT RULES:
• Remove useless or redundant comments.
• Keep only high‑value comments describing major sections.
• All comments must be in English.

═══════════════════════════════════════════
MINIMAP‑FRIENDLY STRUCTURAL COMMENTS
═══════════════════════════════════════════
All Page‑Level, Section‑Level, and Global‑Block comments must be designed to be instantly visible in a code editor’s minimap / overview panel.
To achieve this:
- Make each separator a full‑width line spanning approximately 80 characters (or the full line width).
- Center the label inside the line, padded with the separator symbol.
- Use clearly different symbols for each level so they can be distinguished at a glance even when zoomed out.

For HTML files:
    1️⃣ Page-Level        <!-- =========================== HOME PAGE ============================ -->
    2️⃣ Section-Level     <!-- ------------------------- HERO SECTION ------------------------- -->
    3️⃣ Global/System     <!-- :::::::::::::::::::::::::: FAVICON & STYLES :::::::::::::::::::::::::: -->

For CSS / JS / PHP files:
    1️⃣ Page-Level        /* =========================== HOME PAGE ============================ */
    2️⃣ Section-Level     /* ------------------------- HERO SECTION ------------------------- */
    3️⃣ Global/System     /* :::::::::::::::::::::::::: FAVICON & STYLES :::::::::::::::::::::::::: */

Apply these consistently throughout the entire codebase.
The combined effect will produce clear, easily scannable “lane markers” in the minimap.

═══════════════════════════════════════════
CODE STRUCTURE ORDERING RULE
═══════════════════════════════════════════
If the provided code sections are out of order (e.g., footer before body content, scripts misplaced), reorder them into the correct logical and visual structure WITHOUT modifying the content inside each block.

Correct logical order example:
- <head>
- header
- navigation
- hero / intro
- main content
- sections (about, features, products, etc.)
- sidebar (if exists)
- footer
- scripts (at the bottom)

Only reorder if the original is clearly misplaced. Never change appearance, classes, IDs, selectors, or CSS rules. Do not rewrite HTML text content. All textual content must remain exactly unchanged.

Do NOT change the loading order of scripts, styles, or dependencies.

After the structural refactoring, perform a second review to check:
• Duplicate functions
• Overlapping logic
• Redundant variables
• Unused code
• Repeated CSS rules
• Dead code

Merge or remove redundancies ONLY if it does NOT break the website.

Follow modern best practices for the language.
Improve naming clarity only if it doesn’t break references.
Keep the code modular, easy to navigate, and clean.

Provided code:
{{CODE}}`
},

{
  id: "14",
  name: "JSON-LD Builder",
  categories: [
    "SEO",
    "Code",
  ],
  description: 'Takes a screenshot of any page on the site, identifies the page type and language from the URL, selects the right Schema.org types from a fixed master list, asks clarifying questions in Persian before writing anything, then outputs a single production-ready JSON-LD block with all entities properly linked and Google’s required fields filled in.',
  ais: [
    "claude-4.7-opus",
    "gpt-5.4-pro",
    "gpt-5.5",
    "gpt-5.4",
    "gemini-3.1-pro",
    "claude-4.6-sonnet",
    "grok-4",
    "gemini-2.5-pro",
    "o3-pro",
    "deepseek-vision",
  ],
  pinned: true,
  locked: false,
  template: `You are a senior technical SEO and Schema.org expert. I will provide you with an image of a specific page from a large multilingual website. The website is a personal brand site that showcases the owner’s portfolio, resume, services for purchase, and a blog. The site has pages in these 6 languages: Persian (fa), English (en), Arabic (ar), Turkish (tr), German (de), Italian (it). All pages follow the URL pattern described below.

Your job is to generate a complete, production-ready **single JSON-LD block** using \`@graph\` that includes all appropriate Schema.org types for **that exact page** selected exclusively from the master list provided below. You must follow Google's structured data guidelines strictly.

**CRITICAL LANGUAGE RULE**:
- First, determine the language of the page from its URL (e.g., /en/ means English, /de/ means German, no subdirectory means Persian, etc.).
- **ALL textual content** in the final JSON-LD (such as \`name\`, \`description\`, \`headline\`, \`text\`, FAQ question/answer strings, \`jobTitle\`, \`addressLocality\`, etc.) **must be written in the same language as the page itself**. Do not mix languages. If the page is German, output German text; if English, English; if Italian, Italian; if Turkish, Turkish; if Arabic, Arabic; if Persian, Persian. Only use the text visible on the page or its known translations, and translate any baseline data (like tagline) when required.

**SITE BASELINE DATA (pre-filled, do NOT ask about these again):**

- **Domain**: \`https://arminsilatani.com\` (Persian main), with subdirectories \`/en/\`, \`/ar/\`, \`/tr/\`, \`/de/\`, \`/it/\` for other languages.
- **Identity**: Person, not an Organization.
  - **Name**: آرمین سیلاطانی (Armin Silatani in English)
  - **Job Title**: Digital Marketing Specialist
  - **Logo/Image**: \`https://arminsilatani.com/images/favicon.png\`
  - **Description/Tagline (Persian)**: طراحی سایت، خدمات سئو حرفه‌ای و تبلیغات گوگل ادز — ارائه توسط آرمین سیلاطانی. مشاوره رایگان
  - **Founding Year**: 2020 (1400 in Persian calendar)
- **Contact Details**:
  - Email: \`contact@arminsilatani.com\`
  - Phone: \`+989125759466\`
- **Social Profiles** (use \`sameAs\` for Person):
  - LinkedIn: \`https://www.linkedin.com/in/arminsilatani/\`
  - GitHub: \`https://github.com/Arminsilatani\`
  - Instagram: \`https://www.instagram.com/arminsilatani\`
  - Telegram: \`https://t.me/ArminSilatani\`
  - WhatsApp: \`https://wa.me/+989125759466\`
- **Key Site Pages** (for BreadcrumbList etc.):
  - Home: \`https://arminsilatani.com/\` (and lang variants)
  - Services: \`https://arminsilatani.com/services/\`
  - Blog: \`https://arminsilatani.com/blog/\`
  - Tools: \`https://tools.arminsilatani.com/\`
  - CV Download: \`https://arminsilatani.com/download/cv/\`
- **Search**: Not mentioned; assume no internal search unless shown in image.

**Step-by-step process you MUST follow:**

1. **Analyze the image** provided for the specific page. Identify:
   - Page type (e.g., home, about, contact, service, product, blog post, article, FAQ, search results, etc.)
   - Language from URL (look for \`/fa/\` or lack of subdirectory for Persian; /en/, /ar/, etc.)
   - All visible structured data: titles, names, dates, prices, ratings, authors, images, etc.

2. **Schema selection**: From the master list below, select all applicable types for the entities and content of **this page**. Use the most specific type available (e.g., if it's a service page for digital marketing, use \`Service\`; if a blog post, use \`BlogPosting\`; if a contact page, use \`ContactPage\`, etc.). Always include:
   - \`WebSite\` (for the overall site)
   - \`WebPage\` (the specific page, e.g., \`AboutPage\`, \`ContactPage\`, \`FAQPage\`, \`CollectionPage\`, etc.)
   - \`Person\` (representing Armin Silatani), linked as \`author\` or \`about\` as appropriate.
   - \`BreadcrumbList\` if navigation path is implied.

3. **Multilingual handling**:
   - Identify the current page’s language from the URL in the image.
   - If the language subdirectory is visible, infer the same page’s URLs for all 6 languages using the pattern:
     - Persian: \`https://arminsilatani.com/...\`
     - English: \`https://arminsilatani.com/en/...\`
     - Arabic: \`https://arminsilatani.com/ar/...\`
     - Turkish: \`https://arminsilatani.com/tr/...\`
     - German: \`https://arminsilatani.com/de/...\`
     - Italian: \`https://arminsilatani.com/it/...\`
   - Use \`sameAs\` only for verified external profile/entity URLs, especially on \`Person\` when applicable. Do not use \`sameAs\` for alternate language versions of the same page. For multilingual page variants, use appropriate language-aware properties such as \`inLanguage\`, \`url\`, and clearly structured page identifiers, and only include inferred alternate URLs when the URL pattern is reliable.
   - If the URL pattern in the image does not allow inference, ask me for the exact URLs.

4. **Interactive clarification (IMPORTANT)**:
   - Before outputting the final JSON-LD, compile a **clear, numbered list of questions** about any missing, ambiguous, or incomplete data that is REQUIRED or STRONGLY RECOMMENDED by Google’s guidelines for the types you selected. This includes items like missing prices for \`Product\`, missing author for \`Article\`, missing questions/answers for \`FAQPage\`, etc.
   - Do NOT ask about the baseline data already provided above (name, logo, social profiles, etc.).
   - **Ask all questions in Persian (فارسی).**
   - **Wait for my answers.** After I respond, incorporate all the information and produce the final JSON-LD. If after my answers something is still missing, issue a stern warning in the final response.

5. **Final JSON-LD construction**:
   - Output a single \`<script type="application/ld+json">\` block containing a JSON object with \`"@context": "https://schema.org"\` and \`"@graph": [...]\`.
   - Every node must have \`@type\` and \`@id\` (use meaningful anchors, e.g., \`#website\`, \`#person\`, \`#main-entity\`, \`#webpage\`).
   - Link entities properly (e.g., \`WebPage.author\` → \`Person\`, \`WebSite.publisher\` → \`Person\` or \`Organization\`).
   - Populate all known fields. Use \`inLanguage\` where relevant.
   - Follow Google's required/recommended properties. If any rich-result eligibility is compromised due to missing data that I did not provide, add a **WARNING comment** key \`_warnings\` inside the JSON.
   - Use ISO 8601 dates, proper numeric types for ratings/prices, and valid URLs.

6. **Strictness & Compliance**:
   - No deprecated fields.
   - Ensure all URLs are absolute, using the canonical domain.
   - If a page type like \`CheckoutPage\` is selected, ensure all required nested types (e.g., \`Product\`, \`Offer\`) are present or ask for them.
   - Do not add types not justified by the visible content.

**MASTER LIST OF ALLOWED SCHEMA TYPES** (you can only pick from these):

schema:WebSite
schema:WebPage
schema:AboutPage
schema:ContactPage
schema:FAQPage
schema:ProfilePage
schema:QAPage
schema:CheckoutPage
schema:CollectionPage
schema:SearchResultsPage
schema:Organization
schema:Corporation
schema:LocalBusiness
schema:ProfessionalService
schema:Service
schema:FinancialService
schema:MedicalOrganization
schema:Dentist
schema:LegalService
schema:AccountingService
schema:AutoRepair
schema:AutomotiveBusiness
schema:BeautySalon
schema:Store
schema:ComputerStore
schema:ElectronicsStore
schema:FurnitureStore
schema:GroceryStore
schema:HardwareStore
schema:HealthClub
schema:HomeAndConstructionBusiness
schema:InternetCafe
schema:Locksmith
schema:NailSalon
schema:RealEstateAgent
schema:Restaurant
schema:CafeOrCoffeeShop
schema:Bakery
schema:TravelAgency
schema:LodgingBusiness
schema:Hotel
schema:BedAndBreakfast
schema:Person
schema:EmployeeRole
schema:Article
schema:NewsArticle
schema:Blog
schema:BlogPosting
schema:DiscussionForumPosting
schema:AnalysisNewsArticle
schema:BackgroundNewsArticle
schema:Report
schema:Review
schema:CriticReview
schema:Comment
schema:CreativeWork
schema:CreativeWorkSeries
schema:DigitalDocument
schema:AudioObject
schema:AudioObjectSnapshot
schema:VideoObject
schema:Movie
schema:TVSeries
schema:Episode
schema:ImageObject
schema:Clip
schema:Drawing
schema:3DModel
schema:Product
schema:Offer
schema:AggregateOffer
schema:AggregateRating
schema:Brand
schema:MerchantReturnPolicy
schema:SizeSpecification
schema:JobPosting
schema:PropertyValue
schema:mpn
schema:gtin
schema:sku
schema:PriceSpecification
schema:UnitPriceSpecification
schema:DeliveryTimeSettings
schema:Demand
schema:ItemList
schema:BreadcrumbList
schema:HowTo
schema:SpeakableSpecification
schema:Recipe
schema:Event
schema:BusinessEvent
schema:EducationEvent
schema:MusicEvent
schema:SportsEvent
schema:SaleEvent
schema:Festival
schema:TheaterEvent
schema:CourseInstance
schema:EventSeries
schema:EducationalOrganization
schema:LearningResource
schema:Book
schema:Place
schema:CivicStructure
schema:TouristAttraction
schema:TouristDestination
schema:LandmarksOrHistoricalBuildings
schema:Airport
schema:Park
schema:Museum
schema:StadiumOrArena
schema:MedicalCondition
schema:MedicalCause
schema:MedicalProcedure
schema:MedicalTest
schema:Hospital
schema:Diet
schema:Drug
schema:DoseSchedule
schema:OccupationalTherapy
schema:PhysicalTherapy
schema:Dataset
schema:DataCatalog
schema:DataDownload
schema:SoftwareApplication
schema:MobileApplication
schema:WebApplication
schema:APIReference
schema:Code
schema:ComputerLanguage
schema:Trip
schema:Flight
schema:FlightReservation
schema:HotelRoom
schema:LodgingReservation
schema:TrainTrip
schema:BusTrip
schema:TouristTrip
schema:Car
schema:TaxiReservation
schema:BankAccount
schema:CreditCard
schema:PaymentService
schema:Invoice
schema:LikeAction
schema:DislikeAction
schema:FollowAction
schema:ShareAction
schema:CommentAction
schema:CommunicateAction
schema:Message
schema:Occupation
schema:Game
schema:VideoGame
schema:MusicRecording
schema:MusicAlbum
schema:MusicGroup
schema:Vehicle
schema:BoatTrip
schema:Menu
schema:MenuItem
schema:WebPageElement
schema:InteractionCounter
schema:EntryPoint
schema:SoftwareSourceCode

Now, please examine the image I attach and follow the instructions exactly. Start by identifying the page type, choosing the schemas, and then ask me any necessary clarifying questions (that are not covered by the baseline data) before you write the final JSON-LD.`
},

{
  id: "15",
  name: "Brand Identity Builder",
  categories: [
    "Project Management"
  ],
  description: 'Give it a one-line description of your tool and it handles the naming side of things: a unique Italian-flavoured word, a dark-background-safe HEX colour, and five ready-to-use English titles. It finishes by pointing out which title is most popular among developers and which ranks highest for search.',
  ais: [
    "gpt-5.4-pro",
    "gpt-5.4",
    "claude-4.7-opus",
    "gpt-5.5",
    "claude-4.6-sonnet",
    "gemini-3.1-pro",
    "grok-4",
    "qwen-3-max",
    "deepseek-v4-pro",
    "gemini-2.5-pro",
  ],
  pinned: false,
  locked: false,
  template: `تو یک مشاور نام‌گذاری و برندینگ حرفه‌ای هستی. کاربر توضیح می‌دهد که ابزار جدیدش چه کاری انجام می‌دهد. وظیفهٔ تو انجام هم‌زمان دو کار است:
بخش ۱ – نام اختصاصی و رنگ منحصربه‌فرد:
بر اساس قوانین زیر یک نام تک‌کلمه‌ای ایتالیایی‌وار و یک کد رنگ HEX پیشنهاد بده:
•	نام باید تک‌کلمه‌ای، ساده و با حال‌وهوای ایتالیایی باشد (معنی داشتنش مهم نیست، تلفظ آسان کافی است).
•	پیشوند دوحرفی نام نباید با هیچ‌یک از این پیشوندهای سرویس‌های قبلی یکسان باشد:
Co, No, Qe, Ti, Se, Br, So, Ve, Zo, Ga, Xe, Di, Pa, Le, Hi, Jo, Mi, Ra, Ri, Ye, Ce, Ub, Fr, Re, Pi, Lu, Fa, Ta, Va, Al, Ma
•	رنگ باید روی پس‌زمینهٔ #0D0D0D کاملاً خوانا باشد (روشن یا با کنتراست بالا) و با هیچ‌یک از این رنگ‌های قبلی یکسان نباشد:
#F04E98, #3FA9F5, #F29F05, #00D18A, #F6C700, #FF4747, #8E79FF, #42E5F4, #FD7E14, #E73CF5, #3FE56A, #29B6F6, #FFC857, #9CDB43, #F25F5C, #4DD0E1, #4CAF50, #FF6F91, #6BE6CF, #C79EF2, #7ED957, #E0A414, #FF4FA7, #6C63FF, #A200FF, #00E5FF, #FF6B00, #B0FFA5, #5CE1E6, #74F0B8, #5BE7FF
بخش ۲ – عنوان انگلیسی ابزار:
کاربر توضیح می‌دهد ابزارش چه کاری انجام می‌دهد (مثلاً «تولید نقشه سایت»). تو باید:
•	۵ عنوان انگلیسی کاربردی و رایج برای چنین ابزاری پیشنهاد دهی (مانند Sitemap Builder, Sitemap Generator, Sitemap Creator و غیره).
•	سپس مشخص کنی که از بین این ۵ مورد، کدام یک معمولاً بیشتر توسط توسعه‌دهندگان انتخاب می‌شود (محبوب‌ترین سبک نام‌گذاری) و کدام یک بیشترین جستجوی ماهانه را در موتورهای جستجو دارد (با توجه به روندهای عمومی سئو).
فرمت نهایی خروجی (دقیقاً به این صورت و بدون هیچ توضیح اضافه):
text
نام اختصاصی: [نام تک‌کلمه‌ای]
رنگ: #[HEX]
---عناوین پیشنهادی---
۱. [عنوان ۱]
۲. [عنوان ۲]
۳. [عنوان ۳]
۴. [عنوان ۴]
۵. [عنوان ۵]
---تحلیل---
عنوانی که معمولاً انتخاب می‌شود: [عنوان]
عنوانی که بیشتر جستجو می‌شود: [عنوان]
حالا کاربر، ابزار خود را توضیح بده. {{TOOL DESCRIPTION}}`
},

{
  id: "16",
  name: "Package Price Planner",
  categories: [
    "Project Management",
  ],
  description: 'Structures a pricing system for digital services aimed at SMBs and startups. It splits everything into two tabs — standard and advanced — with three packages in each. Each package lists its included services with individual prices that add up to the package total, plus a separate add-on section.',
  ais: [
    "gpt-5.4-pro",
    "claude-4.7-opus",
    "gpt-5.4",
    "gpt-5.5",
    "claude-4.6-sonnet",
    "gemini-3.1-pro",
    "o3-pro",
    "deepseek-v4-pro",
    "grok-4",
    "gemini-2.5-pro",
  ],
  pinned: false,
  locked: false,
  template: `نقش: کارشناس قیمت‌گذاری خدمات دیجیتال و بسته‌بندی خدمات بین‌المللی
شما یک متخصص قیمت‌گذاری خدمات دیجیتال برای SMBها و استارتاپ‌ها هستید. هدف شما ایجاد سیستم قیمت‌گذاری ماژولار، مقیاس‌پذیر، رقابتی و ارزش‌محور است.
________________________________________
ساختار و معماری خدمات (غیرقابل تغییر)
1. نام‌گذاری
•	نام سرویس: فارسی، مگر در موارد تکنولوژیکی خاص
•	نام خدمات داخلی: فارسی و قابل فهم برای مشتری ایرانی/بین‌المللی
2. Tabs (دو سطح قیمت - الزامی)
•	تب اول: استاندارد (اقتصادی/عمومی) - برای مشتریان با بودجه محدود
•	تب دوم: پیشرفته (حرفه‌ای/گران) - برای مشتریان با نیاز به خدمات پیشرفته‌تر
3. Packages (3 پکیج در هر تب - الزامی)
•	پایه (Basic): ارزان‌ترین گزینه با خدمات اساسی
•	حرفه‌ای (Professional): متوسط قیمت با خدمات متعادل
•	پریمیوم (Premium): گران‌ترین با خدمات جامع
جمعاً 6 پکیج: 3 پکیج در تب استاندارد + 3 پکیج در تب پیشرفته
4. Default Services (خدمات پیش‌فرض داخل هر پکیج)
•	تعداد: حداقل 5 تا 8 آیتم در هر پکیج (بسته به پیچیدگی سرویس)
•	ساختار هر آیتم: 
o	نام فارسی خدمت (واضح و قابل فهم)
o	کد استاندارد سه‌بخشی سه‌حرفی: تب_پکیج_خدمت (مثال: STD_BAS_TEC, ADV_PRM_CNT)
o	قیمت دلاری مستقل
o	توضیح مختصر (در صورت نیاز)
قانون طلایی: جمع قیمت تمام Default Services هر پکیج باید دقیقاً با قیمت کل پکیج برابر باشد.
5. Add-Ons (خدمات اضافی - الزامی)
•	خدمات قابل انتخاب (Checkbox based) برای افزایش درآمد بدون تغییر پکیج اصلی
•	ساختار هر Add-on: 
o	نام فارسی
o	کد استاندارد سه‌بخشی سه‌حرفی: ADD_موضوع_سطح (مثال: ADD_BKL_PRM, ADD_CNT_EXT)
o	قیمت دلاری مستقل
o	واحد قیمت‌گذاری (هر عدد، هر ساعت، یکبار، ماهانه و…)
•	هدف: دادن حس کنترل قیمت به کاربر و افزایش فروش
6. Pricing Rules (قوانین قیمت‌گذاری)
•	ارز: دلار آمریکا ($)
•	بازار هدف: بین‌المللی (Global)
•	رقابتی اما نه ارزان‌فروشی: قیمت‌ها باید منطقی و متناسب با ارزش باشند
•	اختلاف قیمت منطقی: 
o	بین پکیج‌های یک تب: حداقل 1.5x تا 2x
o	بین دو تب (استاندارد و پیشرفته): حداقل 2x تا 2.5x برای پکیج‌های مشابه
•	مدل‌های کیفیتی: در صورت وجود سطوح کیفیت (مثل بک‌لینک، رپورتاژ)، حداکثر 2 مدل: استاندارد و پریمیوم
7. کدگذاری استاندارد (الزامی)
فرمت کلی: بخش1_بخش2_بخش3 (هر بخش 3 حرف انگلیسی بزرگ)
برای Default Services:
•	بخش 1: تب (STD = استاندارد، ADV = پیشرفته)
•	بخش 2: پکیج (BAS = پایه، PRO = حرفه‌ای، PRM = پریمیوم)
•	بخش 3: نوع خدمت (مثال: TEC = تکنیکال، CNT = محتوا، RPT = گزارش)
برای Add-Ons:
•	بخش 1: همیشه ADD
•	بخش 2: موضوع خدمت (مثال: BKL = بک‌لینک، CNT = محتوا، RPR = رپورتاژ)
•	بخش 3: سطح یا نوع (مثال: STD = استاندارد، PRM = پریمیوم، EXT = اضافی)
مثال‌های صحیح:
•	STD_BAS_TEC = تکنیکال SEO در پکیج پایه تب استاندارد
•	ADV_PRM_CNT = تولید محتوا در پکیج پریمیوم تب پیشرفته
•	ADD_BKL_PRM = بک‌لینک پریمیوم (Add-on)
•	ADD_CNT_EXT = محتوای اضافی (Add-on)
________________________________________
Output Format (فرمت خروجی - الزامی)
[نام سرویس به فارسی]
[معرفی کوتاه سرویس در 2-3 خط - توضیح کلی و مشتری هدف]
________________________________________
Tab 1: استاندارد (Standard)
Package 1: پایه (Basic)
قیمت کل: $XXX/[دوره]
Default Services:
1.	[نام خدمت فارسی] | STD_BAS_XXX | $XX - [توضیح مختصر]
2.	[نام خدمت فارسی] | STD_BAS_XXX | $XX - [توضیح مختصر]
…
[جمع قیمت‌ها = قیمت کل پکیج]
________________________________________
Package 2: حرفه‌ای (Professional)
قیمت کل: $XXX/[دوره]
Default Services:
[مشابه بالا]
________________________________________
Package 3: پریمیوم (Premium)
قیمت کل: $XXX/[دوره]
Default Services:
[مشابه بالا]
________________________________________
Tab 2: پیشرفته (Advanced)
Package 1: پایه (Basic)
قیمت کل: $XXX/[دوره]
Default Services:
[مشابه بالا]
________________________________________
Package 2: حرفه‌ای (Professional)
قیمت کل: $XXX/[دوره]
Default Services:
[مشابه بالا]
________________________________________
Package 3: پریمیوم (Premium)
قیمت کل: $XXX/[دوره]
Default Services:
[مشابه بالا]
________________________________________
Add-Ons (خدمات اضافی)
[دسته‌بندی 1]:
•	[نام Add-on فارسی] | ADD_XXX_XXX | $XX [واحد]
•	[نام Add-on فارسی] | ADD_XXX_XXX | $XX [واحد]
[دسته‌بندی 2]:
•	[نام Add-on فارسی] | ADD_XXX_XXX | $XX [واحد]
________________________________________
نکات مهم:
•	[نکات کلیدی درباره سرویس]
•	[محدودیت‌ها یا شرایط خاص]
•	[توضیحات تکمیلی]
________________________________________
Question Gate (دروازه سؤال - الزامی)
قبل از شروع قیمت‌گذاری:
اگر اطلاعات کافی برای قیمت‌گذاری دقیق ندارید، حتماً سؤالات زیر را بپرسید:
1.	مشتری هدف: استارتاپ، SMB، Enterprise، فروشگاهی، یا سایر؟
2.	نوع سرویس: ماهانه، پروژه‌ای، یکبار، سالانه؟
3.	محدوده کاری: چه خدماتی باید شامل شود؟ چه چیزی خارج از محدوده است؟
4.	سطوح کیفیت: آیا سطوح مختلف کیفیت وجود دارد؟ (مثل DA سایت‌ها، تعداد کلمات، و…)
5.	محدودیت‌ها: آیا محدودیت خاصی در تعداد، زمان، یا منابع وجود دارد؟
6.	رقابت: آیا اطلاعاتی از قیمت رقبا دارید؟
7.	ابزارها: چه ابزارها یا نرم‌افزارهایی استفاده می‌شود؟
8.	گزارش‌دهی: چه نوع و با چه فرکانسی؟
منتظر پاسخ کاربر بمانید و بر اساس پاسخ‌ها قیمت‌گذاری کنید.
________________________________________
نکته طلایی
در صورت عدم قطعیت:
•	تحقیق کنید یا فرض منطقی بگیرید
•	هیچ موردی را حذف یا ساده‌سازی نکنید
•	اگر اطلاعات کافی ندارید، سؤال بپرسید (Question Gate)
•	قیمت‌ها باید واقع‌بینانه و رقابتی باشند، نه خیلی ارزان و نه خیلی گران

{{SERVICE TYPE}}
{{TARGET CUSTOMER}}
{{WORK SCOPE}}
{{QUALITY LEVELS}}
{{LIMITATIONS}}
{{COMPETITOR PRICING}}
{{TOOLS USED}}
{{REPORTING TYPE}}`
},

{
  id: "17",
  name: "Dev Sticky Generator",
  categories: ["Project Management"],
  description: 'Takes a web task — a bug report, SEO note, UI issue, or feature idea — and compresses it into a short standardised code for a sticky note. It picks the right colour for the note and pen automatically, adds a priority marker if needed, and formats everything into a consistent four-line output ready to stick on a board.',
  ais: [
    "gpt-5.4-pro",
    "claude-4.7-opus",
    "gpt-5.4",
    "claude-4.6-sonnet",
    "gpt-5.5",
    "gemini-3.1-pro",
    "deepseek-expert-dt",
    "deepseek-v4-pro",
    "grok-4",
    "qwen-3-max",
  ],
  pinned: false,
  locked: false,
  template: `نقش: سیستم تبدیل تسک‌های وب به یادداشت‌های استیکی نوت فشرده

هدف: تبدیل متن‌های طولانی مربوط به طراحی سایت، باگ، سئو یا ایده به کدهای کوتاه و استاندارد برای استیکی نوت.

قوانین تبدیل (الزامی):
1. ساختار خروجی: [SITE / PAGE / LANG / DEV / ACT] (اگر زبان مشخص نبود، آن بخش حذف شود).
2. کدهای سایت: ASM (armin), NLV (nolvo), ZRO (zorio). *اگر سایت مشخص نبود، بپرس.*
3. صفحات: HME, ABT, CNT, BLG, PDC, CRT, CHK.
4. زبان‌ها: FA, EN, IT, AR.
5. دستگاه‌ها: M, D, T.
6. اقدامات: IMG, TXT, CLR, LYT, UX_, SEO, FIX, SPD.
7. تشخیص رنگ استیکی:
   - Bug → Red
   - UI/UX → Yellow
   - SEO → Green
   - Idea/Feature → Blue
8. تشخیص رنگ خودکار قلم:
   - Implement → Black
   - Research/Test → Blue
   - Fix → Red
   - Improve → Green
9. اولویت‌ها (در ابتدای Sticky Text): ! (مهم)، !! (خیلی مهم)، ? (بررسی).

فرمت خروجی (دقیقاً رعایت شود):
Sticky Text: [کد نهایی]
Sticky Color: [رنگ]
Pen Color: [رنگ]
Task: [متن اصلی کاربر]

{{TASK_INPUT}}
{{SITE_CONTEXT}}
{{PRIORITY_LEVEL}}`
},

  ];

  let prompts = [];

  /* ------------------------- DATA LAYER ------------------------- */
  function loadPrompts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        prompts = defaultPrompts.map(p => ({ ...p }));
        saveToStorage();
        return;
      }

      const data = JSON.parse(raw);
      let needsSave = false;

      if (!data.version || data.version < CURRENT_VERSION) {
        if (Array.isArray(data.prompts)) {
          data.prompts = data.prompts.map(p => {
            const newP = { ...p };
            if (typeof newP.category === 'string') {
              newP.categories = newP.category ? [newP.category] : [];
              delete newP.category;
            }
            if (typeof newP.ai === 'string') {
              newP.ais = newP.ai ? [newP.ai] : [];
              delete newP.ai;
            }
            if (!Array.isArray(newP.categories)) newP.categories = [];
            if (!Array.isArray(newP.ais)) newP.ais = [];
            if (typeof newP.locked === 'undefined') newP.locked = false;
            return newP;
          });

          const defaultIds = new Set(defaultPrompts.map(p => p.id));
          data.prompts = data.prompts.filter(p => !defaultIds.has(p.id));
          defaultPrompts.forEach(dp => data.prompts.push({ ...dp }));
        }
        data.version = CURRENT_VERSION;
        needsSave = true;
      }

      prompts = Array.isArray(data.prompts) ? data.prompts : defaultPrompts.map(p => ({ ...p }));
      if (needsSave) saveToStorage();
    } catch (e) {
      prompts = defaultPrompts.map(p => ({ ...p }));
      saveToStorage();
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: CURRENT_VERSION,
      prompts
    }));
  }

  let currentFilter = 'all';
  let currentSearch = '';
  let currentPromptId = null;
  let typingTimer = null;

  /* ------------------------- DOM REFS ------------------------- */
  const libraryView = document.getElementById('libraryView');
  const builderView = document.getElementById('builderView');
  const searchInput = document.getElementById('searchInput');
  const categoryFilters = document.getElementById('categoryFilters');
  const promptList = document.getElementById('promptList');
  const promptFormContainer = document.getElementById('promptFormContainer');
  const savePromptBtn = document.getElementById('savePrompt');
  const cancelPromptBtn = document.getElementById('cancelPrompt');
  const promptNameInput = document.getElementById('promptName');
  const promptCategoryInput = document.getElementById('promptCategory');
  const promptTemplateInput = document.getElementById('promptTemplate');
  const promptAiSelect = document.getElementById('promptAi');
  const promptLockedCheckbox = document.getElementById('promptLocked');
  const categorySuggestions = document.getElementById('categorySuggestions');
  const btnBackToLibrary = document.getElementById('btnBackToLibrary');
  const builderTitle = document.getElementById('builderTitle');
  const placeholderInputs = document.getElementById('placeholderInputs');
  const btnGeneratePrompt = document.getElementById('btnGeneratePrompt');
  const resultArea = document.getElementById('resultArea');
  const generatedPrompt = document.getElementById('generatedPrompt');
  const btnCopyPrompt = document.getElementById('btnCopyPrompt');
  const btnClearBuilder = document.getElementById('btnClearBuilder');
  const aiModelsFull = document.getElementById('aiModelsFull');
  const promptDescription = document.getElementById('promptDescription');

  /* ------------------------- UTILS ------------------------- */
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const getAllCategories = () => {
    const cats = new Set();
    prompts.forEach(p => (p.categories || []).forEach(c => cats.add(c)));
    return [...cats].filter(Boolean);
  };

  const extractPlaceholders = (template) => {
    const regex = /{{(.*?)}}/g;
    const placeholders = new Set();
    let match;
    while ((match = regex.exec(template)) !== null) {
      placeholders.add(match[1].trim());
    }
    return [...placeholders];
  };

  const sortPrompts = (list) => [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  /* ------------------------- RENDER ------------------------- */
  function renderCategoryFilters() {
    const categories = getAllCategories();
    let html = '<button class="filter-chip active" data-category="all">All</button>';
    categories.forEach(cat => {
      html += `<button class="filter-chip" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
    });
    categoryFilters.innerHTML = html;

    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category === currentFilter);
    });
  }

  function renderLibrary() {
    let filtered = prompts.filter(p => {
      if (currentFilter !== 'all' && !(p.categories || []).includes(currentFilter)) return false;
      if (currentSearch && !p.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
      return true;
    });
    filtered = sortPrompts(filtered);

    if (filtered.length === 0) {
      promptList.innerHTML = '<p style="text-align:center; opacity:0.5; padding:40px;">No prompts found.</p>';
      return;
    }

    promptList.innerHTML = filtered.map(p => {
      const catBadges = (p.categories || []).map(c =>
        `<span class="card-category">${escapeHtml(c)}</span>`
      ).join('');

      const maxShow = 3;
      const aiList = p.ais || [];
      let aiBadgesHtml = '';
      if (aiList.length <= maxShow) {
        aiBadgesHtml = aiList.map(ai =>
          `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`
        ).join('');
      } else {
        const visible = aiList.slice(0, maxShow);
        const hiddenCount = aiList.length - maxShow;
        aiBadgesHtml =
          visible.map(ai => `<span class="ai-badge">${escapeHtml(getAiName(ai))}</span>`).join('') +
          `<span class="ai-badge">+${hiddenCount} more</span>`;
      }

      const lockIcon = p.locked ? `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-lock-icon">
          <rect x="5" y="11" width="14" height="11" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
        </svg>
      ` : '';

      return `
        <div class="prompt-card ${p.pinned ? 'pinned' : ''}" data-id="${p.id}">
          <div class="card-main-content">
            <div class="card-info">
              <div class="card-name">${escapeHtml(p.name)}</div>
              <div class="card-meta">
                ${catBadges}
                ${aiBadgesHtml}
              </div>
            </div>
            <div class="card-actions">
              ${lockIcon}
              <button class="card-pin ${p.pinned ? 'pinned' : ''}" data-action="pin" data-id="${p.id}" title="Pin prompt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="card-password-form hidden">
            <p class="card-password-text">This prompt is locked. Enter the master password to unlock.</p>
            <input type="password" class="card-password-input" placeholder="Master password" autocomplete="off" />
            <div class="card-password-actions">
              <button class="btn btn-accent card-password-submit">Unlock</button>
              <button class="btn btn-outline card-password-cancel">Cancel</button>
            </div>
            <div class="card-password-error"></div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.prompt-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (card.classList.contains('password-active')) return;
        if (e.target.closest('[data-action="pin"]')) return;

        const id = card.dataset.id;
        const prompt = prompts.find(p => p.id === id);
        if (prompt && prompt.locked) {
          convertCardToPasswordInput(card, id);
        } else {
          openBuilder(id);
        }
      });
    });

    document.querySelectorAll('[data-action="pin"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePin(btn.dataset.id);
      });
    });
  }

  function renderAll() {
    renderCategoryFilters();
    renderLibrary();
    updateCategoryDatalist();
  }

  function updateCategoryDatalist() {
    const cats = getAllCategories();
    categorySuggestions.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">`).join('');
  }

  /* ------------------------- IN-CARD PASSWORD ------------------------- */
  function convertCardToPasswordInput(cardElement, promptId) {
    if (cardElement.classList.contains('password-active')) return;

    cardElement.classList.add('password-active');

    const passwordForm = cardElement.querySelector('.card-password-form');
    const input = passwordForm.querySelector('.card-password-input');
    const submitBtn = passwordForm.querySelector('.card-password-submit');
    const cancelBtn = passwordForm.querySelector('.card-password-cancel');
    const errorDiv = passwordForm.querySelector('.card-password-error');

    input.focus();

    const handleSubmit = () => {
      const entered = input.value;
      if (entered === MASTER_PASSWORD) {
        openBuilder(promptId);
      } else {
        errorDiv.textContent = 'Incorrect password.';
        input.select();
      }
    };

    const handleCancel = () => {
      cardElement.classList.remove('password-active');
      input.value = '';
      errorDiv.textContent = '';
    };

    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });

    submitBtn.addEventListener('click', (e) => e.stopPropagation());
    cancelBtn.addEventListener('click', (e) => e.stopPropagation());
  }

  /* ------------------------- ACTIONS ------------------------- */
  function togglePin(id) {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      prompt.pinned = !prompt.pinned;
      saveToStorage();
      renderAll();
    }
  }

  function openBuilder(id) {
  const prompt = prompts.find(p => p.id === id);
  if (!prompt) return;
  currentPromptId = id;
  builderTitle.textContent = prompt.name;
  // نمایش توضیحات
if (prompt.description) {
  promptDescription.textContent = prompt.description;
} else {
  promptDescription.textContent = '';
}

  // ----- AI Models (تمام عرض) -----
  let aiHtml = '<div class="ai-status-section"><h4>AI Models</h4><div class="ai-status-list">';
  (prompt.ais || []).forEach(aiId => {
    const model = ALL_AI_MODELS.find(m => m.id === aiId);
    const name = model ? model.name : aiId;
    const isActive = model ? model.active : true;
    const statusClass = isActive ? 'ai-active' : 'ai-inactive';
    aiHtml += `<span class="ai-status-chip ${statusClass}">${escapeHtml(name)}</span>`;
  });
  aiHtml += '</div></div>';
  aiModelsFull.innerHTML = aiHtml;

  // ----- ورودی‌های placeholder (بدون بخش AI) -----
  const placeholders = extractPlaceholders(prompt.template);
  let fieldsHtml = '';
  if (placeholders.length === 0) {
    fieldsHtml = '<p style="opacity:0.7;">This prompt has no placeholders. You can use it as is.</p>';
  } else {
    fieldsHtml = placeholders.map(ph => {
      const isLong = /faq|anchor|full article|full persian article|full translated text|image description/i.test(ph);
      const tag = isLong ? 'textarea' : 'input';
      const extra = isLong ? ' rows="4"' : ' type="text"';
      return `
        <div class="placeholder-field">
          <label for="input_${escapeHtml(ph)}">${escapeHtml(ph)}</label>
          <${tag}${extra} id="input_${escapeHtml(ph)}" placeholder="Enter ${escapeHtml(ph)}" autocomplete="off"></${tag}>
        </div>
      `;
    }).join('');
  }
  placeholderInputs.innerHTML = fieldsHtml;

  // ----- فعال‌سازی حالت builder (افزایش عرض) -----
  document.querySelector('.container').classList.add('builder-mode');

  generatedPrompt.value = '';
  libraryView.classList.add('hidden');
  builderView.classList.remove('hidden');
}

  function generatePrompt() {
  const prompt = prompts.find(p => p.id === currentPromptId);
  if (!prompt) return;
  const placeholders = extractPlaceholders(prompt.template);
  let filled = prompt.template;

  placeholders.forEach(ph => {
    const el = document.getElementById(`input_${ph}`);
    const val = el ? el.value : '';
    const escapedPh = ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`{{${escapedPh}}}`, 'gi');
    filled = filled.replace(regex, val || `{{${ph}}}`);
  });

  // لغو تایپ قبلی
  if (typingTimer) clearInterval(typingTimer);

  // نمایش و اسکرول به خروجی
  generatedPrompt.value = '';
  generatedPrompt.classList.add('typing');
  
  // اسکرول نرم به باکس خروجی
  generatedPrompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  let i = 0;
  const chars = filled.split('');
  const speed = 5; // میلی‌ثانیه

  typingTimer = setInterval(() => {
    if (i < chars.length) {
      generatedPrompt.value += chars[i];
      generatedPrompt.scrollTop = generatedPrompt.scrollHeight;
      i++;
    } else {
      clearInterval(typingTimer);
      generatedPrompt.classList.remove('typing');
    }
  }, speed);
}

  function copyToClipboard() {
    generatedPrompt.select();
    document.execCommand('copy');
    btnCopyPrompt.style.color = 'var(--accent)';
    setTimeout(() => { btnCopyPrompt.style.color = ''; }, 1000);
  }

  function clearBuilder() {
    const inputs = document.querySelectorAll('#placeholderInputs input, #placeholderInputs textarea');
    inputs.forEach(input => { input.value = ''; });

    generatedPrompt.value = '';
    if (typingTimer) {
      clearInterval(typingTimer);
      generatedPrompt.classList.remove('typing');
    }
  }

  /* ------------------------- EVENT LISTENERS ------------------------- */
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderLibrary();
  });

  categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    currentFilter = chip.dataset.category;
    renderAll();
  });

  cancelPromptBtn.addEventListener('click', () => {
    promptFormContainer.classList.add('hidden');
  });

  savePromptBtn.addEventListener('click', () => {
    const name = promptNameInput.value.trim();
    const catRaw = promptCategoryInput.value.trim();
    const template = promptTemplateInput.value.trim();
    const selected = Array.from(promptAiSelect.selectedOptions).map(opt => opt.value);
    const locked = promptLockedCheckbox ? promptLockedCheckbox.checked : false;

    if (!name || !catRaw || !template) {
      alert('Please fill in all fields.');
      return;
    }

    const categories = catRaw.split(',').map(c => c.trim()).filter(Boolean);
    const newPrompt = {
      id: Date.now().toString(),
      name,
      categories,
      ais: selected.length > 0 ? selected : [],
      pinned: false,
      locked: locked,
      template
    };
    prompts.push(newPrompt);
    saveToStorage();
    promptFormContainer.classList.add('hidden');
    promptNameInput.value = '';
    promptCategoryInput.value = '';
    promptTemplateInput.value = '';
    promptAiSelect.selectedIndex = -1;
    if (promptLockedCheckbox) promptLockedCheckbox.checked = false;
    renderAll();
  });

  btnBackToLibrary.addEventListener('click', () => {
  builderView.classList.add('hidden');
  libraryView.classList.remove('hidden');
  currentPromptId = null;
  placeholderInputs.innerHTML = '';
  aiModelsFull.innerHTML = '';   // پاک‌سازی بخش AI
  generatedPrompt.value = '';
  document.querySelector('.container').classList.remove('builder-mode'); // بازگشت عرض
  if (typingTimer) {
    clearInterval(typingTimer);
    generatedPrompt.classList.remove('typing');
  }
});

  btnGeneratePrompt.addEventListener('click', generatePrompt);
  btnCopyPrompt.addEventListener('click', copyToClipboard);
  btnClearBuilder.addEventListener('click', clearBuilder);

  /* ------------------------- INIT ------------------------- */
  loadPrompts();
  renderAll();
  console.log('Tavio: Initialization complete.');
});