'use client';

import { brand } from '@/config/brand.config';

const { steps, stepsHeading } = brand.landing;

export function LandingSteps() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center mb-10">
          {stepsHeading}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-2xl border-b-4 border-slate-100 shadow-[0px_24px_40px_-16px_rgba(119,168,226,0.30)] p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
