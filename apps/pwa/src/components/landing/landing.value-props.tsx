'use client';

import { brand, type ValuePropIconKey } from '@/config/brand.config';
import {
  IconBuildingCommunity,
  IconPhoneCall,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';

const { valueProps, valuePropsHeading } = brand.landing;

const ICONS: Record<ValuePropIconKey, React.ReactNode> = {
  collection: <IconBuildingCommunity size={26} className="text-blue-500" />,
  fresh: <IconSparkles size={26} className="text-amber-500" />,
  phone: <IconPhoneCall size={26} className="text-emerald-500" />,
  shield: <IconShieldCheck size={26} className="text-violet-500" />,
};

export function LandingValueProps() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center mb-10">
          {valuePropsHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((v) => (
            <div key={v.title} className="text-center sm:text-right flex flex-col gap-2">
              <div className="rounded-2xl bg-slate-50 w-12 h-12 flex items-center justify-center mx-auto sm:mx-0">
                {ICONS[v.icon]}
              </div>
              <h3 className="font-bold text-slate-800 mt-1">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
