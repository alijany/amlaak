'use client';

import { ApiError } from '@/libs/api/api.types.error';
import { uploadFileFetcher } from '@/libs/api/api.util.fetcher';
import { cn } from '@/libs/style/style.util.helpers';
import { FilePicker } from '@/ui/atoms';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface ImageUploaderProps {
  /** Current image URLs (single = array of 0–1). */
  value: string[];
  onChange: (urls: string[]) => void;
  /** 0 = unlimited; 1 = single image. */
  max?: number;
  label?: string;
  /** Tailwind size for each preview tile (e.g. 'h-24 w-24', 'h-28 w-full'). */
  previewClassName?: string;
}

/** Image upload via the shared S3 storage endpoint. Returns public URLs. */
export function ImageUploader({
  value,
  onChange,
  max = 0,
  label,
  previewClassName = 'h-24 w-24',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const reached = max > 0 && value.length >= max;

  const handleFiles = async (files: FileList) => {
    const remaining = max > 0 ? Math.max(0, max - value.length) : files.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const res = await uploadFileFetcher<{ url: string }>(
          '/storage/uploads',
          file,
        );
        if (res?.url) urls.push(res.url);
      }
      onChange(max === 1 ? urls.slice(0, 1) : [...value, ...urls]);
    } catch (e) {
      toast.error((e as ApiError).message || 'آپلود تصویر ناموفق بود');
    } finally {
      setUploading(false);
    }
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div className="space-y-2">
      {label && <label className="font-medium block text-slate-700">{label}</label>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div
              key={url}
              className={cn(
                'relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50',
                previewClassName,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 left-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                aria-label="حذف تصویر"
              >
                <IconX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!reached && (
        <FilePicker
          accept="image/*"
          multiple={max !== 1}
          disabled={uploading}
          label={uploading ? 'در حال آپلود…' : 'انتخاب تصویر'}
          description={
            uploading ? 'لطفاً صبر کنید…' : 'تصویر را اینجا رها کنید یا برای انتخاب کلیک کنید'
          }
          onFilesSelected={handleFiles}
        />
      )}
    </div>
  );
}
