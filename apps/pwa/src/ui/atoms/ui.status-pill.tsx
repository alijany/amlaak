import { cn } from '@/libs/style/style.util.helpers';

/** Color triple for a {@link StatusPill}. */
export type StatusTone = { bg: string; text: string; dot: string };

/** Shared tone presets so status badges look consistent across domains. */
export const StatusTones = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
} satisfies Record<string, StatusTone>;

/** Small, reusable status badge (dot + label). */
export function StatusPill({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-end gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone.bg,
        tone.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
      {label}
    </span>
  );
}
