'use client';

import { Input } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconSearch } from '@tabler/icons-react';
import { AdvertisementFilters, PublishStatus, RealEstateCategory } from '../crawler.types';

const CATEGORY_ITEMS: { label: string; value: RealEstateCategory | '' }[] = [
  { label: 'همه دسته‌ها', value: '' },
  { label: 'فروش', value: RealEstateCategory.SALE },
  { label: 'رهن و اجاره', value: RealEstateCategory.RENT },
  { label: 'رهن کامل', value: RealEstateCategory.MORTGAGE },
];

const PUBLISH_ITEMS: { label: string; value: PublishStatus | '' }[] = [
  { label: 'همه وضعیت‌ها', value: '' },
  { label: 'در انتظار تأیید', value: PublishStatus.PENDING },
  { label: 'منتشرشده', value: PublishStatus.PUBLISHED },
  { label: 'رد شده', value: PublishStatus.REJECTED },
];

interface AdsFiltersProps {
  filters: AdvertisementFilters;
  onChange: (patch: Partial<AdvertisementFilters>) => void;
}

export function AdsFilters({ filters, onChange }: AdsFiltersProps) {
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
        <div className="w-44">
          <Dropdown<PublishStatus | ''>
            items={PUBLISH_ITEMS}
            value={filters.publishStatus ?? ''}
            onChange={(value) =>
              onChange({ publishStatus: (value || undefined) as PublishStatus, page: 0 })
            }
            placeholder="وضعیت انتشار"
            variant="outline"
            size="sm"
          />
        </div>
        <div className="w-44">
          <Dropdown<RealEstateCategory | ''>
            items={CATEGORY_ITEMS}
            value={filters.category ?? ''}
            onChange={(value) =>
              onChange({ category: (value || undefined) as RealEstateCategory, page: 0 })
            }
            placeholder="دسته‌بندی"
            variant="outline"
            size="sm"
          />
        </div>
        <div className="w-28">
          <Input
            type="number"
            placeholder="خواب"
            value={filters.rooms ?? ''}
            onChange={(e) =>
              onChange({
                rooms: e.target.value ? Number(e.target.value) : undefined,
                page: 0,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
