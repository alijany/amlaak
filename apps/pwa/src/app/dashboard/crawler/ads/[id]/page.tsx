'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
import { CitySelect } from '@/libs/city/city.component.select';
import { City } from '@/libs/city/city.types';
import { trackingCode } from '@/libs/lead/lead.util.tracking';
import { QuickLeadModal } from '@/app/dashboard/listings/listings.component.lead-modal';
import { useLeads } from '@/app/dashboard/leads/leads.api';
import { LeadRow } from '@/app/dashboard/leads/leads.component.list';
import { ImageUploader } from '@/components/upload/upload.component.image';
import { Button, JsonViewer, Modal } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { toast } from 'react-toastify';
import { PublishStatusPill } from '../../crawler.component.status-pill';
import {
  IconArrowRight,
  IconBrandTelegram,
  IconBuildingEstate,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconMapPin,
  IconPhoto,
  IconPhone,
  IconRefresh,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { Advertisement, PublishStatus, RealEstateCategory } from '../../crawler.types';
import {
  UpdateAdvertisementDto,
  useAdvertisement,
  useApproveListing,
  useRejectListing,
  useResendTelegram,
  useUpdateAdvertisement,
} from './crawler.ads.detail.api';

const CATEGORY_LABEL: Record<RealEstateCategory, string> = {
  [RealEstateCategory.SALE]: 'فروش',
  [RealEstateCategory.RENT]: 'رهن و اجاره',
  [RealEstateCategory.MORTGAGE]: 'رهن کامل',
  [RealEstateCategory.UNKNOWN]: 'نامشخص',
};

function formatPrice(value?: number): string | undefined {
  if (value == null) return undefined;
  return `${value.toLocaleString('fa-IR')} تومان`;
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50';

// ── Admin edit form ───────────────────────────────────────────────────────────

function ImageManagerModal({
  images,
  onChange,
  isOpen,
  onClose,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100" dir="rtl">
        <h2 className="font-bold text-slate-700">مدیریت تصاویر</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <IconX size={18} />
        </button>
      </div>
      <div className="p-5 overflow-y-auto max-h-[70vh]" dir="rtl">
        <ImageUploader
          value={images}
          onChange={onChange}
          previewClassName="h-28 w-28"
        />
      </div>
      <div className="px-5 pb-5 flex justify-end" dir="rtl">
        <Button size="sm" onClick={onClose}>بستن</Button>
      </div>
    </Modal>
  );
}

function EditInfoForm({ ad, onSaved }: { ad: Advertisement; onSaved: () => void }) {
  const { submit, isLoading } = useUpdateAdvertisement(ad.id);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [form, setForm] = useState<UpdateAdvertisementDto>({
    title: ad.title ?? '',
    description: ad.description ?? '',
    category: ad.category,
    totalPrice: ad.totalPrice,
    deposit: ad.deposit,
    rent: ad.rent,
    pricePerMeter: ad.pricePerMeter,
    area: ad.area,
    rooms: ad.rooms,
    yearBuilt: ad.yearBuilt,
    floor: ad.floor,
    province: ad.province ?? '',
    cityId: ad.city?.id,
    district: ad.district ?? '',
    sourceUrl: ad.sourceUrl ?? '',
    images: ad.images ?? [],
    attributes: ad.attributes ?? {},
  });
  const [city, setCity] = useState<City | null>(ad.city ?? null);

  const set = <K extends keyof UpdateAdvertisementDto>(key: K, value: UpdateAdvertisementDto[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const numField = (key: keyof UpdateAdvertisementDto, label: string) => (
    <Field label={label}>
      <input
        type="number"
        className={inputCls}
        value={(form[key] as number | undefined) ?? ''}
        onChange={(e) =>
          set(key, (e.target.value === '' ? undefined : Number(e.target.value)) as UpdateAdvertisementDto[typeof key])
        }
      />
    </Field>
  );

  const strField = (key: keyof UpdateAdvertisementDto, label: string, placeholder?: string) => (
    <Field label={label}>
      <input
        type="text"
        className={inputCls}
        placeholder={placeholder}
        value={(form[key] as string | undefined) ?? ''}
        onChange={(e) => set(key, e.target.value as UpdateAdvertisementDto[typeof key])}
      />
    </Field>
  );


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean: UpdateAdvertisementDto = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '' && v !== undefined),
    );
    // keep empty arrays (user cleared all images intentionally)
    if (Array.isArray(form.images)) clean.images = form.images.filter(Boolean);
    // send cityId explicitly so clearing the city persists (null clears the FK)
    clean.cityId = city?.id ?? undefined;
    try {
      await submit(clean);
      toast.success('اطلاعات آگهی به‌روز شد');
      onSaved();
    } catch (err) {
      toast.error((err as ApiError).message || 'ذخیره‌سازی ناموفق بود');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6" dir="rtl">

      {/* Identity */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">اطلاعات اصلی</h3>
        {strField('title', 'عنوان')}
        <Field label="دسته‌بندی">
          <select
            className={inputCls}
            value={form.category ?? ''}
            onChange={(e) => {
              const cat = e.target.value as RealEstateCategory;
              setForm((f) => ({
                ...f,
                category: cat,
                totalPrice: (cat === RealEstateCategory.SALE || cat === RealEstateCategory.UNKNOWN) ? f.totalPrice : undefined,
                pricePerMeter: (cat === RealEstateCategory.SALE || cat === RealEstateCategory.UNKNOWN) ? f.pricePerMeter : undefined,
                deposit: (cat === RealEstateCategory.RENT || cat === RealEstateCategory.MORTGAGE || cat === RealEstateCategory.UNKNOWN) ? f.deposit : undefined,
                rent: (cat === RealEstateCategory.RENT || cat === RealEstateCategory.UNKNOWN) ? f.rent : undefined,
              }));
            }}
          >
            {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        {strField('sourceUrl', 'لینک آگهی اصلی', 'https://...')}
      </section>

      {/* Location */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">موقعیت</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {strField('province', 'استان')}
          <Field label="شهر">
            <CitySelect
              label=""
              value={city}
              onChange={(c) => {
                setCity(c);
                set('cityId', c?.id);
              }}
            />
          </Field>
          {strField('district', 'منطقه / محله')}
        </div>
      </section>

      {/* Specs */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">مشخصات</h3>
        <div className="grid grid-cols-2 gap-3">
          {numField('area', 'متراژ (م²)')}
          {numField('rooms', 'تعداد اتاق')}
          {numField('floor', 'طبقه')}
          {numField('yearBuilt', 'سال ساخت')}
        </div>
      </section>

      {/* Pricing — fields depend on category */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">قیمت‌گذاری (تومان)</h3>
        <div className="grid grid-cols-2 gap-3">
          {(form.category === RealEstateCategory.SALE || form.category === RealEstateCategory.UNKNOWN) && (
            <>{numField('totalPrice', 'قیمت کل')}{numField('pricePerMeter', 'قیمت هر متر')}</>
          )}
          {(form.category === RealEstateCategory.RENT || form.category === RealEstateCategory.MORTGAGE || form.category === RealEstateCategory.UNKNOWN) && (
            numField('deposit', 'ودیعه')
          )}
          {(form.category === RealEstateCategory.RENT || form.category === RealEstateCategory.UNKNOWN) && (
            numField('rent', 'اجاره ماهیانه')
          )}
        </div>
      </section>

      {/* Description */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">توضیحات</h3>
        <textarea
          className={`${inputCls} min-h-[120px] resize-y`}
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
        />
      </section>

      {/* Images */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">تصاویر</h3>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-1.5 transition-colors"
          >
            <IconPhoto size={14} />
            مدیریت تصاویر
          </button>
        </div>
        {(form.images ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(form.images ?? []).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-slate-400">تصویری ثبت نشده</p>
        )}
        <ImageManagerModal
          images={form.images ?? []}
          onChange={(urls) => set('images', urls)}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
        />
      </section>

      {/* Attributes JSON */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">ویژگی‌های اضافه (JSON)</h3>
        <textarea
          className={`${inputCls} min-h-[120px] resize-y font-mono text-[12px]`}
          dir="ltr"
          value={JSON.stringify(form.attributes ?? {}, null, 2)}
          onChange={(e) => {
            try {
              set('attributes', JSON.parse(e.target.value));
            } catch {
              // keep typing; don't update until valid
            }
          }}
        />
      </section>

      <div className="flex justify-stretch sm:justify-end">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  );
}

// ── Structured read-only view ─────────────────────────────────────────────────

function ImageGallery({ images, title }: { images: string[]; title?: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-100 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[idx]} alt={title ?? ''} className="w-full h-40 sm:h-52 md:h-64 object-cover" loading="lazy" />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 disabled:opacity-0 text-white rounded-full p-1.5 hover:bg-black/60 transition-opacity"
          >
            <IconChevronRight size={18} />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
            disabled={idx === images.length - 1}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 disabled:opacity-0 text-white rounded-full p-1.5 hover:bg-black/60 transition-opacity"
          >
            <IconChevronLeft size={18} />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
          <span className="absolute top-3 left-3 bg-black/40 text-white text-[11px] px-2 py-0.5 rounded-full">
            {(idx + 1).toLocaleString('fa-IR')} / {images.length.toLocaleString('fa-IR')}
          </span>
        </>
      )}
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
      <div className="font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}

function StructuredView({ ad }: { ad: Advertisement }) {
  const attrs = ad.attributes ?? {};
  const amenities = Array.isArray(attrs.amenities) ? (attrs.amenities as string[]) : [];
  const phone = typeof attrs.phone === 'string' ? attrs.phone : undefined;
  const landArea = typeof attrs.landArea === 'string' ? attrs.landArea : undefined;
  const buildingAge = typeof attrs.buildingAge === 'string' ? attrs.buildingAge : undefined;
  const documentType = typeof attrs.documentType === 'string' ? attrs.documentType : undefined;
  const street = typeof attrs.street === 'string' ? attrs.street : undefined;
  const isAgency = attrs.isAgency === true;
  const agencyName = typeof attrs.agencyName === 'string' ? attrs.agencyName : undefined;
  const agencyProfileUrl = typeof attrs.agencyProfileUrl === 'string' ? attrs.agencyProfileUrl : undefined;

  const specs: { label: string; value: string | number }[] = [
    ...(ad.area != null ? [{ label: 'متراژ', value: `${ad.area.toLocaleString('fa-IR')} م²` }] : []),
    ...(ad.rooms != null ? [{ label: 'اتاق', value: ad.rooms.toLocaleString('fa-IR') }] : []),
    ...(ad.yearBuilt != null ? [{ label: 'سال ساخت', value: ad.yearBuilt.toLocaleString('fa-IR') }] : []),
    ...(ad.floor != null ? [{ label: 'طبقه', value: ad.floor.toLocaleString('fa-IR') }] : []),
    ...(landArea ? [{ label: 'متراژ زمین', value: landArea }] : []),
    ...(buildingAge ? [{ label: 'عمر بنا', value: buildingAge }] : []),
  ];

  const extraAttrs: { label: string; value: string }[] = [
    ...(documentType ? [{ label: 'وضعیت سند', value: documentType }] : []),
    ...(typeof attrs.cabinetCondition === 'string' ? [{ label: 'کابینت', value: attrs.cabinetCondition }] : []),
    ...(typeof attrs.floorCondition === 'string' ? [{ label: 'کف', value: attrs.floorCondition }] : []),
    ...(typeof attrs.facadeCondition === 'string' ? [{ label: 'نما', value: attrs.facadeCondition }] : []),
  ];

  const hasPrices = ad.totalPrice != null || ad.pricePerMeter != null || ad.deposit != null || ad.rent != null;

  return (
    <div className="space-y-5">
      <ImageGallery images={ad.images ?? []} title={ad.title} />

      {(ad.province || ad.city || ad.district || street) && (
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <IconMapPin size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            {[ad.province, ad.city?.nameFa, ad.district].filter(Boolean).join(' · ')}
            {street && <span className="text-slate-400"> · {street}</span>}
          </span>
        </div>
      )}

      {isAgency && agencyName && (
        <a
          href={agencyProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-sm">
            {agencyName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-700 text-sm truncate">{agencyName}</div>
            <div className="text-[11px] text-amber-700">آژانس املاک</div>
          </div>
          <IconExternalLink size={14} className="text-amber-400 mr-auto flex-shrink-0" />
        </a>
      )}

      {phone && (
        <a href={`tel:${phone}`} className="flex items-center gap-2.5 rounded-xl bg-green-50 px-4 py-3 hover:bg-green-100 transition-colors">
          <IconPhone size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-green-700 tracking-wide dir-ltr">{phone}</span>
        </a>
      )}

      {hasPrices && (
        <div className="rounded-xl bg-slate-50 p-4 space-y-2.5">
          {ad.totalPrice != null && <PriceRow label="قیمت کل" value={formatPrice(ad.totalPrice)!} />}
          {ad.pricePerMeter != null && <PriceRow label="قیمت هر متر" value={formatPrice(ad.pricePerMeter)!} />}
          {ad.deposit != null && <PriceRow label="ودیعه" value={formatPrice(ad.deposit)!} />}
          {ad.rent != null && <PriceRow label="اجاره ماهیانه" value={formatPrice(ad.rent)!} />}
        </div>
      )}

      {specs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {specs.map((s) => <SpecCell key={s.label} label={s.label} value={s.value} />)}
        </div>
      )}

      {extraAttrs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {extraAttrs.map((a) => (
            <div key={a.label} className="rounded-xl bg-slate-50 px-3 py-2.5 flex justify-between items-center text-sm">
              <span className="text-slate-500">{a.label}</span>
              <span className="font-medium text-slate-700">{a.value}</span>
            </div>
          ))}
        </div>
      )}

      {amenities.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">ویژگی‌ها و امکانات</div>
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span key={a} className="text-[12px] bg-blue-50 text-blue-700 rounded-full px-3 py-1">{a}</span>
            ))}
          </div>
        </div>
      )}

      {ad.description && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">توضیحات</div>
          <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-slate-500">کد رهگیری: {trackingCode(ad.id)}</span>
          {ad.crawledAt && (
            <span>گردآوری:{' '}{new Date(ad.crawledAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          )}
          {ad.postedAt && (
            <span>انتشار:{' '}{new Date(ad.postedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          )}
        </div>
        {ad.sourceUrl && (
          <a href={ad.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 hover:underline flex-shrink-0">
            <IconExternalLink size={13} />
            مشاهده آگهی اصلی
          </a>
        )}
      </div>
    </div>
  );
}

// ── Debug / raw view ──────────────────────────────────────────────────────────

function DebugView({ ad }: { ad: Advertisement }) {
  return (
    <div className="space-y-4" dir="ltr">
      <JsonViewer data={ad.attributes} title="attributes" />
      <JsonViewer data={ad.rawPayload} title="rawPayload" />
    </div>
  );
}

// ── Leads tab ─────────────────────────────────────────────────────────────────

function LeadsTab({ advertisementId }: { advertisementId: number }) {
  const { data, error, isLoading, refresh } = useLeads({ advertisementId, limit: 50 });
  return (
    <div className="space-y-2 mx-auto">
      <DataView
        data={data}
        error={error}
        isLoading={isLoading}
        isEmpty={(d) => !d?.items.length}
        emptyMessage="هنوز مشتریی برای این آگهی ثبت نشده است."
        onRetry={refresh}
        className="space-y-2"
      >
        {data?.items?.map((lead) => <LeadRow key={lead.id} lead={lead} />)}
      </DataView>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'info' | 'leads' | 'debug';

function ModerationBar({ ad, refresh }: { ad: Advertisement; refresh: () => void }) {
  const { hasAnyRole } = useAuth();
  const canModerate = hasAnyRole([Role.ADMIN, Role.MANAGER, Role.OWNER]);

  const [leadOpen, setLeadOpen] = useState(false);
  const { submit: approve, isLoading: approving } = useApproveListing(ad.id);
  const { submit: reject, isLoading: rejecting } = useRejectListing(ad.id);
  const { submit: resend, isLoading: resending } = useResendTelegram(ad.id);

  const onApprove = async () => {
    try {
      await approve();
      toast.success('آگهی منتشر شد و به تلگرام ارسال شد');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'انتشار ناموفق بود');
    }
  };

  const onReject = async () => {
    try {
      await reject();
      toast.success('آگهی رد شد');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'عملیات ناموفق بود');
    }
  };

  const onResend = async () => {
    try {
      await resend();
      toast.success('پیام تلگرام مجدداً ارسال شد');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'ارسال مجدد ناموفق بود');
    }
  };

  return (
    <>
      {/* ── Publish status + actions ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 mb-2.5 sm:mb-3 flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <span>وضعیت انتشار:</span>
          <PublishStatusPill status={ad.publishStatus} />
          {ad.sourceUrl && (
            <a
              href={ad.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 rounded-full px-2.5 py-0.5 transition-colors"
            >
              <IconExternalLink size={12} />
              مشاهده در دیوار
            </a>
          )}
        </div>
        {canModerate && (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={() => setLeadOpen(true)}>
              <IconUserPlus size={15} className="ml-1" />
              افزودن مشتری
            </Button>
            {ad.publishStatus !== PublishStatus.PUBLISHED && (
              <Button size="sm" className="flex-1 md:flex-none" onClick={onApprove} disabled={approving}>
                تأیید و انتشار
              </Button>
            )}
            {ad.publishStatus !== PublishStatus.REJECTED && (
              <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={onReject} disabled={rejecting}>
                رد
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Telegram status card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 mb-2.5 sm:mb-3 flex items-center justify-between gap-3" dir="rtl">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ad.telegramPostedAt ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
            <IconBrandTelegram size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">تلگرام</div>
            {ad.telegramPostedAt ? (
              <div className="text-[11px] text-emerald-600">
                ارسال‌شده ·{' '}
                {new Date(ad.telegramPostedAt).toLocaleDateString('fa-IR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
                {ad.telegramMessageId && (
                  <span className="text-slate-400 font-mono mr-1">#{ad.telegramMessageId}</span>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                {ad.publishStatus === PublishStatus.PUBLISHED ? 'ارسال نشده' : 'در انتظار انتشار'}
              </div>
            )}
          </div>
        </div>
        {canModerate && ad.publishStatus === PublishStatus.PUBLISHED && (
          <button
            onClick={onResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-[12px] font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <IconRefresh size={14} className={resending ? 'animate-spin' : ''} />
            {resending ? 'در حال ارسال…' : 'ارسال مجدد'}
          </button>
        )}
      </div>

      <QuickLeadModal
        advertisementId={ad.id}
        listingTitle={ad.title ?? undefined}
        adAgency={ad.agency}
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
      />
    </>
  );
}

function AdDetailContent({ id }: { id: number }) {
  const { data: ad, error, isLoading, refresh } = useAdvertisement(id);
  const [tab, setTab] = useState<Tab>('info');
  const { hasRole } = useAuth();
  const isAdmin = hasRole(Role.ADMIN);

  return (
    <div className="flex flex-col grow overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-4 mb-2.5 sm:mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/dashboard/crawler/ads"
            aria-label="بازگشت"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm flex-shrink-0 transition-colors"
          >
            <IconArrowRight size={18} />
            <span className="hidden sm:inline">بازگشت</span>
          </Link>
          <div className="w-px h-5 bg-slate-200 flex-shrink-0 hidden sm:block" />
          {ad && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-slate-700 truncate text-sm sm:text-base leading-tight">
                {ad.title ?? 'آگهی بدون عنوان'}
              </h1>
              {/* chips — single scrollable row, no wrapping (keeps header short) */}
              <div className="flex items-center gap-1.5 mt-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="flex-shrink-0 whitespace-nowrap inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {CATEGORY_LABEL[ad.category]}
                </span>
                <span className="flex-shrink-0 whitespace-nowrap font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 tracking-wide">
                  {trackingCode(ad.id)}
                </span>
                {typeof ad.attributes?.propertySubtype === 'string' && (
                  <span className="flex-shrink-0 whitespace-nowrap text-[11px] text-slate-500 bg-blue-50 rounded-full px-2 py-0.5">
                    {ad.attributes.propertySubtype}
                  </span>
                )}
                {ad.target?.name && (
                  <span className="flex-shrink-0 whitespace-nowrap text-[11px] text-slate-400">{ad.target.name}</span>
                )}
              </div>
            </div>
          )}
          {isLoading && !ad && (
            <div className="h-5 w-48 bg-slate-100 rounded-lg animate-pulse" />
          )}
        </div>

        {/* Tab switcher — full-width segmented control on mobile */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 sm:p-1 w-full md:w-auto flex-shrink-0">
          {([
            { id: 'info', label: 'اطلاعات ملک', icon: <IconBuildingEstate size={14} /> },
            { id: 'leads', label: 'مشتری‌ها', icon: <IconUserPlus size={14} /> },
            { id: 'debug', label: 'داده‌های خام', icon: <span className="font-mono text-[11px]">{'{}'}</span> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(({ id: t, label, icon }) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex flex-1 md:flex-none items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                tab === t ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {icon}
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>


      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="grow overflow-auto">
        {ad && <ModerationBar ad={ad} refresh={refresh} />}
        <DataView
          data={ad}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d}
          emptyMessage="آگهی یافت نشد."
          onRetry={refresh}
        >
          {ad && (
            <div>
              {tab === 'info' && (
                isAdmin
                  ? <EditInfoForm ad={ad} onSaved={refresh} />
                  : <StructuredView ad={ad} />
              )}
              {tab === 'leads' && <LeadsTab advertisementId={ad.id} />}
              {tab === 'debug' && <DebugView ad={ad} />}
            </div>
          )}
        </DataView>
      </div>
    </div>
  );
}

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numId = Number(id);

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.crawlerAds.roles}>
      <DashbaordLayout>
        <AdDetailContent id={numId} />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
