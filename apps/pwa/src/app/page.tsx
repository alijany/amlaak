"use client";

import { brand, type FeatureIconKey } from "@/config/brand.config";
import { RootLayout } from "@/components/layout/layout.component.root";
import { Button, Card, CardContent, CardHeader, Input, Label } from "@/ui/atoms";
import Image from "next/image";
import Link from "next/link";
import { IconAnalyzeFilled, IconChartHistogram, IconMessageChatbotFilled, IconCheck, IconArrowLeft, IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const iconMap: Record<FeatureIconKey, React.ReactNode> = {
  chatbot: <IconMessageChatbotFilled size={32} className="text-blue-500" />,
  analyze: <IconAnalyzeFilled size={32} className="text-indigo-500" />,
  chart: <IconChartHistogram size={32} className="text-rose-500" />,
};

const { hero, problem, features, workflow, cta, faq } = brand.landing;

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const goSearch = () => {
    const q = query.trim();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
  };

  return (
    <RootLayout navbarTransparent>
      {/* HERO SECTION */}
      <section id="home" className="relative pt-12 md:pt-20 lg:pt-24 overflow-hidden">
        <Image src="/images/hero-bg.svg" alt="pattern" width={1200} height={600} className="absolute inset-0 h-screen w-full md:w-full md:h-auto object-cover pointer-events-none" />
        <div className="relative container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center space-y-6 sm:space-y-8 md:space-y-10">
          <Label>
            <span>{hero.label}</span>
          </Label>
          <h1 className="font-black text-3xl md:text-5xl lg:text-6xl !leading-snug">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              {hero.heading1}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400">
              {hero.heading2}
            </span>
          </h1>
          <p className="text-slate-600 text-md md:text-xl max-w-3xl">
            {hero.body}
          </p>

          {/* Marketplace search */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur border border-white shadow-xl shadow-black/5 p-2">
              <div className="grow">
                <Input
                  placeholder="جستجوی شهر، محله یا عنوان ملک"
                  icon={<IconSearch size={18} className="text-slate-400" />}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goSearch();
                  }}
                  className="border-0"
                />
              </div>
              <Button size="lg" variant="primary" className="text-white shrink-0" onClick={goSearch}>
                جستجو
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-1">
            <Link className="block" href="/listings">
              <Button size="lg" variant="primary" className="shadow-xl shadow-blue-500/20 text-white">{hero.cta1}</Button>
            </Link>
            <Link href="/dashboard/listings">
              <Button size="lg" variant="secondary" className="">{hero.cta2}</Button>
            </Link>
          </div>
          <div className="hidden sm:grid grid-cols-3 gap-6 mt-10 w-full max-w-3xl">
          </div>
        </div>
        <a href="#why" className="mt-16 relative z-1000 mb-12 flex justify-center" aria-label="Scroll to next section">
          <div className="flex items-center justify-center">
            <div className="bg-white w-8 h-12 rounded-full border-2 border-slate-300/60 flex items-start justify-center p-1">
              <span className="block w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
            </div>
          </div>
        </a>

        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[140%] h-64 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
      </section>

      {/* PROBLEM -> SOLUTION */}
      <section id="why" className="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-800 !leading-snug">
              {problem.heading.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="text-slate-600 text-lg">{problem.body}</p>
            <Link className="block" href="/listings">
              <Button size="lg" variant="primary" className="mt-4">{problem.cta}</Button>
            </Link>
          </div>
          <div
            className="relative group max-w-xl mx-auto w-full motion-safe:animate-[float_9s_ease-in-out_infinite]"
            id="sample-output"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-gradient-to-tr from-blue-600/12 via-indigo-600/10 to-rose-500/14 opacity-80 blur-2xl transition duration-700 group-hover:opacity-100 group-hover:blur-3xl" />
            <div className="pointer-events-none absolute -top-6 -left-4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/40 to-transparent opacity-80 group-hover:opacity-95" />
            <div className="pointer-events-none absolute -bottom-10 -right-8 w-28 h-28 rounded-full bg-gradient-to-tl from-rose-500/45 to-transparent opacity-80 group-hover:opacity-95" />

            <Card className="relative overflow-hidden rounded-[28px] border border-slate-100/80 bg-white/80 backdrop-blur-xl shadow-[0_28px_80px_rgba(15,23,42,0.12)] transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_36px_100px_rgba(15,23,42,0.18)]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-rose-500/10" />
              <CardHeader className="space-y-2 bg-white relative z-10 px-4 pt-4 mx-2 mt-2 rounded-t-2xl pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                      {problem.sampleCard.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {problem.sampleCard.subtitle}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1 text-[10px] text-slate-500 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{problem.sampleCard.badge}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 bg-white relative z-10 px-4 pb-4 mb-2 mx-2 rounded-b-2xl pt-0">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                    <span className="text-[11px] text-slate-500">{problem.sampleCard.sentiment.label}</span>
                    <div className="text-sm font-semibold text-slate-800">{problem.sampleCard.sentiment.value}</div>
                    <span className="text-[10px] text-slate-400">{problem.sampleCard.sentiment.note}</span>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                    <span className="text-[11px] text-slate-500">{problem.sampleCard.need.label}</span>
                    <div className="text-sm font-semibold text-slate-800">{problem.sampleCard.need.value}</div>
                    <span className="text-[10px] text-slate-400">{problem.sampleCard.need.note}</span>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-slate-900 text-slate-50 rounded-2xl col-span-2 border border-slate-800/70 flex flex-col gap-1.5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)]">
                    <span className="text-[11px] text-slate-400">{problem.sampleCard.action.label}</span>
                    <div className="text-sm font-semibold">{problem.sampleCard.action.value}</div>
                    <span className="text-[10px] text-slate-400">{problem.sampleCard.action.note}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800">{brand.landing.workflowHeading}</h2>
          <p className="text-slate-600 text-lg">{brand.landing.workflowSubheading}</p>
        </div>
        <div className="mt-6 md:mt-16 container max-w-5xl mx-auto px-4 sm:px-6 md:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {workflow.map((w) => (
            <Card key={w.step} className="bg-white rounded-2xl border-b-4 border-slate-100 shadow-[0px_24px_40px_-16px_rgba(119,168,226,0.30)] p-6 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg mb-4">
                {w.step}
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">{w.title}</h3>
              <p className="text-sm text-slate-500 !leading-relaxed">{w.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800">{brand.landing.featuresHeading}</h2>
          <p className="text-slate-600 text-lg">{brand.landing.featuresSubheading}</p>
        </div>
        <div className="mt-8 md:mt-16 container max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-4 sm:px-6 md:px-8">
          {features.map((f) => (
            <Card key={f.title} className="bg-white border-b-4 border-slate-100 shadow-[0px_24px_40px_-16px_rgba(119,168,226,0.30)] p-6 flex flex-col text-right">
              <div className="mb-4">{iconMap[f.icon]}</div>
              <h3 className="font-semibold text-lg text-slate-700 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 !leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA STRONG */}
      <section
        id="cta"
        className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-slate-950 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(248,113,113,0.2),transparent_55%),linear-gradient(to_bottom,rgba(15,23,42,1),rgba(15,23,42,1))]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{ backgroundImage: "url(/images/plus-pattern.svg)", backgroundRepeat: "repeat" }}
        />

        <div className="relative container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid lg:grid-cols-[1.1fr_minmax(0,0.9fr)] gap-12 lg:gap-16 items-center">
          {/* Left: Copy + CTAs */}
          <div className="space-y-8 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] md:text-xs text-white/70 backdrop-blur">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{cta.badge}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black !leading-snug text-white">
                {cta.heading1}
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-sky-400 via-indigo-300 to-rose-300">
                  {cta.heading2}
                </span>
              </h2>
              <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto lg:mx-0">
                {cta.body}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs md:text-sm max-w-xl mx-auto lg:mx-0">
              {cta.bullets.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm text-white/80"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <IconCheck size={14} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <Link className="block" href="/listings">
                <Button
                  size="lg"
                  variant="white"
                  className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100 shadow-[0_18px_45px_-22px_rgba(15,23,42,0.9)] transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {cta.cta1}
                </Button>
              </Link>
              <Link className="block" href="/dashboard/listings">
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-2xl border border-white/20 text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <span>{cta.cta2}</span>
                  <IconArrowLeft size={18} />
                </Button>
              </Link>
            </div>

            <p className="text-[11px] text-white/50 font-light">{cta.footnote}</p>
          </div>

          {/* Right: Glass card */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 bg-gradient-to-tr from-sky-400/30 via-transparent to-rose-400/20 opacity-40 blur-3xl" />

            <Card className="relative rounded-3xl border border-white/15 bg-white/8 bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-2xl shadow-[0_26px_74px_-32px_rgba(15,23,42,0.95)] p-5 md:p-7 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                    {cta.sampleCard.eyebrow}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {cta.sampleCard.title}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] text-emerald-200 border border-emerald-400/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>{cta.sampleCard.badge}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] md:text-xs text-white/85">
                <div className="rounded-2xl bg-white/8 border border-white/10 p-3 flex flex-col">
                  <span className="text-white/50">{cta.sampleCard.sentiment.label}</span>
                  <span className="mt-1 font-semibold">{cta.sampleCard.sentiment.value}</span>
                  <span className="mt-1 text-[10px] text-white/45">{cta.sampleCard.sentiment.note}</span>
                </div>
                <div className="rounded-2xl bg-white/8 border border-white/10 p-3 flex flex-col">
                  <span className="text-white/50">{cta.sampleCard.need.label}</span>
                  <span className="mt-1 font-semibold">{cta.sampleCard.need.value}</span>
                  <span className="mt-1 text-[10px] text-white/45">{cta.sampleCard.need.note}</span>
                </div>
                <div className="rounded-2xl bg-white/8 border border-white/10 p-3 flex flex-col col-span-2">
                  <span className="text-white/50">{cta.sampleCard.action.label}</span>
                  <span className="mt-1 font-semibold">{cta.sampleCard.action.value}</span>
                  <span className="mt-1 text-[10px] text-white/45">{cta.sampleCard.action.note}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-black/40 border border-white/15 p-3.5 md:p-4 font-mono text-[10px] !leading-relaxed text-white/85 overflow-x-auto">
                {cta.sampleCard.json}
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px] text-white/45">
                <span>{cta.sampleCard.apiNote}</span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-sky-300" />
                  <span>{cta.sampleCard.syncNote}</span>
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-12 sm:py-16 md:py-20 lg:py-28 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%,rgba(59,130,246,0.08),transparent 60%)' }} />
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800">{faq.heading}</h2>
            <p className="text-slate-600 mt-4 text-sm md:text-base">{faq.subheading}</p>
          </div>
          <div className="grid md:grid-cols-2 items-start gap-6">
            {faq.items.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <div key={idx} className={`group rounded-2xl border backdrop-blur bg-white/60 transition ${open ? 'bg-white/80 border-slate-300' : 'border-slate-200 hover:border-slate-300'}`}>
                  <button
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 text-right p-5"
                    aria-expanded={open}
                    aria-controls={`faq-${idx}-panel`}
                  >
                    <span className={`text-sm md:text-base font-medium !leading-relaxed text-right flex-1 ${open ? 'text-slate-900' : 'text-slate-700'}`}>{item.q}</span>
                    <span className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-slate-500 text-xs transition bg-white/70 ${open ? 'border-slate-400' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      <IconChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  <div id={`faq-${idx}-panel`} className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 pt-2 text-xs md:text-sm !leading-relaxed text-slate-600">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </RootLayout>
  );
}
