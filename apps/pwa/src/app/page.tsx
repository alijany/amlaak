'use client';

import { RealEstateCategory } from '@/app/listings/listings.types';
import { LandingAgenciesCta } from '@/components/landing/landing.agencies-cta';
import { LandingCategories } from '@/components/landing/landing.categories';
import { LandingFaq } from '@/components/landing/landing.faq';
import { LandingHeroSearch } from '@/components/landing/landing.hero-search';
import { LandingListingsStrip } from '@/components/landing/landing.listings-strip';
import { LandingSteps } from '@/components/landing/landing.steps';
import { LandingValueProps } from '@/components/landing/landing.value-props';
import { Footer } from '@/components/layout/layout.component.footer';
import { Navbar } from '@/components/layout/layout.component.navbar';

export default function Landing() {
  return (
    <div>
      <Navbar />
      <LandingHeroSearch />
      <LandingCategories />
      <LandingListingsStrip title="جدیدترین آگهی‌ها" filters={{ limit: 8 }} />
      <LandingValueProps />
      <LandingListingsStrip
        title="فروش ملک"
        filters={{ limit: 4, category: RealEstateCategory.SALE }}
        viewAllHref="/listings?category=sale"
      />
      <LandingSteps />
      <LandingAgenciesCta />
      <LandingFaq />
      <Footer />
    </div>
  );
}
