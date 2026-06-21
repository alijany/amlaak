'use client';

import { useState } from 'react';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

function Primitive({ value }: { value: JsonPrimitive }) {
  if (value === null)
    return <span className="text-slate-500 italic font-mono">null</span>;
  if (typeof value === 'boolean')
    return (
      <span className="text-violet-400 font-mono">{String(value)}</span>
    );
  if (typeof value === 'number')
    return <span className="text-sky-400 font-mono">{value}</span>;
  // string — trim very long values
  const display = value.length > 300 ? `${value.slice(0, 300)}…` : value;
  return (
    <span className="text-emerald-400 font-mono">
      &quot;{display}&quot;
    </span>
  );
}

function Node({
  value,
  depth,
}: {
  value: JsonValue;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 2);

  if (value === null || typeof value !== 'object') {
    return <Primitive value={value as JsonPrimitive} />;
  }

  const isArr = Array.isArray(value);
  const entries: [string, JsonValue][] = isArr
    ? (value as JsonValue[]).map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, JsonValue>);

  const [open_, close_] = isArr ? ['[', ']'] : ['{', '}'];

  if (entries.length === 0) {
    return (
      <span className="text-slate-500 font-mono">
        {open_}{close_}
      </span>
    );
  }

  return (
    <span>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-slate-400 hover:text-slate-200 font-mono text-[11px] mr-0.5 select-none"
        title={open ? 'Collapse' : 'Expand'}
      >
        {open ? '▾' : '▸'}
      </button>
      <span className="text-slate-400 font-mono">{open_}</span>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="text-slate-500 hover:text-slate-300 font-mono text-[11px] ml-1"
        >
          {entries.length} {isArr ? 'items' : 'keys'} …
        </button>
      )}

      {open && (
        <>
          <div className="ml-4 border-l border-slate-700 pl-3 mt-0.5 space-y-0.5">
            {entries.map(([key, val], i) => (
              <div key={key} className="flex gap-1.5 items-start">
                {!isArr && (
                  <span className="text-rose-400 font-mono text-[12px] flex-shrink-0 whitespace-nowrap">
                    &quot;{key}&quot;
                    <span className="text-slate-500">:</span>
                  </span>
                )}
                <span className="text-[12px] min-w-0">
                  <Node value={val} depth={depth + 1} />
                  {i < entries.length - 1 && (
                    <span className="text-slate-600">,</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <span className="text-slate-400 font-mono">{close_}</span>
    </span>
  );
}

interface JsonViewerProps {
  data: unknown;
  title?: string;
}

/**
 * Dark-theme collapsible JSON tree viewer.
 * No external dependencies — works with any React version.
 * Nodes at depth < 2 start expanded; deeper nodes start collapsed.
 */
export function JsonViewer({ data, title }: JsonViewerProps) {
  return (
    <div className="rounded-xl bg-slate-900 overflow-auto text-[12px] leading-relaxed">
      {title && (
        <div className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-800">
          {title}
        </div>
      )}
      <div className="p-4">
        <Node value={data as JsonValue} depth={0} />
      </div>
    </div>
  );
}
