'use client';

import { brand } from '@/config/brand.config';
import {
  IconBuildingEstate,
  IconHome2,
  IconKey,
  IconLayoutGrid,
} from '@tabler/icons-react';
import Link from 'next/link';

const { categories } = brand.landing;

const ICONS: Record<string, React.ReactNode> = {
  sale: <IconHome2 size={26} className="text-blue-500" />,
  rent: <IconKey size={26} className="text-emerald-500" />,
  mortgage: <IconBuildingEstate size={26} className="text-violet-500" />,
  '': <IconLayoutGrid size={26} className="text-slate-500" />,
};

export function LandingCategories() {
  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={c.query ? `/listings?category=${c.query}` : '/listings'}
              className="rounded-2xl border border-slate-100 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col gap-2"
            >
              <div className="rounded-xl bg-slate-50 w-12 h-12 flex items-center justify-center">
                {ICONS[c.query]}
              </div>
              <div className="font-bold text-slate-800">{c.label}</div>
              <div className="text-[12px] text-slate-500 leading-relaxed">{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
