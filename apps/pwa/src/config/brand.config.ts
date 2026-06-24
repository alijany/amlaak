// ─── Brand Configuration ───────────────────────────────────────────────────
// Edit this file to rebrand the entire application.
// All components and the landing page read from here — no other files need changing.

export type ValuePropIconKey = 'collection' | 'fresh' | 'phone' | 'shield';

export interface CategoryEntry {
  /** Maps to the RealEstateCategory query param ('' = all). */
  query: '' | 'sale' | 'rent' | 'mortgage';
  label: string;
  desc: string;
}

export interface ValueProp {
  icon: ValuePropIconKey;
  title: string;
  desc: string;
}

export interface Step {
  step: string;
  title: string;
  desc: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const brand = {
  // ── Identity ──────────────────────────────────────────────────────────────
  name: 'نوا املاک',
  nameEn: 'Nava Amlak',

  // ── Contact ───────────────────────────────────────────────────────────────
  contact: {
    phone: { primary: '+989104007068', display: '0910 400 7068' },
    phone2: { primary: '+981333352174', display: '013 3335 2174' },
    address: 'رشت، گلسار، خیابان نواب، مجتمع نوا',
  },

  // ── SEO / Metadata ────────────────────────────────────────────────────────
  meta: {
    title: 'نوا املاک | جستجوی خرید، فروش و اجاره ملک',
    description:
      'هزاران آگهی ملک از معتبرترین منابع را یکجا جستجو کنید؛ سریع، به‌روز و قابل اعتماد. خرید، فروش و اجاره ملک با نوا املاک.',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  description:
    'نوا املاک آگهی‌های خرید، فروش و اجاره ملک را از منابع مختلف گردآوری و در یک پلتفرم یکپارچه منتشر می‌کند. مشاوران املاک نیز می‌توانند آگهی ثبت کنند و مشتری‌های فروش را مدیریت کنند.',
  copyright: '© 1404 نوا املاک. کلیه حقوق محفوظ است.',

  // ── Landing Page (marketplace, seeker-first) ────────────────────────────────
  landing: {
    hero: {
      title: 'ملک مناسبت را پیدا کن',
      subtitle:
        'هزاران آگهی خرید، فروش و اجاره از منابع معتبر، یکجا و به‌روز. جستجو کن و مستقیم با مشاور تماس بگیر.',
      searchPlaceholder: 'شهر، محله یا عنوان ملک…',
      searchCta: 'جستجو',
      // Hero background; swap for a real photo (e.g. /images/hero-home.jpg) anytime.
      backgroundImage: '/images/image.png',
    },

    // Category tabs in the hero search + the browse-by-category cards.
    categories: [
      { query: 'sale', label: 'خرید', desc: 'آپارتمان، ویلا و زمین برای خرید' },
      { query: 'rent', label: 'رهن و اجاره', desc: 'اجاره ماهیانه با ودیعه' },
      { query: 'mortgage', label: 'رهن کامل', desc: 'رهن کامل بدون اجاره' },
      { query: '', label: 'همه آگهی‌ها', desc: 'مرور همه‌ی فایل‌های موجود' },
    ] satisfies CategoryEntry[],

    popularCities: ['رشت', 'گلسار', 'انزلی', 'لاهیجان', 'رودسر', 'لنگرود'],

    valueProps: [
      {
        icon: 'collection' as ValuePropIconKey,
        title: 'همه آگهی‌ها یکجا',
        desc: 'فایل‌های ملک از منابع مختلف را بدون گشتن در ده‌ها کانال، در یک پلتفرم ببین.',
      },
      {
        icon: 'fresh' as ValuePropIconKey,
        title: 'تازه و به‌روز',
        desc: 'آگهی‌ها به‌صورت خودکار گردآوری و به‌روزرسانی می‌شوند تا فرصت‌ها را از دست ندهی.',
      },
      {
        icon: 'phone' as ValuePropIconKey,
        title: 'تماس مستقیم و رایگان',
        desc: 'برای هر ملک مستقیم با مشاور مربوطه تماس بگیر؛ بدون واسطه و هزینه.',
      },
      {
        icon: 'shield' as ValuePropIconKey,
        title: 'کد رهگیری برای هر ملک',
        desc: 'هر آگهی کد رهگیری اختصاصی دارد تا پیگیری دقیق و سریع انجام شود.',
      },
    ] satisfies ValueProp[],

    valuePropsHeading: 'چرا نوا املاک؟',

    steps: [
      { step: '۱', title: 'جستجو و فیلتر', desc: 'شهر، محله، قیمت و نوع ملک را انتخاب کن.' },
      { step: '۲', title: 'بررسی جزئیات', desc: 'تصاویر، مشخصات و موقعیت هر ملک را کامل ببین.' },
      { step: '۳', title: 'تماس با مشاور', desc: 'با کد رهگیری مستقیم با مشاور همان ملک تماس بگیر.' },
    ] satisfies Step[],

    stepsHeading: 'چطور کار می‌کند؟',

    forAgencies: {
      title: 'مشاور املاک هستید؟',
      body: 'آگهی‌های خود را رایگان ثبت کنید، روی وب‌سایت و کانال تلگرام منتشر کنید و مشتری‌های فروش را در پنل مدیریت کنید.',
      bullets: [
        'انتشار خودکار روی وب و تلگرام',
        'مدیریت مشتری و پیگیری تا معامله',
        'پروفایل اختصاصی آژانس',
      ],
      cta: 'ثبت آگهی / پنل مشاور',
    },

    faq: {
      heading: 'سوالات متداول',
      subheading: 'اگر پاسخ خود را پیدا نکردی، با پشتیبانی تماس بگیر.',
      items: [
        {
          q: 'آگهی‌ها از کجا می‌آیند؟',
          a: 'بخشی از آگهی‌ها به‌صورت خودکار از منابع معتبر گردآوری می‌شوند و بخشی توسط مشاوران و مالکان مستقیماً ثبت می‌گردند. همه‌ی آگهی‌ها پیش از انتشار بررسی می‌شوند.',
        },
        {
          q: 'آیا برای دیدن آگهی‌ها باید ثبت‌نام کنم؟',
          a: 'خیر. مشاهده و جستجوی آگهی‌ها برای همه آزاد است. برای ثبت آگهی یا مدیریت مشتری‌ها کافی است با شماره موبایل وارد شوید.',
        },
        {
          q: 'کد رهگیری ملک چیست؟',
          a: 'هر آگهی یک کد رهگیری اختصاصی دارد. هنگام تماس آن را اعلام کنید تا مشاور دقیقاً همان ملک را شناسایی کند و پیگیری سریع‌تر انجام شود.',
        },
        {
          q: 'چطور به‌عنوان مشاور آگهی ثبت کنم؟',
          a: 'وارد شوید، یک آژانس بسازید (یا به آژانس خود بپیوندید) و از بخش «آگهی‌های من» آگهی ثبت کنید. آگهی پس از تأیید روی وب‌سایت و کانال تلگرام منتشر می‌شود.',
        },
      ] satisfies FaqItem[],
    },
  },
} as const;
