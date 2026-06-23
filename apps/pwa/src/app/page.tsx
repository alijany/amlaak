'use client';

import { RootLayout } from '@/components/layout/layout.component.root';
import { LandingAgenciesCta } from '@/components/landing/landing.agencies-cta';
import { LandingCategories } from '@/components/landing/landing.categories';
import { LandingFaq } from '@/components/landing/landing.faq';
import { LandingHeroSearch } from '@/components/landing/landing.hero-search';
import { LandingListingsStrip } from '@/components/landing/landing.listings-strip';
import { LandingSteps } from '@/components/landing/landing.steps';
import { LandingValueProps } from '@/components/landing/landing.value-props';
import { RealEstateCategory } from '@/app/listings/listings.types';

export default function Landing() {
  return (
    <RootLayout navbarTransparent>
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
    </RootLayout>
  );
}
