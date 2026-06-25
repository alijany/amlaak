'use client';

import { CitySelect } from '@/libs/city/city.component.select';
import { City } from '@/libs/city/city.types';
import { Input } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { PublicListingFilters, RealEstateCategory } from './listings.types';

const CATEGORY_ITEMS: { label: string; value: RealEstateCategory | '' }[] = [
  { label: 'همه دسته‌ها', value: '' },
  { label: 'فروش', value: RealEstateCategory.SALE },
  { label: 'رهن و اجاره', value: RealEstateCategory.RENT },
  { label: 'رهن کامل', value: RealEstateCategory.MORTGAGE },
];

interface ListingsFiltersProps {
  filters: PublicListingFilters;
  onChange: (patch: Partial<PublicListingFilters>) => void;
}

export function ListingsFilters({ filters, onChange }: ListingsFiltersProps) {
  const [city, setCity] = useState<City | null>(null);
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <Input
          placeholder="جستجو در عنوان و توضیحات"
          icon={<IconSearch size={18} />}
          value={filters.q || ''}
          onChange={(e) => onChange({ q: e.target.value || undefined, page: 0 })}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-40">
          <CitySelect
            label=""
            value={city}
            onChange={(c) => {
              setCity(c);
              onChange({ citySlug: c?.slug || undefined, page: 0 });
            }}
          />
        </div>
        <div className="w-44">
          <Dropdown<RealEstateCategory | ''>
            items={CATEGORY_ITEMS}
            value={filters.category ?? ''}
            onChange={(value) =>
              onChange({
                category: (value || undefined) as RealEstateCategory,
                page: 0,
              })
            }
            placeholder="دسته‌بندی"
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
