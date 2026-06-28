'use client';

import { ImageUploader } from '@/components/upload/upload.component.image';
import { ApiError } from '@/libs/api/api.types.error';
import { CitySelect } from '@/libs/city/city.component.select';
import { City } from '@/libs/city/city.types';
import { Button, Input, Modal } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateListing, useUpdateListing } from './listings.api';
import { ListingFormDto, MyListing, RealEstateCategory } from './listings.types';

const FIXED_PROVINCE = 'گیلان';

const CATEGORY_ITEMS = [
  { label: 'فروش', value: RealEstateCategory.SALE },
  { label: 'رهن و اجاره', value: RealEstateCategory.RENT },
  { label: 'رهن کامل', value: RealEstateCategory.MORTGAGE },
];

const PROPERTY_TYPE_ITEMS = [
  { label: 'آپارتمان', value: 'آپارتمان' },
  { label: 'ویلایی', value: 'ویلایی' },
  { label: 'زمین', value: 'زمین' },
  { label: 'تجاری', value: 'تجاری' },
  { label: 'دفتر کار', value: 'دفتر کار' },
];

const PRICE_FIELDS: Record<string, ('totalPrice' | 'pricePerMeter' | 'deposit' | 'rent')[]> = {
  [RealEstateCategory.SALE]: ['totalPrice', 'pricePerMeter'],
  [RealEstateCategory.RENT]: ['deposit', 'rent'],
  [RealEstateCategory.MORTGAGE]: ['deposit'],
};

const isLand = (subtype: string) => subtype === 'زمین';

interface ListingFormModalProps {
  isOpen: boolean;
  editing?: MyListing | null;
  onClose: () => void;
  onSaved: () => void;
}

const stripCommas = (v: string) => v.replace(/,/g, '');
const numOrUndef = (v: string) => {
  const s = stripCommas(v).trim();
  return s ? Number(s) : undefined;
};
const parseNum = (v: string) => parseFloat(stripCommas(v));
const fmtPrice = (v: string): string => {
  const digits = stripCommas(v).replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('en-US') : '';
};
const fmtRound = (n: number) => Math.round(n).toLocaleString('en-US');

export function ListingFormModal({
  isOpen,
  editing,
  onClose,
  onSaved,
}: ListingFormModalProps) {
  const create = useCreateListing();
  const update = useUpdateListing(editing?.id ?? 0);
  const saving = create.isLoading || update.isLoading;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RealEstateCategory>(RealEstateCategory.SALE);
  const [propertyType, setPropertyType] = useState<string>('آپارتمان');
  const [totalPrice, setTotalPrice] = useState('');
  const [pricePerMeter, setPricePerMeter] = useState('');
  const [deposit, setDeposit] = useState('');
  const [rent, setRent] = useState('');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [floor, setFloor] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Tracks which price field was last derived (not manually edited) so we
  // can show a visual hint.
  const [derived, setDerived] = useState<'totalPrice' | 'pricePerMeter' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(editing?.title ?? '');
      setCategory(editing?.category ?? RealEstateCategory.SALE);
      setPropertyType(
        (editing?.attributes?.propertySubtype as string) ?? 'آپارتمان',
      );
      setTotalPrice(editing?.totalPrice ? fmtPrice(String(editing.totalPrice)) : '');
      setPricePerMeter(editing?.pricePerMeter ? fmtPrice(String(editing.pricePerMeter)) : '');
      setDeposit(editing?.deposit ? fmtPrice(String(editing.deposit)) : '');
      setRent(editing?.rent ? fmtPrice(String(editing.rent)) : '');
      setArea(editing?.area?.toString() ?? '');
      setRooms(editing?.rooms?.toString() ?? '');
      setYearBuilt(editing?.yearBuilt?.toString() ?? '');
      setFloor(editing?.floor?.toString() ?? '');
      setCity(editing?.city ?? null);
      setDistrict(editing?.district ?? '');
      setDescription(editing?.description ?? '');
      setImages(editing?.images ?? []);
      setDerived(null);
    }
  }, [isOpen, editing]);

  const onCategoryChange = (next: RealEstateCategory) => {
    setCategory(next);
    const allowed = PRICE_FIELDS[next] ?? [];
    if (!allowed.includes('totalPrice')) setTotalPrice('');
    if (!allowed.includes('pricePerMeter')) setPricePerMeter('');
    if (!allowed.includes('deposit')) setDeposit('');
    if (!allowed.includes('rent')) setRent('');
    setDerived(null);
  };

  // Auto-calculation handlers
  const handleAreaChange = (v: string) => {
    setArea(v);
    const a = parseFloat(v);
    const ppm = parseNum(pricePerMeter);
    if (a > 0 && ppm > 0) {
      setTotalPrice(fmtRound(a * ppm));
      setDerived('totalPrice');
    } else if (a > 0 && parseNum(totalPrice) > 0) {
      setPricePerMeter(fmtRound(parseNum(totalPrice) / a));
      setDerived('pricePerMeter');
    }
  };

  const handlePricePerMeterChange = (v: string) => {
    setPricePerMeter(fmtPrice(v));
    setDerived(null);
    const ppm = parseNum(v);
    const a = parseFloat(area);
    if (ppm > 0 && a > 0) {
      setTotalPrice(fmtRound(a * ppm));
      setDerived('totalPrice');
    }
  };

  const handleTotalPriceChange = (v: string) => {
    setTotalPrice(fmtPrice(v));
    setDerived(null);
    const tp = parseNum(v);
    const a = parseFloat(area);
    if (tp > 0 && a > 0) {
      setPricePerMeter(fmtRound(tp / a));
      setDerived('pricePerMeter');
    }
  };

  const priceFields = PRICE_FIELDS[category] ?? [];
  const land = isLand(propertyType);
  const showPriceCalc = priceFields.includes('totalPrice') && priceFields.includes('pricePerMeter');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const dto: ListingFormDto = {
      title: title.trim(),
      category,
      totalPrice: priceFields.includes('totalPrice') ? numOrUndef(totalPrice) : undefined,
      pricePerMeter: priceFields.includes('pricePerMeter') ? numOrUndef(pricePerMeter) : undefined,
      deposit: priceFields.includes('deposit') ? numOrUndef(deposit) : undefined,
      rent: priceFields.includes('rent') ? numOrUndef(rent) : undefined,
      area: numOrUndef(area),
      rooms: land ? undefined : numOrUndef(rooms),
      yearBuilt: land ? undefined : numOrUndef(yearBuilt),
      floor: land ? undefined : numOrUndef(floor),
      province: FIXED_PROVINCE,
      cityId: city?.id,
      district: district || undefined,
      description: description || undefined,
      images,
      attributes: { ...(editing?.attributes ?? {}), propertySubtype: propertyType },
    };
    try {
      if (editing) await update.submit(dto);
      else await create.submit(dto);
      toast.success(editing ? 'آگهی ویرایش شد' : 'آگهی ثبت شد و در انتظار تأیید است');
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as ApiError).message || 'ثبت آگهی ناموفق بود');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="lg:w-[34rem] flex flex-col">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 flex-shrink-0">
          <h2 className="font-bold text-slate-700">
            {editing ? 'ویرایش آگهی' : 'ثبت آگهی جدید'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <IconX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4 space-y-3">
          <Input label="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium mb-2 block text-slate-700">نوع معامله</label>
              <Dropdown<RealEstateCategory>
                items={CATEGORY_ITEMS}
                value={category}
                onChange={(v) => { if (v) onCategoryChange(v); }}
                variant="outline"
              />
            </div>
            <div>
              <label className="font-medium mb-2 block text-slate-700">نوع ملک</label>
              <Dropdown<string>
                items={PROPERTY_TYPE_ITEMS}
                value={propertyType}
                onChange={(v) => { if (v) setPropertyType(v); }}
                variant="outline"
              />
            </div>
          </div>

          {/* Financial fields */}
          <div className="grid grid-cols-2 gap-3">
            {priceFields.includes('deposit') && (
              <Input label="ودیعه (تومان)" inputMode="numeric" value={deposit} onChange={(e) => setDeposit(fmtPrice(e.target.value))} />
            )}
            {priceFields.includes('rent') && (
              <Input label="اجاره ماهیانه (تومان)" inputMode="numeric" value={rent} onChange={(e) => setRent(fmtPrice(e.target.value))} />
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="متراژ (متر مربع)"
                type="number"
                min="0"
                value={area}
                onChange={(e) => showPriceCalc ? handleAreaChange(e.target.value) : setArea(e.target.value)}
              />
            </div>
            {!land && (
              <Input label="تعداد خواب" type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} />
            )}
            {!land && (
              <Input label="سال ساخت" type="number" min="1300" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
            )}
            {!land && (
              <Input label="طبقه" type="number" min="0" value={floor} onChange={(e) => setFloor(e.target.value)} />
            )}
          </div>

          {/* Sale price trio — area × pricePerMeter = totalPrice */}
          {showPriceCalc && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Input
                    label="قیمت هر متر (تومان)"
                    inputMode="numeric"
                    value={pricePerMeter}
                    onChange={(e) => handlePricePerMeterChange(e.target.value)}
                  />
                  {derived === 'pricePerMeter' && (
                    <p className="mt-1 text-xs text-blue-500">محاسبه خودکار</p>
                  )}
                </div>
                <div>
                  <Input
                    label="قیمت کل (تومان)"
                    inputMode="numeric"
                    value={totalPrice}
                    onChange={(e) => handleTotalPriceChange(e.target.value)}
                  />
                  {derived === 'totalPrice' && (
                    <p className="mt-1 text-xs text-blue-500">محاسبه خودکار</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="استان" value={FIXED_PROVINCE} disabled />
            <CitySelect value={city} onChange={setCity} />
            <Input label="محله" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>

          <Input label="توضیحات" textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <ImageUploader label="تصاویر ملک" value={images} onChange={setImages} previewClassName="h-24 w-24" />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {editing ? 'ذخیره' : 'ثبت آگهی'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
