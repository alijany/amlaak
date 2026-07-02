'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useId, useState } from 'react';
import { Descendant } from 'slate';
import { FilePicker } from '@/ui/atoms/ui.file-picker';
import { uploadFileFetcher } from '@/libs/api/api.util.fetcher';
import { parseSlateValue } from '@/ui/molecules/slate-editor/slate.utils';
import '@/ui/molecules/slate-editor/slate.types';
import { useBlogCategories } from './blog.api';
import { BlogPost, BlogPostStatus, CreatePostDto } from './blog.types';

const SlateEditor = dynamic(
  () => import('@/ui/molecules/slate-editor/ui.slate-editor').then((m) => m.SlateEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 rounded-xl border border-slate-200 animate-pulse bg-slate-50" />
    ),
  },
);

async function uploadCoverImage(file: File): Promise<string> {
  const result = await uploadFileFetcher<{ url: string }>('/blog/cover-image', file);
  return result.url;
}

interface PostFormProps {
  initialData?: BlogPost;
  onSubmit: (dto: CreatePostDto) => Promise<void>;
  isLoading?: boolean;
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 border-b border-slate-100 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Image upload field ───────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (url: string) => void;
}

function ImageUploadField({ label, id, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadCoverImage(file);
      onChange(url);
    } catch {
      setUploadError('آپلود تصویر با خطا مواجه شد. دوباره تلاش کنید.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label
                htmlFor={id}
                className="px-3 py-1.5 text-xs font-medium bg-white text-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
              >
                تغییر تصویر
              </label>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                پاک کردن
              </button>
            </div>
            <input
              id={id}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </>
        ) : (
          <FilePicker
            accept="image/*"
            multiple={false}
            disabled={uploading}
            label={uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
            description={uploading ? 'لطفاً صبر کنید...' : 'کلیک کنید یا تصویر را بکشید'}
            onFilesSelected={handleFiles}
            className="h-full rounded-none border-0"
          />
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Collapsible SEO section ──────────────────────────────────────────────────

function SeoSection({
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  disabled,
}: {
  metaTitle: string;
  setMetaTitle: (v: string) => void;
  metaDescription: string;
  setMetaDescription: (v: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-400 transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400 dir-rtl';

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <span>تنظیمات سئو</span>
        <span
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 bg-white space-y-4 border-t border-slate-100">
          <div className="pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                عنوان سئو
              </label>
              <input
                dir="rtl"
                disabled={disabled}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputClass}
                placeholder="جایگزین عنوان در موتورهای جستجو (اختیاری)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                توضیحات متا
              </label>
              <textarea
                dir="rtl"
                disabled={disabled}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="توضیحات کوتاه برای موتورهای جستجو"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function BlogPostForm({ initialData, onSubmit, isLoading }: PostFormProps) {
  const uid = useId();
  const { data: categories, isLoading: categoriesLoading } = useBlogCategories();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [body, setBody] = useState<Descendant[]>(
    parseSlateValue(initialData?.body ?? ''),
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? '');
  const [ogImage, setOgImage] = useState(initialData?.ogImage ?? '');
  const [status, setStatus] = useState<BlogPostStatus>(
    initialData?.status ?? BlogPostStatus.DRAFT,
  );
  const [redirectUrl, setRedirectUrl] = useState(initialData?.redirectUrl ?? '');
  const [publishAt, setPublishAt] = useState(
    initialData?.publishAt ? initialData.publishAt.slice(0, 16) : '',
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialData?.categories?.map((c) => c.id) ?? [],
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setBody(parseSlateValue(initialData.body ?? ''));
      setExcerpt(initialData.excerpt ?? '');
      setCoverImage(initialData.coverImage ?? '');
      setMetaTitle(initialData.metaTitle ?? '');
      setMetaDescription(initialData.metaDescription ?? '');
      setOgImage(initialData.ogImage ?? '');
      setStatus(initialData.status);
      setRedirectUrl(initialData.redirectUrl ?? '');
      setPublishAt(initialData.publishAt ? initialData.publishAt.slice(0, 16) : '');
      setSelectedCategoryIds(initialData.categories?.map((c) => c.id) ?? []);
    }
  }, [initialData]);

  const handleCoverImageChange = (url: string) => {
    setCoverImage(url);
    // Auto-fill ogImage if it was empty
    if (!ogImage) setOgImage(url);
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      body: JSON.stringify(body),
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      ogImage: ogImage || undefined,
      status,
      categoryIds: selectedCategoryIds,
      redirectUrl: redirectUrl || undefined,
      publishAt: publishAt || undefined,
    });
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-400 transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400';
  const disabled = !!isLoading;

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4">

      {/* ── Section 1: Content ─────────────────────────────────── */}
      <Section title="محتوا">
        <div>
          <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-slate-700 mb-1">
            عنوان <span className="text-red-500">*</span>
          </label>
          <input
            id={`${uid}-title`}
            required
            dir="rtl"
            disabled={disabled}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="عنوان مطلب را وارد کنید"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            متن مطلب <span className="text-red-500">*</span>
          </label>
          <SlateEditor value={body} onChange={setBody} />
        </div>

        <div>
          <label htmlFor={`${uid}-excerpt`} className="block text-sm font-medium text-slate-700 mb-1">
            خلاصه
          </label>
          <textarea
            id={`${uid}-excerpt`}
            dir="rtl"
            disabled={disabled}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="خلاصه‌ای کوتاه از مطلب (اختیاری)"
          />
        </div>
      </Section>

      {/* ── Section 2: Images ──────────────────────────────────── */}
      <Section title="تصاویر">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ImageUploadField
            id={`${uid}-cover`}
            label="تصویر بند انگشتی"
            value={coverImage}
            onChange={handleCoverImageChange}
          />
          <ImageUploadField
            id={`${uid}-og`}
            label="تصویر Open Graph"
            value={ogImage}
            onChange={setOgImage}
          />
        </div>
      </Section>

      {/* ── Section 3: Categories & Status ────────────────────── */}
      <Section title="دسته‌بندی و وضعیت">
        {/* Status picker */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">وضعیت انتشار</p>
          <div className="flex flex-wrap gap-2">
            {([
              { value: BlogPostStatus.DRAFT,     label: 'پیش‌نویس',    color: 'amber' },
              { value: BlogPostStatus.PUBLISHED,  label: 'منتشر شده',   color: 'green' },
              { value: BlogPostStatus.NOINDEX,    label: 'نوایندکس',    color: 'blue' },
              { value: BlogPostStatus.SCHEDULED,  label: 'زمان‌بندی',   color: 'purple' },
              { value: BlogPostStatus.REDIRECT,   label: 'ریدایرکت',    color: 'orange' },
              { value: BlogPostStatus.GONE,       label: 'حذف شده (410)', color: 'red' },
            ] as const).map(({ value, label, color }) => {
              const active = status === value;
              const colorMap: Record<string, string> = {
                amber:  active ? 'bg-amber-100 text-amber-800 border-amber-300'   : '',
                green:  active ? 'bg-green-100 text-green-800 border-green-300'   : '',
                blue:   active ? 'bg-blue-100 text-blue-800 border-blue-300'     : '',
                purple: active ? 'bg-purple-100 text-purple-800 border-purple-300': '',
                orange: active ? 'bg-orange-100 text-orange-800 border-orange-300': '',
                red:    active ? 'bg-red-100 text-red-800 border-red-300'         : '',
              };
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    active
                      ? colorMap[color]
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Conditional: redirect URL */}
          {status === BlogPostStatus.REDIRECT && (
            <div className="mt-3">
              <label htmlFor={`${uid}-redirect`} className="block text-sm font-medium text-slate-700 mb-1">
                آدرس مقصد ریدایرکت <span className="text-red-500">*</span>
              </label>
              <input
                id={`${uid}-redirect`}
                dir="ltr"
                type="url"
                disabled={disabled}
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className={inputClass}
                placeholder="https://example.com/new-page"
              />
              <p className="mt-1 text-xs text-slate-400">بازدیدکنندگان و موتورهای جستجو به این آدرس هدایت می‌شوند (308)</p>
            </div>
          )}

          {/* Conditional: scheduled date */}
          {status === BlogPostStatus.SCHEDULED && (
            <div className="mt-3">
              <label htmlFor={`${uid}-publish-at`} className="block text-sm font-medium text-slate-700 mb-1">
                تاریخ انتشار <span className="text-red-500">*</span>
              </label>
              <input
                id={`${uid}-publish-at`}
                dir="ltr"
                type="datetime-local"
                disabled={disabled}
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-400">مطلب تا این تاریخ در حالت پیش‌نویس باقی می‌ماند</p>
            </div>
          )}

          {/* Info: gone */}
          {status === BlogPostStatus.GONE && (
            <p className="mt-2 text-xs text-red-500">
              این صفحه با کد ۴۱۰ Gone پاسخ می‌دهد و به موتورهای جستجو اعلام می‌کند محتوا به‌طور دائم حذف شده است.
            </p>
          )}

          {/* Info: noindex */}
          {status === BlogPostStatus.NOINDEX && (
            <p className="mt-2 text-xs text-blue-500">
              صفحه منتشر می‌شود ولی تگ noindex دارد — در نتایج جستجو نمایش داده نمی‌شود.
            </p>
          )}
        </div>

        {/* Categories */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">دسته‌بندی‌ها</p>
          <div className="flex flex-wrap gap-2 min-h-8">
            {categoriesLoading &&
              [1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 rounded-full bg-slate-100 animate-pulse" />
              ))}
            {!categoriesLoading && categories?.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedCategoryIds.includes(cat.id)
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {!categoriesLoading && (!categories || categories.length === 0) && (
              <p className="text-sm text-slate-400">هیچ دسته‌بندی‌ای تعریف نشده است.</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Section 4: SEO (collapsible) ──────────────────────── */}
      <SeoSection
        metaTitle={metaTitle}
        setMetaTitle={setMetaTitle}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        disabled={disabled}
      />

      {/* ── Submit ─────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 px-6 py-4 flex justify-start">
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'در حال ذخیره...' : 'ذخیره مطلب'}
        </button>
      </div>
    </form>
  );
}
