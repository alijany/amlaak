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

const CATEGORY_ITEMS = [
  { label: 'فروش', value: RealEstateCategory.SALE },
  { label: 'رهن و اجاره', value: RealEstateCategory.RENT },
  { label: 'رهن کامل', value: RealEstateCategory.MORTGAGE },
];

/** Property type stored in `attributes.propertySubtype` (value === display label). */
const PROPERTY_TYPE_ITEMS = [
  { label: 'آپارتمان', value: 'آپارتمان' },
  { label: 'ویلایی', value: 'ویلایی' },
  { label: 'زمین', value: 'زمین' },
  { label: 'تجاری', value: 'تجاری' },
  { label: 'دفتر کار', value: 'دفتر کار' },
];

/** Which financial fields make sense for each deal type. */
const PRICE_FIELDS: Record<string, ('totalPrice' | 'pricePerMeter' | 'deposit' | 'rent')[]> = {
  [RealEstateCategory.SALE]: ['totalPrice', 'pricePerMeter'],
  [RealEstateCategory.RENT]: ['deposit', 'rent'],
  [RealEstateCategory.MORTGAGE]: ['deposit'],
};

/** Land has no rooms/floor; everything else is a building. */
const isLand = (subtype: string) => subtype === 'زمین';

interface ListingFormModalProps {
  isOpen: boolean;
  editing?: MyListing | null;
  onClose: () => void;
  onSaved: () => void;
}

const numOrUndef = (v: string) => (v.trim() ? Number(v) : undefined);

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
  const [province, setProvince] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTitle(editing?.title ?? '');
      setCategory(editing?.category ?? RealEstateCategory.SALE);
      setPropertyType(
        (editing?.attributes?.propertySubtype as string) ?? 'آپارتمان',
      );
      setTotalPrice(editing?.totalPrice?.toString() ?? '');
      setPricePerMeter(editing?.pricePerMeter?.toString() ?? '');
      setDeposit(editing?.deposit?.toString() ?? '');
      setRent(editing?.rent?.toString() ?? '');
      setArea(editing?.area?.toString() ?? '');
      setRooms(editing?.rooms?.toString() ?? '');
      setYearBuilt(editing?.yearBuilt?.toString() ?? '');
      setFloor(editing?.floor?.toString() ?? '');
      setProvince(editing?.province ?? '');
      setCity(editing?.city ?? null);
      setDistrict(editing?.district ?? '');
      setDescription(editing?.description ?? '');
      setImages(editing?.images ?? []);
    }
  }, [isOpen, editing]);

  // When the deal type changes, clear financial fields that no longer apply so
  // stale values aren't submitted.
  const onCategoryChange = (next: RealEstateCategory) => {
    setCategory(next);
    const allowed = PRICE_FIELDS[next] ?? [];
    if (!allowed.includes('totalPrice')) setTotalPrice('');
    if (!allowed.includes('pricePerMeter')) setPricePerMeter('');
    if (!allowed.includes('deposit')) setDeposit('');
    if (!allowed.includes('rent')) setRent('');
  };

  const priceFields = PRICE_FIELDS[category] ?? [];
  const land = isLand(propertyType);

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
      province: province || undefined,
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
                onChange={(v) => {
                  if (v) onCategoryChange(v);
                }}
                variant="outline"
              />
            </div>
            <div>
              <label className="font-medium mb-2 block text-slate-700">نوع ملک</label>
              <Dropdown<string>
                items={PROPERTY_TYPE_ITEMS}
                value={propertyType}
                onChange={(v) => {
                  if (v) setPropertyType(v);
                }}
                variant="outline"
              />
            </div>
          </div>

          {/* Financial fields — depend on the deal type */}
          <div className="grid grid-cols-2 gap-3">
            {priceFields.includes('totalPrice') && (
              <Input label="قیمت کل (تومان)" type="number" min="0" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
            )}
            {priceFields.includes('pricePerMeter') && (
              <Input label="قیمت هر متر (تومان)" type="number" min="0" value={pricePerMeter} onChange={(e) => setPricePerMeter(e.target.value)} />
            )}
            {priceFields.includes('deposit') && (
              <Input label="ودیعه (تومان)" type="number" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
            )}
            {priceFields.includes('rent') && (
              <Input label="اجاره ماهیانه (تومان)" type="number" min="0" value={rent} onChange={(e) => setRent(e.target.value)} />
            )}
          </div>

          {/* Specs — depend on the property type */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="متراژ" type="number" min="0" value={area} onChange={(e) => setArea(e.target.value)} />
            {!land && (
              <Input label="تعداد خواب" type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} />
            )}
            {!land && (
              <Input label="سال ساخت" type="number" min="1300" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
            )}
            {!land && (
              <Input label="طبقه" type="number" min="0" value={floor} onChange={(e) => setFloor(e.target.value)} />
            )}
            <Input label="استان" value={province} onChange={(e) => setProvince(e.target.value)} />
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
