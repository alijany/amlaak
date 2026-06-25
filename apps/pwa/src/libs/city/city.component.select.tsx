'use client';

import { cn } from '@/libs/style/style.util.helpers';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useCities } from './city.api';
import { City } from './city.types';

interface CitySelectProps {
  /** Currently selected city (full object), or null. */
  value?: City | null;
  onChange: (city: City | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Searchable city picker backed by the /cities lookup endpoint. Search is
 * server-side (passes `q`), so it scales to the full curated city list.
 */
export function CitySelect({
  value,
  onChange,
  label = 'شهر',
  placeholder = 'انتخاب شهر',
  error,
  disabled,
  className,
}: CitySelectProps) {
  const [query, setQuery] = useState('');
  const { data } = useCities({ q: query || undefined, limit: 50 });
  const cities = data?.items ?? [];

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="font-medium mb-2 flex items-center text-slate-700">
          {label}
        </label>
      )}
      <Combobox
        value={value ?? null}
        onChange={onChange}
        disabled={disabled}
        immediate
      >
        <div className="relative">
          <div
            className={cn(
              'flex items-center px-4 rounded-xl border focus-within:ring-1',
              error
                ? 'border-rose-500 focus-within:ring-rose-500'
                : 'border-slate-200 focus-within:border-slate-500 focus-within:ring-slate-500',
            )}
          >
            <ComboboxInput
              className="text-sm w-full py-2.5 bg-transparent outline-none text-slate-700 disabled:opacity-50"
              placeholder={placeholder}
              displayValue={(c: City | null) => c?.nameFa ?? ''}
              onChange={(e) => setQuery(e.target.value)}
            />
            {value && !disabled && (
              <button
                type="button"
                aria-label="حذف شهر"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => {
                  onChange(null);
                  setQuery('');
                }}
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
            <ComboboxButton className="text-slate-400">
              <IconChevronDown className="h-4 w-4" />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            anchor="bottom"
            transition
            className={cn(
              'z-50 mt-1 w-[var(--input-width)] rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none',
              'max-h-60 overflow-y-auto overscroll-contain empty:invisible',
              'origin-top transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
            )}
          >
            {cities.length === 0 && (
              <div className="px-4 py-2 text-sm text-slate-400">
                شهری یافت نشد
              </div>
            )}
            {cities.map((city) => (
              <ComboboxOption
                key={city.id}
                value={city}
                className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-right text-sm text-slate-700 transition-colors data-[focus]:bg-slate-100 data-[selected]:font-medium data-[selected]:text-slate-900"
              >
                {city.nameFa}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
}
