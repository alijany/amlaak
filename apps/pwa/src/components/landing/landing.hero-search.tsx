'use client';

import { usePublicListings } from '@/app/listings/listings.api';
import { brand } from '@/config/brand.config';
import { cn } from '@/libs/style/style.util.helpers';
import { Button, Input } from '@/ui/atoms';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { hero, categories, popularCities } = brand.landing;
const TABS = categories.filter((c) => c.query);

export function LandingHeroSearch() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('sale');
  const [q, setQ] = useState('');
  // Lightweight trust signal: total published listings.
  const total = usePublicListings({ limit: 1 }).data?.meta?.total;

  const search = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q.trim()) params.set('q', q.trim());
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Image-forward background with a dark gradient for legibility.
          Falls back to the gradient alone if the photo asset is absent. */}
      <div
        className="absolute inset-0 -z-10 bg-slate-900"
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(15,23,42,0.94), rgba(15,23,42,0.55)), url(/images/hero-home.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-28 md:pt-36 pb-16 md:pb-24 text-center text-white">
        <h1 className="font-black text-3xl md:text-5xl !leading-snug">{hero.title}</h1>
        <p className="mt-4 text-white/80 text-md md:text-lg max-w-2xl mx-auto">
          {hero.subtitle}
        </p>

        {/* Search panel — the centerpiece */}
        <div className="mt-8 bg-white rounded-2xl shadow-2xl shadow-black/30 p-3 max-w-3xl mx-auto text-right">
          <div role="tablist" aria-label="نوع معامله" className="flex gap-1 mb-2 overflow-x-auto">
            {TABS.map((c) => (
              <button
                key={c.query}
                role="tab"
                aria-selected={category === c.query}
                onClick={() => setCategory(c.query)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  category === c.query
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="grow">
              <Input
                aria-label="جستجوی ملک"
                placeholder={hero.searchPlaceholder}
                icon={<IconSearch size={18} className="text-slate-400" />}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') search();
                }}
              />
            </div>
            <Button size="lg" variant="primary" className="text-white shrink-0" onClick={search}>
              {hero.searchCta}
            </Button>
          </div>
        </div>

        {/* Trust line */}
        <div className="mt-5 text-white/70 text-sm">
          {total != null
            ? `${total.toLocaleString('fa-IR')} آگهی فعال • به‌روزرسانی روزانه`
            : 'به‌روزرسانی روزانه آگهی‌ها'}
        </div>

        {/* Popular cities */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {popularCities.map((city) => (
            <Link
              key={city}
              href={`/listings?city=${encodeURIComponent(city)}`}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/90 hover:bg-white/20 transition-colors"
            >
              <IconMapPin size={13} />
              {city}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
