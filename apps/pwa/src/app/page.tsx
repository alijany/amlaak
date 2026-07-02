"use client";

import { RootLayout } from "@/components/layout/layout.component.root";
import { fetcher } from "@/libs/api/api.util.fetcher";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { GetBlogPostsResponse } from "./dashboard/blog/blog.types";
import { CreateLeadDto } from "./dashboard/leads/leads.types";

/* ─── Inline icons ──────────────────────────────────── */
function Ico({ size = 20, children, style }: { size?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}
const SparkleIco = (p: { size?: number }) => <Ico {...p}><path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></Ico>;
const CheckIco = (p: { size?: number; style?: React.CSSProperties }) => <Ico {...p}><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></Ico>;
const ArrowLeftIco = (p: { size?: number }) => <Ico {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Ico>;
const ShieldIco = (p: { size?: number; style?: React.CSSProperties }) => <Ico {...p}><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Ico>;
const PhoneIco = (p: { size?: number }) => <Ico {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.2 12.82 19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></Ico>;
const ClockIco = (p: { size?: number; style?: React.CSSProperties }) => <Ico {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Ico>;
const LockIco = (p: { size?: number }) => <Ico {...p}><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" /><rect x="9" y="10" width="6" height="5" rx="1" /><path d="M10.5 10V8.5a1.5 1.5 0 0 1 3 0V10" /></Ico>;
const ChartIco = (p: { size?: number }) => <Ico {...p}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></Ico>;
const TrendDownIco = (p: { size?: number }) => <Ico {...p}><polyline points="3 7 9 13 13 9 21 17" /><polyline points="14 17 21 17 21 10" /></Ico>;
const StarsIco = (p: { size?: number }) => <Ico {...p}><path d="M12 2l2.4 5 5.6.8-4 3.9.9 5.5L12 14.6 7.1 17.2l.9-5.5-4-3.9 5.6-.8z" /></Ico>;
const HandshakeIco = (p: { size?: number }) => <Ico {...p}><path d="M11 17l-3 3a1.5 1.5 0 0 1-2.1-2.1L9 14.5" /><path d="M13 7l3-3a1.5 1.5 0 0 1 2.1 2.1L15 9.5" /><path d="M3 12l5-5 4 4 4-4 5 5-5 5-4-4-4 4z" /></Ico>;
const ReceiptIco = (p: { size?: number }) => <Ico {...p}><path d="M4 2h16v20l-3-2-3 2-2-2-3 2-3-2-2 2z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></Ico>;
const TeamIco = (p: { size?: number }) => <Ico {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Ico>;
const PuzzleIco = (p: { size?: number; style?: React.CSSProperties }) => <Ico {...p}><path d="M14 4a2 2 0 1 1 4 0v3h3a1 1 0 0 1 1 1v3a2 2 0 1 1 0 4v3a1 1 0 0 1-1 1h-3a2 2 0 1 1-4 0H10a1 1 0 0 1-1-1v-3a2 2 0 1 1 0-4V8a1 1 0 0 1 1-1h4z" /></Ico>;
const CalcIco = (p: { size?: number }) => <Ico {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><rect x="7" y="5" width="10" height="4" rx="1" /><circle cx="8" cy="13" r="0.6" fill="currentColor" /><circle cx="12" cy="13" r="0.6" fill="currentColor" /><circle cx="16" cy="13" r="0.6" fill="currentColor" /><circle cx="8" cy="17" r="0.6" fill="currentColor" /></Ico>;
const FileCheckIco = (p: { size?: number }) => <Ico {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 14l2 2 4-4" /></Ico>;
const GavelIco = (p: { size?: number }) => <Ico {...p}><path d="M14.5 5.5l4 4" /><path d="M17 3l4 4-3 3-4-4z" /><path d="M10.5 9.5l4 4" /><path d="M12 8l-9 9 4 4 9-9z" /><line x1="3" y1="22" x2="13" y2="22" /></Ico>;
const HeartShieldIco = (p: { size?: number }) => <Ico {...p}><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" /><path d="M9.5 11.5a2 2 0 0 1 2.5-2.6 2 2 0 0 1 2.5 2.6c-.5 1.5-2.5 3-2.5 3s-2-1.5-2.5-3z" /></Ico>;
const QuestionIco = (p: { size?: number }) => <Ico {...p}><circle cx="12" cy="12" r="10" /><path d="M10 9.5a2 2 0 1 1 3 1.7c-.7.4-1 1-1 1.8" /><line x1="12" y1="17" x2="12" y2="17" /></Ico>;
const ChevronIco = (p: { size?: number }) => <Ico {...p}><polyline points="6 9 12 15 18 9" /></Ico>;
const BookIco = (p: { size?: number }) => <Ico {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Ico>;
const GraduationIco = (p: { size?: number }) => <Ico {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></Ico>;
const CoinIco = (p: { size?: number }) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5a3 3 0 0 0-5 2.2c0 1.6 1.1 2.8 2.5 3.2V16m0-8v-.5" /><line x1="12" y1="16" x2="12" y2="17" /></Ico>;
const TaxIco = (p: { size?: number }) => <Ico {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /><polyline points="9 9 9 9 11 9" /></Ico>;
const SoftwareIco = (p: { size?: number }) => <Ico {...p}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /><path d="M7 8l3 3-3 3" /><line x1="13" y1="14" x2="17" y2="14" /></Ico>;
const PayrollIco = (p: { size?: number }) => <Ico {...p}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></Ico>;

/* ─── UI Helpers ─────────────────────────────────────── */
function EyebrowPill({ icon: Icon, children, dark = false }: { icon: React.FC<{ size?: number }>; children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: dark ? "1px solid rgba(255,255,255,0.4)" : "1px solid var(--slate-300)", background: dark ? "rgba(255,255,255,0.1)" : "transparent", fontSize: 12, fontWeight: 500, color: dark ? "#fff" : "var(--slate-700)" }}>
      <Icon size={18} />
      <span>{children}</span>
    </div>
  );
}

function RoseButton({ href, children, size = "md", outline = false }: { href: string; children: React.ReactNode; size?: "md" | "lg" | "xl"; outline?: boolean }) {
  const padding = size === "xl" ? "18px 36px" : size === "lg" ? "14px 28px" : "10px 22px";
  const fontSize = size === "xl" ? 17 : size === "lg" ? 16 : 14;
  return (
    <a href={href}>
      <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding, borderRadius: 12, fontSize, fontWeight: 600, background: outline ? "transparent" : "var(--rose-500)", color: outline ? "var(--slate-700)" : "#fff", border: outline ? "1px solid var(--slate-300)" : "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "background .15s, color .15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = outline ? "rgba(0,0,0,0.03)" : "var(--rose-600)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = outline ? "transparent" : "var(--rose-500)"; }}>
        {children}
      </button>
    </a>
  );
}

/* ─── HERO ──────────────────────────────────────────── */
function HeroSection() {
  return (
    <section id="hero" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="container-page">
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", gap: 48, alignItems: "center" }}>
          <div>
            <EyebrowPill icon={SparkleIco}>سال ها در کنار کسب‌وکارهای ایرانی</EyebrowPill>
            <h1 className="split-h1" style={{ marginTop: 20 }}>
              <span className="setup">امور مالی شرکت‌تان را</span>
              <span className="accent" style={{ fontSize: "clamp(24px, 3.2vw, 46px)" }}>با خیال راحت به ما بسپارید.</span>
            </h1>
            <p style={{ marginTop: 22, fontSize: 17, lineHeight: 1.85, color: "var(--slate-600)", maxWidth: 540 }}>
              از <strong style={{ color: "var(--slate-700)" }}>ثبت اسناد</strong> و <strong style={{ color: "var(--slate-700)" }}>اظهارنامه مالیاتی</strong> تا <strong style={{ color: "var(--slate-700)" }}>دفاع در هیات حل اختلاف</strong> و <strong style={{ color: "var(--slate-700)" }}>امور بیمه</strong>؛<br /> یک تیم رسمی، یک قرارداد، صفر دغدغه.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <RoseButton href="#lead" size="xl"><span>مشاوره رایگان 20 دقیقه ای</span></RoseButton>
              <RoseButton href="#services" size="xl" outline>مشاهده خدمات</RoseButton>
            </div>
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
              {["پاسخگویی در کمتر از 24 ساعت کاری", "محرمانگی اسناد، تضمین کتبی"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--slate-600)" }}>
                  <CheckIco size={16} style={{ color: "var(--rose-500)" }} /><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", minHeight: 460 }}>
            <div style={{ position: "absolute", inset: "20px 0 0 -20px", background: "radial-gradient(60% 60% at 30% 40%, color-mix(in srgb, var(--rose-500) 22%, transparent) 0%, transparent 70%)", filter: "blur(20px)", zIndex: 0 }} />
            <div aria-hidden="true" style={{ position: "absolute", bottom: -16, left: -16, width: 120, height: 120, backgroundImage: "radial-gradient(color-mix(in srgb, var(--rose-500) 45%, transparent) 1.5px, transparent 1.5px)", backgroundSize: "12px 12px", opacity: 0.7, borderRadius: 16, zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 2, borderRadius: 28, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 30px 80px -20px rgba(31,42,68,0.30), 0 8px 24px -8px rgba(31,42,68,0.15)", background: "var(--slate-100)", aspectRatio: "5/6", maxWidth: 460, margin: "0 auto" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80&auto=format&fit=crop" alt="تیم شاخص محاسبان مهر در حال جلسه با مشتری" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div style={{ position: "absolute", inset: 0, zIndex: -1, background: "linear-gradient(135deg, #FFE3E7 0%, #FFCAD2 60%, #FFA7B4 100%)" }} />
            </div>
            <div className="hero-float" style={{ position: "absolute", zIndex: 3, bottom: 32, left: -8, background: "#fff", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 50px -10px rgba(31,42,68,0.18)", border: "1px solid var(--slate-100)", minWidth: 220 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "var(--rose-50)", color: "var(--rose-500)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendDownIco size={22} /></div>
              <div>
                <div style={{ fontSize: 11, color: "var(--slate-400)", fontWeight: 500 }}>میانگین کاهش مالیات</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--slate-800)", lineHeight: 1.1, marginTop: 2 }}>۲۸٪ <span style={{ fontSize: 12, color: "var(--rose-500)", fontWeight: 700 }}>قانونی</span></div>
              </div>
            </div>
            <div className="hero-float" style={{ position: "absolute", zIndex: 3, top: 32, right: -8, background: "#fff", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 14px 30px -8px rgba(31,42,68,0.15)", border: "1px solid var(--slate-100)" }}>
              <ShieldIco size={18} style={{ color: "var(--rose-500)" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--slate-700)" }}>عضو جامعه حسابداران رسمی</div>
            </div>
            <div className="hero-float" style={{ position: "absolute", zIndex: 3, top: 100, left: -16, background: "#fff", borderRadius: 16, padding: "12px 16px", boxShadow: "0 14px 30px -8px rgba(31,42,68,0.15)", border: "1px solid var(--slate-100)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "row-reverse" }}>
                {["م", "ر", "ف", "ز"].map((c, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 9999, background: ["var(--rose-200)", "var(--rose-300)", "var(--rose-400)", "var(--rose-500)"][i], color: "#fff", border: "2px solid #fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: i === 0 ? 0 : -8 }}>{c}</div>
                ))}
              </div>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "var(--slate-800)" }}>+۳۲۰</div>
                <div style={{ fontSize: 11, color: "var(--slate-500)" }}>کسب‌وکار فعال</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.hero-grid{grid-template-columns:1fr !important;gap:32px !important;}.hero-float{transform:scale(0.92);}}`}</style>
    </section>
  );
}

/* ─── STATS ─────────────────────────────────────────── */
function StatsSection() {
  const stats = [{ num: "220+", label: "کسب‌وکار فعال" }, { num: "۹۸٪", label: "رضایت مشتریان" }, { num: "۲.۴M", label: "اظهارنامه ثبت‌شده" }];
  return (
    <section className="section-pad-tight pt-[72px]">
      <div className="container-page">
        <div className="design-card stats-grid grid grid-cols-1 gap-6 rounded-[28px] px-10 py-9 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`stat-cell flex flex-col items-center justify-center text-center min-[901px]:${i < 2 ? "border-l border-[var(--slate-200)]" : ""
                } min-[901px]:${i < 3 ? "pl-6" : ""}`}
            >
              <div className="text-[44px] font-black leading-none tracking-[-0.02em] text-[var(--rose-500)]">
                {s.num}
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--slate-600)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SERVICES ──────────────────────────────────────── */
const servicesList = [
  { icon: CalcIco, title: "حسابداری", sub: "از ثبت اسناد تا صورت‌های مالی", bullets: ["ثبت روزانه اسناد و تنظیم دفاتر قانونی", "تحریر دفاتر تجاری و گزارش‌های فصلی", "بستن حساب‌ها و تهیه صورت‌های مالی", "حقوق و دستمزد و گزارش معاملات فصلی"], highlight: false },
  { icon: FileCheckIco, title: "حسابرسی", sub: "گزارش‌گیری حرفه‌ای و قابل اتکا", bullets: ["حسابرسی مالی و عملیاتی شرکت‌ها", "حسابرسی داخلی و کنترل‌های اعمال‌شده", "گزارش حسابرسی برای مجامع و بانک‌ها", "بازنگری گزارش‌های مالی پیش از ارائه"], highlight: false },
  { icon: GavelIco, title: "دعاوی مالیاتی", sub: "از اعتراض تا دفاع تخصصی", bullets: ["تنظیم لایحه اعتراض به برگ تشخیص", "حضور و دفاع در هیات حل اختلاف بدوی", "پیگیری در هیات تجدیدنظر و دیوان عدالت", "بررسی و کاهش جرایم مالیاتی غیرضروری"], highlight: true },
  { icon: HeartShieldIco, title: "بیمه", sub: "تامین اجتماعی و امور پرسنل", bullets: ["تهیه لیست بیمه ماهانه پرسنل", "اعتراض و دفاع در اداره بیمه تامین اجتماعی", "محاسبه و تسویه حق بیمه قراردادهای پیمانکاری", "اخذ مفاصاحساب بیمه پیمان‌ها"], highlight: false },
];

function ServicesSection() {
  return (
    <section id="services" className="section-pad">
      <div className="container-page">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <EyebrowPill icon={PuzzleIco}>خدمات تخصصی</EyebrowPill>
          <h2 className="split-h2 flex flex-col items-center justify-center" style={{ marginTop: 18 }}><span className="setup">هرچه برای امور مالی نیاز دارید</span><span className="accent">زیر یک سقف، با یک تیم متخصص</span></h2>
          <p style={{ marginTop: 18, fontSize: 16, color: "var(--slate-600)", maxWidth: 640, margin: "18px auto 0", lineHeight: 1.75 }}>چهار خدمت محوری، چهار تیم تخصصی. شما با یک نقطه ارتباط حرفی می‌زنید و کارها داخل تیم میان کارشناسان مالی، مالیاتی و بیمه چرخش پیدا می‌کند.</p>
        </div>
        <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {servicesList.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="design-card" style={{ padding: "32px 32px 28px", borderRadius: 28, position: "relative", overflow: "hidden", background: s.highlight ? "linear-gradient(165deg,#fff 0%,var(--rose-50) 100%)" : "#fff", borderColor: s.highlight ? "var(--rose-200)" : "var(--slate-200)", transition: "transform .2s, box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 50px -20px rgba(31,42,68,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(0,0,0,0.02)"; }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--rose-500)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 20px -6px color-mix(in srgb, var(--rose-500) 45%, transparent)" }}><Icon size={26} /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--slate-800)", lineHeight: 1.2 }}>{s.title}</h3>
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--slate-500)", fontWeight: 500 }}>{s.sub}</p>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {s.bullets.map((b, j) => <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--slate-600)", lineHeight: 1.65 }}><CheckIco size={18} style={{ color: "var(--rose-500)", flexShrink: 0, marginTop: 2 }} /><span>{b}</span></li>)}
                </ul>
                <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--slate-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a href="#lead" style={{ fontSize: 14, fontWeight: 700, color: "var(--rose-500)", display: "flex", alignItems: "center", gap: 6 }}><span>درخواست این خدمت</span><ArrowLeftIco size={16} /></a>
                  <span style={{ fontSize: 12, color: "var(--slate-400)" }}>قرارداد ماهانه / موردی</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@media(max-width:760px){.services-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ─── EDUCATION ─────────────────────────────────────── */
const educationCourses = [
  { icon: CoinIco, title: "حسابداری", sub: "از مبانی تا حرفه‌ای", bullets: ["اصول و مبانی حسابداری مالی", "ثبت اسناد و دفاتر قانونی", "تهیه صورت‌های مالی", "حسابداری پیشرفته شرکت‌ها"], color: "var(--rose-500)" },
  { icon: TaxIco, title: "آموزش مالیاتی", sub: "تسلط بر قوانین مالیاتی", bullets: ["قانون مالیات مستقیم و ارزش‌افزوده", "تنظیم اظهارنامه‌های مالیاتی", "رویه‌های اعتراض و دفاع مالیاتی", "بهینه‌سازی قانونی مالیات"], color: "var(--rose-600)" },
  { icon: SoftwareIco, title: "آموزش نرم‌افزار", sub: "کار با نرم‌افزارهای تخصصی", bullets: ["نرم‌افزار سپیدار سیستم", "نرم‌افزار هلو حسابداری", "نرم‌افزار همکاران سیستم", "صورتحساب الکترونیکی"], color: "var(--rose-500)" },
  { icon: PayrollIco, title: "حقوق و دستمزد", sub: "محاسبه و مدیریت پرسنل", bullets: ["محاسبه حقوق، اضافه‌کاری و کسورات", "تنظیم لیست بیمه تامین اجتماعی", "احکام و قراردادهای کار", "مالیات حقوق و تکالیف قانونی"], color: "var(--rose-600)" },
];

function EducationSection() {
  return (
    <section id="education" className="section-pad" style={{ background: "linear-gradient(180deg,#fff 0%,var(--slate-50) 100%)" }}>
      <div className="container-page">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <EyebrowPill icon={GraduationIco}>آموزش تخصصی</EyebrowPill>
          <h2 className="split-h2 flex flex-col items-center justify-center" style={{ marginTop: 18 }}>
            <span className="setup">دوره‌های آموزشی تخصصی</span>
            <span className="accent">با مدرسان با تجربه و محتوای کاربردی</span>
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, color: "var(--slate-600)", maxWidth: 580, margin: "18px auto 0", lineHeight: 1.75 }}>
            آموزش‌های ما توسط متخصصان با بیش از ۱۵ سال تجربه اجرایی ارائه می‌شود — نه فقط تئوری، بلکه دانشی که فردا در کار واقعی به‌کار می‌برید.
          </p>
        </div>
        <div className="edu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {educationCourses.map((course, i) => {
            const Icon = course.icon;
            return (
              <div key={i} className="design-card edu-card" style={{ padding: "28px 28px 24px", borderRadius: 24, position: "relative", overflow: "hidden", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 50px -20px rgba(31,42,68,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(0,0,0,0.02)"; }}>
                <div aria-hidden="true" style={{ position: "absolute", top: -32, left: -32, width: 140, height: 140, borderRadius: "50%", background: "var(--rose-50)", opacity: 0.7, pointerEvents: "none" }} />
                <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${course.color} 0%,var(--rose-700) 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 20px -6px color-mix(in srgb, var(--rose-500) 40%, transparent)" }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--slate-800)", lineHeight: 1.2 }}>{course.title}</h3>
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--slate-500)", fontWeight: 500 }}>{course.sub}</p>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                  {course.bullets.map((b, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--slate-600)", lineHeight: 1.65 }}>
                      <CheckIco size={17} style={{ color: "var(--rose-500)", flexShrink: 0, marginTop: 2 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a href="#lead" style={{ fontSize: 14, fontWeight: 700, color: "var(--rose-500)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>ثبت‌نام در دوره</span><ArrowLeftIco size={16} />
                  </a>
                  <span style={{ fontSize: 11, color: "var(--slate-400)" }}>حضوری / آنلاین</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@media(max-width:760px){.edu-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ─── WHY US ─────────────────────────────────────────── */
const whyItems = [
  { icon: ClockIco, title: "پاسخ سریع، نه نوبت‌گذاری", body: "از زمان ثبت درخواست تا تماس کارشناس، حداکثر ۲ ساعت کاری. اعداد، نه قول." },
  { icon: LockIco, title: "محرمانگی تضمین‌شده", body: "اسناد و اطلاعات شما تحت قرارداد محرمانگی (NDA) رسمی نگهداری می‌شود." },
  { icon: ChartIco, title: "بهینه‌سازی مالیات قانونی", body: "بیش از ۸۰٪ از مشتریان ما با ساختاردهی صحیح، مالیات پرداختی‌شان کمتر شد." },
  { icon: HandshakeIco, title: "یک نقطه ارتباط، یک قرارداد", body: "نیازی به هماهنگی جداگانه نیست؛ همه‌چیز از حسابدار تا وکیل مالیاتی در تیم ما." },
  { icon: ReceiptIco, title: "گزارش‌گیری شفاف ماهانه", body: "هر ماه گزارش مالی، مالیاتی و بیمه‌ای کسب‌وکارتان روی میز شما، بدون نیاز به پرسیدن." },
  { icon: TeamIco, title: "تیم رسمی، نه فریلنسر", body: "همه کارشناسان عضو رسمی موسسه با ۸+ سال سابقه تخصصی در حوزه خودشان." },
];

function WhyUsSection() {
  return (
    <section id="why" className="section-pad" style={{ background: "#fff" }}>
      <div className="container-page">
        <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)", gap: 64, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 120 }}>
            <EyebrowPill icon={StarsIco}>چرا شاخص محاسبان مهر</EyebrowPill>
            <h2 className="split-h2" style={{ marginTop: 18, textAlign: "right" }}><span className="setup">برون‌سپاری امور مالی</span><span className="accent">باید این‌قدر راحت باشد.</span></h2>
            <p style={{ marginTop: 18, fontSize: 16, color: "var(--slate-600)", lineHeight: 1.85 }}>ما ۱۸ سال است یاد گرفته‌ایم چه چیزهایی صاحب کسب‌وکار را شب بیدار نگه می‌دارد. شش وعده‌ای که با هر مشتری قرارداد می‌کنیم:</p>
            <div style={{ marginTop: 28 }}><RoseButton href="#lead" size="lg"><span>شروع گفتگو</span><ArrowLeftIco size={18} /></RoseButton></div>
          </div>
          <div className="why-cards" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {whyItems.map((it, i) => {
              const Icon = it.icon;
              return (
                <div key={i} style={{ padding: 22, borderRadius: 20, background: "var(--slate-50)", border: "1px solid var(--slate-100)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", color: "var(--rose-500)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, border: "1px solid var(--rose-100)" }}><Icon size={20} /></div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--slate-800)" }}>{it.title}</h4>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--slate-600)", lineHeight: 1.75 }}>{it.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:960px){.why-grid{grid-template-columns:1fr !important;gap:40px !important;}.why-grid>div:first-child{position:static !important;}}@media(max-width:600px){.why-cards{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ─── TEAM ──────────────────────────────────────────── */
const teamMembers = [
  { photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop&crop=faces", name: "محمد احمدی", role: "مدیرعامل و حسابدار رسمی", exp: "۲۲ سال", badge: "عضو جامعه حسابداران رسمی", phone: "02188776655", email: "m.ahmadi@shakhes-mehr.ir" },
  { photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop&crop=faces", name: "زهرا رحیمی", role: "سرپرست حسابرسی", exp: "۱۵ سال", badge: "حسابرس مستقل", phone: "02188776666", email: "z.rahimi@shakhes-mehr.ir" },
  { photo: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80&auto=format&fit=crop&crop=faces", name: "فرید کریمی", role: "وکیل مالیاتی", exp: "۱۸ سال", badge: "وکیل پایه‌یک دادگستری", phone: "02188776677", email: "f.karimi@shakhes-mehr.ir" },
  { photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop&crop=faces", name: "رویا نوری", role: "سرپرست بیمه و دستمزد", exp: "۱۱ سال", badge: "متخصص تامین اجتماعی", phone: "02188776688", email: "r.nouri@shakhes-mehr.ir" },
];

function TeamSection() {
  return (
    <section id="team" className="section-pad">
      <div className="container-page">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <EyebrowPill icon={TeamIco}>تیم متخصصان</EyebrowPill>
          <h2 className="split-h2 flex flex-col justify-center items-center" style={{ marginTop: 18 }}><span className="setup">افرادی که با امور مالی شما</span><span className="accent">مثل کسب‌وکار خودشان رفتار می‌کنند</span></h2>
        </div>
        <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {teamMembers.map((m, i) => (
            <div key={i} className="design-card" style={{ padding: 0, borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "linear-gradient(160deg,#FFE3E7 0%,#FFCAD2 100%)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 60%,rgba(15,23,42,0.35) 100%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "#fff", color: "var(--slate-800)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, boxShadow: "0 6px 14px -4px rgba(0,0,0,0.25)" }}>
                  <ClockIco size={13} style={{ color: "var(--rose-500)" }} /><span>{m.exp} سابقه</span>
                </div>
              </div>
              <div style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--slate-800)" }}>{m.name}</h4>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--rose-500)", fontWeight: 700 }}>{m.role}</p>
                <div style={{ marginTop: 12, padding: "7px 10px", background: "var(--rose-50)", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "var(--rose-700)", lineHeight: 1.4 }}>{m.badge}</div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--slate-100)", display: "flex", gap: 8 }}>
                  <a href={`tel:${m.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 8px", background: "var(--rose-500)", color: "#fff", borderRadius: 10, fontSize: 12, fontWeight: 700, transition: "background .15s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--rose-600)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--rose-500)")}>
                    <PhoneIco size={14} /><span>تماس</span>
                  </a>
                  <a href={`mailto:${m.email}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 8px", background: "#fff", color: "var(--slate-700)", border: "1px solid var(--slate-200)", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                    <span>ایمیل</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:960px){.team-grid{grid-template-columns:repeat(2,1fr) !important;}}@media(max-width:480px){.team-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ─── TRUST ─────────────────────────────────────────── */
const clients = ["آرین شیمی", "سرما تجارت", "گروه پاژ", "نگین خاوران", "آدا تجهیز", "هلدینگ ماهور", "صنایع پارس‌بان", "بازرگانی نیلوفر", "ارکیده سبز", "کیمیا فولاد"];
const accreditations = ["سازمان امور مالیاتی کشور", "جامعه حسابداران رسمی ایران", "سازمان تامین اجتماعی", "کانون وکلای دادگستری"];
const partners = [{ name: "همکاران سیستم", sub: "Sepidar / Hamkaran Software" }, { name: "سپیدار", sub: "نرم‌افزار حسابداری" }, { name: "ایزی اینویس", sub: "صورتحساب آسان" }, { name: "هلو  ", sub: "نرم‌افزار حسابداری" }];

function TrustSection() {
  return (
    <section id="trust" className="section-pad" style={{ background: "#fff" }}>
      <div className="container-page">
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <EyebrowPill icon={HandshakeIco}>اعتماد، در عمل</EyebrowPill>
          <h2 className="split-h2 flex flex-col justify-center items-center" style={{ marginTop: 18 }}><span className="setup">بیش از ۳۲۰ کسب‌وکار</span><span className="accent">امور مالی خود را به ما سپرده‌اند</span></h2>
        </div>
        <div className="marquee" style={{ marginBottom: 64 }}>
          <div className="marquee-track">
            {[...clients, ...clients].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 180, height: 64, padding: "0 22px", fontSize: 18, fontWeight: 800, color: "var(--slate-400)", whiteSpace: "nowrap", opacity: 0.85, borderRadius: 12, background: "var(--slate-50)", border: "1px solid var(--slate-100)" }}>{c}</div>
            ))}
          </div>
        </div>
        <div className="trust-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="design-card" style={{ padding: 32, borderRadius: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <ShieldIco size={20} style={{ color: "var(--rose-500)" }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: 1 }}>مجوزها و عضویت‌ها</h4>
            </div>
            <p style={{ margin: "4px 0 20px", fontSize: 18, fontWeight: 800, color: "var(--slate-800)", lineHeight: 1.4 }}>زیر نظر نهادهای رسمی، نه ادعای شخصی.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {accreditations.map((a, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--slate-50)", borderRadius: 12, border: "1px solid var(--slate-100)", fontSize: 14, fontWeight: 600, color: "var(--slate-700)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 9999, background: "var(--rose-500)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckIco size={14} /></span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="design-card" style={{ padding: 32, borderRadius: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <PuzzleIco size={20} style={{ color: "var(--rose-500)" }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: 1 }}>شرکای تجاری</h4>
            </div>
            <p style={{ margin: "4px 0 20px", fontSize: 18, fontWeight: 800, color: "var(--slate-800)", lineHeight: 1.4 }}>با نرم‌افزارهایی که شما استفاده می‌کنید، یکپارچه کار می‌کنیم.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {partners.map((p, i) => <div key={i} style={{ padding: "14px 16px", background: "var(--slate-50)", borderRadius: 12, border: "1px solid var(--slate-100)", textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 800, color: "var(--slate-800)" }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 2 }}>{p.sub}</div></div>)}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:800px){.trust-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ─── BLOG PREVIEW ───────────────────────────────────── */
function BlogPreviewSection() {
  const { data } = useSWR<GetBlogPostsResponse>('/blog?status=published&limit=3', fetcher);
  const posts = data?.items ?? [];

  return (
    <section id="blog" className="section-pad">
      <div className="container-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
          <div>
            <EyebrowPill icon={BookIco}>مقالات مالی</EyebrowPill>
            <h2 className="split-h2" style={{ marginTop: 18 }}><span className="setup">آخرین مقالات تخصصی</span><span className="accent">حسابداری، مالیات و بیمه</span></h2>
          </div>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 12, background: "var(--rose-50)", color: "var(--rose-500)", border: "1px solid var(--rose-200)", fontSize: 14, fontWeight: 700 }}>
            <span>همه مقالات</span><ArrowLeftIco size={16} />
          </Link>
        </div>
        {posts.length > 0 && (
          <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <div className="design-card" style={{ padding: 0, borderRadius: 24, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", transition: "transform .2s, box-shadow .2s", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px -20px rgba(31,42,68,0.18)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 32px rgba(0,0,0,0.02)"; }}>
                  <div style={{ height: 180, overflow: "hidden", background: "var(--slate-100)" }}>
                    {post.coverImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--slate-100)" }} />
                    )}
                  </div>
                  <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {post.categories?.[0] && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--rose-600)", background: "var(--rose-50)", padding: "4px 10px", borderRadius: 9999 }}>{post.categories[0].name}</span>
                      )}
                      {post.publishedAt && (
                        <span style={{ fontSize: 11, color: "var(--slate-400)" }}>{new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--slate-800)", lineHeight: 1.5 }}>{post.title}</h3>
                    {post.excerpt && (
                      <p style={{ margin: 0, fontSize: 13, color: "var(--slate-600)", lineHeight: 1.75, flex: 1 }}>{post.excerpt}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--rose-500)", marginTop: 4 }}>
                      <span>ادامه مطلب</span><ArrowLeftIco size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`@media(max-width:900px){.blog-grid{grid-template-columns:1fr 1fr !important;}}@media(max-width:560px){.blog-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ─── LEAD (CTA FORM) ────────────────────────────────── */
const serviceChips = ["حسابداری", "حسابرسی", "دعاوی مالیاتی", "بیمه", "همه موارد"];
const sizeChips = ["کوچک (زیر ۵ نفر)", "متوسط (۵-۲۰)", "بزرگ (+۲۰)"];
const businessTypeChips = ["خدماتی", "تولیدی", "بازرگانی", "پیمانکاری", "مشاغل حقیقی"];

function LeadSection() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedBizType, setSelectedBizType] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const step1Valid = name.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const dto: CreateLeadDto = {
        name,
        phone,
        businessName: businessName || undefined,
        businessType: selectedBizType || undefined,
        service: selectedService || undefined,
        businessSize: selectedSize || undefined,
        message: message || undefined,
      };
      await fetcher('/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      setSubmitSuccess(true);
    } catch {
      setSubmitError('خطا در ارسال. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepDots = [1, 2, 3];

  return (
    <section id="lead" className="section-pad" style={{ paddingTop: 48 }}>
      <div className="container-page">
        <div style={{ position: "relative", borderRadius: 32, overflow: "hidden", background: "linear-gradient(165deg,var(--rose-500) 0%,var(--rose-600) 60%,var(--rose-700) 100%)", boxShadow: "0 30px 70px -20px color-mix(in srgb, var(--rose-500) 40%, transparent)" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "url('/dot-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "200px 200px", opacity: 0.18, pointerEvents: "none" }} />
          <div className="lead-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)", gap: 0 }}>
            {/* ── Left panel ── */}
            <div style={{ padding: "56px 48px", color: "#fff" }}>
              <EyebrowPill icon={SparkleIco} dark>مشاوره رایگان</EyebrowPill>
              <h2 className="split-h2" style={{ marginTop: 20, textAlign: "right" }}>
                <span className="setup" style={{ color: "#fff" }}>مشاوره رایگان 20 دقیقه‌ای</span>
              </h2>
              <p style={{ marginTop: 20, fontSize: 16, color: "rgba(255,255,255,0.90)", lineHeight: 1.85 }}>فرم را پر کنید؛ یک کارشناس متخصص متناسب با کسب‌وکار شما، <strong>در کمتر از ۲ ساعت کاری</strong> با شما تماس می‌گیرد.</p>
              <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
                {[{ Icon: ClockIco, t: "تماس در ۲ ساعت کاری" }, { Icon: LockIco, t: "محرمانه و بدون تعهد" }, { Icon: ChartIco, t: "گزارش وضعیت مالیاتی فعلی" }].map(({ Icon, t }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.18)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.28)" }}><Icon size={18} /></div>
                    <span style={{ fontSize: 15, color: "#fff", fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right panel: multi-step form ── */}
            <div className="lead-form-box" style={{ background: "#fff", borderTopLeftRadius: 32, borderBottomLeftRadius: 32, padding: "48px 44px", display: "flex", flexDirection: "column" }}>

              {submitSuccess ? (
                <div style={{ textAlign: "center", margin: "auto 0", padding: "32px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h4 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "var(--slate-800)" }}>درخواست شما ثبت شد!</h4>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--slate-500)", lineHeight: 1.8 }}>کارشناسان ما در کمتر از ۲ ساعت کاری با شما تماس می‌گیرند.</p>
                </div>
              ) : (
                <>
                  {/* Step indicator */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }} dir="rtl">
                    <div>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--rose-500)", textTransform: "uppercase", letterSpacing: 1 }}>مرحله {step} از ۳</p>
                      <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "var(--slate-800)" }}>
                        {step === 1 ? 'اطلاعات تماس' : step === 2 ? 'اطلاعات کسب‌وکار' : 'نیاز و توضیحات'}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {stepDots.map(d => (
                        <div key={d} style={{ width: d === step ? 24 : 8, height: 8, borderRadius: 9999, background: d <= step ? "var(--rose-500)" : "var(--slate-200)", transition: "all .25s" }} />
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Contact info */}
                  {step === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }} dir="rtl">
                      <div className="design-field">
                        <label htmlFor="lead-name">نام و نام خانوادگی <span style={{ color: "var(--rose-500)" }}>*</span></label>
                        <input id="lead-name" type="text" placeholder="مثلا: محمد احمدی" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="design-field">
                        <label htmlFor="lead-phone">شماره تماس <span style={{ color: "var(--rose-500)" }}>*</span></label>
                        <input id="lead-phone" type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" style={{ textAlign: "right" }} value={phone} onChange={e => setPhone(e.target.value)} />
                      </div>
                      <div className="design-field">
                        <label htmlFor="lead-biz">نام کسب‌وکار</label>
                        <input id="lead-biz" type="text" placeholder="مثلا: شرکت آرین شیمی" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                      </div>
                      <button
                        type="button"
                        disabled={!step1Valid}
                        onClick={() => setStep(2)}
                        style={{ marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: step1Valid ? "var(--rose-500)" : "var(--slate-200)", color: step1Valid ? "#fff" : "var(--slate-400)", fontSize: 15, fontWeight: 700, border: "none", cursor: step1Valid ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "background .15s" }}>
                        <span>مرحله بعد</span><ArrowLeftIco size={17} />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Business profile */}
                  {step === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} dir="rtl">
                      <div className="design-field">
                        <label>نوع کسب‌وکار</label>
                        <div className="chip-row" style={{ marginTop: 8 }}>
                          {businessTypeChips.map(t => (
                            <button key={t} type="button" className={`chip${selectedBizType === t ? ' chip-active' : ''}`} onClick={() => setSelectedBizType(selectedBizType === t ? '' : t)}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <div className="design-field">
                        <label>اندازه کسب‌وکار</label>
                        <div className="chip-row" style={{ marginTop: 8 }}>
                          {sizeChips.map(s => (
                            <button key={s} type="button" className={`chip${selectedSize === s ? ' chip-active' : ''}`} onClick={() => setSelectedSize(selectedSize === s ? '' : s)}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                        <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "13px 0", borderRadius: 12, background: "var(--slate-100)", color: "var(--slate-600)", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                          قبلی
                        </button>
                        <button type="button" onClick={() => setStep(3)} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 12, background: "var(--rose-500)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                          <span>مرحله بعد</span><ArrowLeftIco size={17} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Service + message */}
                  {step === 3 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} dir="rtl">
                      <div className="design-field">
                        <label>خدمت مورد نیاز</label>
                        <div className="chip-row" style={{ marginTop: 8 }}>
                          {serviceChips.map(s => (
                            <button key={s} type="button" className={`chip${selectedService === s ? ' chip-active' : ''}`} onClick={() => setSelectedService(selectedService === s ? '' : s)}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div className="design-field">
                        <label htmlFor="lead-desc">توضیحات تکمیلی (اختیاری)</label>
                        <textarea id="lead-desc" placeholder="مثلا: امسال برگ تشخیص گرفته‌ایم و نیاز به اعتراض داریم..." value={message} onChange={e => setMessage(e.target.value)} style={{ minHeight: 90 }} />
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "13px 0", borderRadius: 12, background: "var(--slate-100)", color: "var(--slate-600)", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                          قبلی
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleSubmit}
                          style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 12, background: isSubmitting ? "var(--slate-300)" : "var(--rose-500)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background .15s" }}>
                          <span>{isSubmitting ? 'در حال ارسال...' : 'ثبت درخواست مشاوره رایگان'}</span>
                          {!isSubmitting && <ArrowLeftIco size={17} />}
                        </button>
                      </div>
                      {submitError && (
                        <p style={{ fontSize: 13, color: "var(--rose-600)", textAlign: "center", margin: 0 }}>{submitError}</p>
                      )}
                      <p style={{ fontSize: 11, color: "var(--slate-400)", textAlign: "center", margin: 0 }}>با ارسال این فرم، با شرایط محرمانگی موسسه شاخص محاسبان مهر موافقت می‌کنید.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.lead-grid{grid-template-columns:1fr !important;}.lead-form-box{border-radius:0 !important;}}@media(max-width:520px){.lead-form-box{padding:32px 24px !important;}} .chip-active{background:var(--rose-500) !important;color:#fff !important;border-color:var(--rose-500) !important;}`}</style>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────── */
const faqs = [
  {
    q: "تفاوت حسابداری و حسابرسی چیست و کدام‌یک برای من ضروری است؟",
    a: "حسابداری ثبت و طبقه‌بندی مستمر رویدادهای مالی است؛ حسابرسی بررسی مستقل همان اطلاعات برای اطمینان از صحت آن‌ها. اگر صاحب کسب‌وکاری هستید که اسناد مالی دارد، حسابداری برایتان الزامی است. حسابرسی زمانی ضروری می‌شود که بانک، سرمایه‌گذار یا سازمان مالیاتی گزارش تأییدشده مستقل درخواست کند، یا خودتان بخواهید از صحت حساب‌ها مطمئن شوید.",
  },
  {
    q: "هزینه خدمات حسابداری برون‌سپاری چقدر است؟",
    a: "هزینه بستگی به حجم تراکنش‌های ماهانه، تعداد پرسنل و پیچیدگی فعالیت دارد. بعد از یک جلسه ارزیابی رایگان، پیشنهاد قیمت شفاف و ثابت ماهانه ارائه می‌شود. اکثر کسب‌وکارهای کوچک و متوسط دریافته‌اند که هزینه برون‌سپاری کمتر از استخدام یک حسابدار تمام‌وقت است، چون هزینه‌های جانبی (بیمه، مرخصی، آموزش) را نیز حذف می‌کند.",
  },
  {
    q: "اگر برگ تشخیص مالیاتی نامتعارف دریافت کرده‌ام چه باید بکنم؟",
    a: "مهلت اعتراض ۳۰ روز از ابلاغ برگ تشخیص است. در همین مدت با ما تماس بگیرید. ما برگ تشخیص و اسناد پشتیبان را بررسی می‌کنیم، لایحه دفاعیه با مستندات قانونی تنظیم می‌کنیم و در هیأت حل اختلاف بدوی و در صورت نیاز تجدیدنظر، حضور و دفاع خواهیم داشت. در اکثر پرونده‌های ما رقم مالیات تعیینی به‌طور قابل‌توجهی کاهش یافته است.",
  },
  {
    q: "قرارداد حسابداری چه مدت است و چه خدماتی را پوشش می‌دهد؟",
    a: "قراردادها معمولاً یک‌ساله با امکان تمدید منعقد می‌شوند. بسته استاندارد شامل ثبت اسناد روزانه، تنظیم دفاتر قانونی، تهیه اظهارنامه مالیاتی عملکرد و ارزش افزوده، گزارش معاملات فصلی (ماده ۱۶۹)، لیست حقوق و بیمه ماهانه، و گزارش مالی ماهانه است. بسته‌های تخصصی برای نیازهای خاص (دعاوی مالیاتی، حسابرسی داخلی) به صورت جداگانه تعریف می‌شوند.",
  },
  {
    q: "آیا امکان همکاری آنلاین و از راه دور وجود دارد؟",
    a: "بله. بخش بزرگی از مشتریان ما خارج از تهران هستند. ارسال اسناد از طریق پنل امن دیجیتال، جلسات مشاوره‌ای با تماس تصویری، و پیگیری پرونده‌های مالیاتی در شهرستان‌ها (با هماهنگی وکالتنامه) به‌صورت کامل پشتیبانی می‌شود.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="section-pad">
      <div className="container-page">
        <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,.7fr) minmax(0,1.3fr)", gap: 56, alignItems: "start" }}>
          <div>
            <EyebrowPill icon={QuestionIco}>سوالات متداول</EyebrowPill>
            <h2 className="split-h2" style={{ marginTop: 18, textAlign: "right" }}><span className="setup">شفاف، بدون حاشیه:</span><span className="accent">پاسخ به آنچه می‌پرسید.</span></h2>
            <p style={{ marginTop: 18, fontSize: 15, color: "var(--slate-600)", lineHeight: 1.85 }}>سوالی دارید که اینجا پاسخ داده نشده؟ <a href="#lead" style={{ color: "var(--rose-500)", fontWeight: 700 }}>بپرسید →</a></p>
          </div>
          <div className="design-card" style={{ padding: "8px 28px", borderRadius: 24 }}>
            {faqs.map((f, i) => (
              <details key={i} className="faq-row">
                <summary><span>{f.q}</span><ChevronIco size={22} /></summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.faq-grid{grid-template-columns:1fr !important;gap:32px !important;}}`}</style>
    </section>
  );
}

/* ─── PAGE ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <RootLayout navbarTransparent={false} heroBg>
      <div style={{ overflowX: "hidden" }}>
        <HeroSection />
        <div className="page-lift">
          <StatsSection />
          <ServicesSection />
          <EducationSection />
          <WhyUsSection />
          <TeamSection />
          <TrustSection />
          <BlogPreviewSection />
          <LeadSection />
          <FaqSection />
        </div>
      </div>
    </RootLayout>
  );
}
