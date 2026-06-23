'use client';

import { brand } from '@/config/brand.config';
import { Button } from '@/ui/atoms';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

const { forAgencies } = brand.landing;

export function LandingAgenciesCta() {
  return (
    <section className="py-14 md:py-20 bg-slate-950 text-white">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 md:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">{forAgencies.title}</h2>
          <p className="text-white/70 leading-relaxed">{forAgencies.body}</p>
          <Link href="/dashboard/listings" className="inline-block">
            <Button size="lg" variant="white" className="rounded-2xl">
              {forAgencies.cta}
            </Button>
          </Link>
        </div>
        <div className="grid gap-3">
          {forAgencies.bullets.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                <IconCheck size={14} />
              </span>
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
