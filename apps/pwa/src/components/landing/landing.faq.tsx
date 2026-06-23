'use client';

import { brand } from '@/config/brand.config';
import { IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';

const { faq } = brand.landing;

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 md:py-20 bg-white">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">{faq.heading}</h2>
          <p className="text-slate-500 mt-3 text-sm">{faq.subheading}</p>
        </div>
        <div className="space-y-3">
          {faq.items.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition ${isOpen ? 'border-slate-300 bg-white' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-start justify-between gap-4 text-right p-5"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm md:text-base font-medium flex-1 ${isOpen ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.q}
                  </span>
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-500">
                    <IconChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
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
  );
}
