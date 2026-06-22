'use client';

import { Input } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconSearch } from '@tabler/icons-react';
import { LEAD_SOURCE_LABEL, LEAD_STATUS_LABEL } from './leads.constants';
import { LeadFilters, LeadSource, LeadStatus } from './leads.types';

const STATUS_ITEMS: { label: string; value: LeadStatus | '' }[] = [
  { label: 'همه وضعیت‌ها', value: '' },
  ...Object.values(LeadStatus).map((s) => ({ label: LEAD_STATUS_LABEL[s], value: s })),
];

const SOURCE_ITEMS: { label: string; value: LeadSource | '' }[] = [
  { label: 'همه منابع', value: '' },
  ...Object.values(LeadSource).map((s) => ({ label: LEAD_SOURCE_LABEL[s], value: s })),
];

interface LeadsFiltersProps {
  filters: LeadFilters;
  onChange: (patch: Partial<LeadFilters>) => void;
}

export function LeadsFilters({ filters, onChange }: LeadsFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <Input
          placeholder="جستجو در نام، تلفن، کد رهگیری یا عنوان آگهی"
          icon={<IconSearch size={18} />}
          value={filters.q || ''}
          onChange={(e) => onChange({ q: e.target.value || undefined, page: 0 })}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-40">
          <Dropdown<LeadStatus | ''>
            items={STATUS_ITEMS}
            value={filters.status ?? ''}
            onChange={(value) =>
              onChange({ status: (value || undefined) as LeadStatus, page: 0 })
            }
            placeholder="وضعیت"
            variant="outline"
            size="sm"
          />
        </div>
        <div className="w-40">
          <Dropdown<LeadSource | ''>
            items={SOURCE_ITEMS}
            value={filters.source ?? ''}
            onChange={(value) =>
              onChange({ source: (value || undefined) as LeadSource, page: 0 })
            }
            placeholder="منبع"
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
