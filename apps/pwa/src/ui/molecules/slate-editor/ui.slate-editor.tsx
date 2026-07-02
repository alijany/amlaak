'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Path,
  Range,
  Transforms,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSelected,
  useSlate,
  withReact,
} from 'slate-react';
import { fetcher, uploadFileFetcher } from '@/libs/api/api.util.fetcher';
import { Modal } from '@/ui/atoms/ui.modal';
import { Spinner } from '@/ui/atoms/ui.atoms.spinner';
import { BlockType, CustomElement, ImageElement, LinkElement } from './slate.types';
import { EMPTY_SLATE_VALUE } from './slate.utils';

type MarkFormat = 'bold' | 'italic' | 'underline' | 'code';

const LIST_TYPES: BlockType[] = ['bulleted-list', 'numbered-list'];

// ─── Editor plugin ────────────────────────────────────────────────────────────

function withImages(editor: Editor): Editor {
  const { isVoid, isInline } = editor;
  editor.isVoid   = (el) => (el as CustomElement).type === 'image' ? true : isVoid(el);
  editor.isInline = (el) => (el as CustomElement).type === 'link'  ? true : isInline(el);
  return editor;
}

// ─── Mark helpers ─────────────────────────────────────────────────────────────

function isMarkActive(editor: Editor, format: MarkFormat) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

function toggleMark(editor: Editor, format: MarkFormat) {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

// ─── Block helpers ────────────────────────────────────────────────────────────

function isBlockActive(editor: Editor, format: BlockType) {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as CustomElement).type === format,
    }),
  );
  return !!match;
}

function toggleBlock(editor: Editor, format: BlockType) {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as CustomElement).type as BlockType),
    split: true,
  });

  const newType: BlockType = isActive ? 'paragraph' : isList ? 'list-item' : format;
  Transforms.setNodes<CustomElement>(editor, { type: newType });

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, { type: format, children: [] });
  }
}

// ─── Image helpers ────────────────────────────────────────────────────────────

function insertImageNode(editor: Editor, url: string) {
  const image: ImageElement = { type: 'image', url, children: [{ text: '' }] };
  Transforms.insertNodes(editor, image);
  // Append a paragraph so the cursor isn't trapped after the void node
  Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
}

// ─── Link helpers ─────────────────────────────────────────────────────────────

function isLinkActive(editor: Editor): boolean {
  const [node] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && (n as CustomElement).type === 'link',
  });
  return !!node;
}

function getActiveLinkUrl(editor: Editor): string | null {
  const [entry] = Editor.nodes<LinkElement>(editor, {
    match: (n) => SlateElement.isElement(n) && (n as CustomElement).type === 'link',
  });
  return entry ? entry[0].url : null;
}

function unwrapLink(editor: Editor) {
  Transforms.unwrapNodes(editor, {
    match: (n) => SlateElement.isElement(n) && (n as CustomElement).type === 'link',
  });
}

function wrapLink(editor: Editor, url: string) {
  if (isLinkActive(editor)) unwrapLink(editor);
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };
  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
}

// ─── Toolbar buttons ──────────────────────────────────────────────────────────

function MarkButton({ format, label }: { format: MarkFormat; label: string }) {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); toggleMark(editor, format); }}
      className={`px-2 py-1 text-sm rounded ${active ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
    >
      {label}
    </button>
  );
}

function BlockButton({ format, label }: { format: BlockType; label: string }) {
  const editor = useSlate();
  const active = isBlockActive(editor, format);
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); toggleBlock(editor, format); }}
      className={`px-2 py-1 text-sm rounded ${active ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
    >
      {label}
    </button>
  );
}

function LinkToolbarButton({ onOpen }: { onOpen: (url: string | null) => void }) {
  const editor = useSlate();
  const active = isLinkActive(editor);
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onOpen(getActiveLinkUrl(editor)); }}
      className={`px-2 py-1 text-sm rounded ${active ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
      title="درج لینک (Ctrl+K)"
    >
      🔗
    </button>
  );
}

// ─── Sortable block wrapper ───────────────────────────────────────────────────

function SortableBlock({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} className="group/block flex items-start gap-1">
      {/* Drag handle — visible on hover, excluded from contentEditable */}
      <button
        type="button"
        contentEditable={false}
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover/block:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0 mt-1 p-0.5 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 select-none"
        tabIndex={-1}
        aria-label="جابجایی بلوک"
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Image block void element ─────────────────────────────────────────────────

function ImageBlock({
  attributes,
  element,
  children,
}: {
  attributes: RenderElementProps['attributes'];
  element: ImageElement;
  children: React.ReactNode;
}) {
  const selected = useSelected();
  const editor = useSlate();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    // Fire-and-forget S3 cleanup — don't block the editor on network
    if (element.url) {
      fetcher('/blog/cover-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: element.url }),
      }).catch(() => { /* ignore — orphaned files are acceptable */ });
    }
  };

  return (
    <figure
      {...attributes}
      contentEditable={false}
      className={`my-2 group relative rounded ${selected ? 'ring-2 ring-blue-400' : ''}`}
    >
      {element.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.url}
          alt={element.caption ?? ''}
          className="w-full max-h-96 object-contain rounded bg-slate-50"
        />
      ) : (
        <div className="flex items-center justify-center gap-3 h-32 bg-slate-100 rounded">
          <Spinner size="sm" />
          <span className="text-sm text-slate-500">در حال بارگذاری تصویر...</span>
        </div>
      )}
      {element.caption && (
        <figcaption className="text-center text-sm text-slate-500 mt-1" dir="rtl">
          {element.caption}
        </figcaption>
      )}
      <button
        type="button"
        onMouseDown={handleDelete}
        className="absolute end-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-xs px-2 py-1 rounded"
      >
        حذف
      </button>
      {/* Slate void invariant: children must be rendered (hidden) */}
      <span className="hidden select-none">{children}</span>
    </figure>
  );
}

// ─── Element / leaf renderers ─────────────────────────────────────────────────

function renderElement({ attributes, children, element }: RenderElementProps) {
  const el = element as CustomElement;
  switch (el.type) {
    case 'image':
      return <ImageBlock attributes={attributes} element={el as ImageElement}>{children}</ImageBlock>;
    case 'link': {
      const linkEl = el as LinkElement;
      return (
        <a
          {...attributes}
          href={linkEl.url}
          onClick={(e) => e.preventDefault()}
          className="text-blue-600 underline cursor-text hover:text-blue-800"
        >
          {children}
        </a>
      );
    }
    case 'heading-one':
      return <h1 {...attributes} className="text-3xl font-bold my-2">{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes} className="text-2xl font-bold my-2">{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes} className="text-xl font-bold my-1">{children}</h3>;
    case 'block-quote':
      return <blockquote {...attributes} className="border-r-4 border-slate-300 pr-4 italic text-slate-600 my-2">{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc list-inside my-2">{children}</ul>;
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal list-inside my-2">{children}</ol>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'code-block':
      return <pre {...attributes} className="bg-slate-100 rounded p-3 font-mono text-sm my-2 overflow-x-auto"><code>{children}</code></pre>;
    default:
      return <p {...attributes} className="my-1 leading-relaxed">{children}</p>;
  }
}

function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  let el = children;
  if (leaf.bold) el = <strong>{el}</strong>;
  if (leaf.italic) el = <em>{el}</em>;
  if (leaf.underline) el = <u>{el}</u>;
  if (leaf.code) el = <code className="bg-slate-100 rounded px-1 font-mono text-sm">{el}</code>;
  return <span {...attributes}>{el}</span>;
}

// ─── Floating selection toolbar ──────────────────────────────────────────────

function FloatingMarkButton({ format, label }: { format: MarkFormat; label: string }) {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); toggleMark(editor, format); }}
      className={`px-1.5 py-0.5 text-xs font-medium rounded transition-colors ${
        active ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function FloatingLinkButton({ onOpen }: { onOpen: (url: string | null) => void }) {
  const editor = useSlate();
  const active = isLinkActive(editor);
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onOpen(getActiveLinkUrl(editor)); }}
      className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
        active ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-slate-700 hover:text-white'
      }`}
      title="لینک (Ctrl+K)"
    >
      🔗
    </button>
  );
}

function FloatingToolbar({ onOpenLink }: { onOpenLink: (url: string | null) => void }) {
  const editor = useSlate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { selection } = editor;
    if (!selection || Range.isCollapsed(selection) || Editor.string(editor, selection) === '') {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) return;
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
    // Position above the selection center, clamped so it doesn't go off-screen
    const top = rect.top + window.scrollY - el.offsetHeight - 8;
    const left = Math.max(
      8,
      Math.min(
        window.innerWidth - el.offsetWidth - 8,
        rect.left + window.scrollX + rect.width / 2 - el.offsetWidth / 2,
      ),
    );
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  });

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1 bg-slate-800 rounded-lg shadow-xl opacity-0 pointer-events-none"
      onMouseDown={(e) => e.preventDefault()}
    >
      <FloatingMarkButton format="bold" label="B" />
      <FloatingMarkButton format="italic" label="I" />
      <FloatingMarkButton format="underline" label="U" />
      <FloatingMarkButton format="code" label="<>" />
      <div className="w-px bg-slate-600 mx-0.5 h-3.5" />
      <FloatingLinkButton onOpen={onOpenLink} />
    </div>
  );
}

// ─── DnD-aware renderElement wrapper ─────────────────────────────────────────

function SortableElementRenderer(props: RenderElementProps & { nodeId: string }) {
  const { nodeId, ...rest } = props;
  return (
    <SortableBlock id={nodeId}>
      {renderElement(rest)}
    </SortableBlock>
  );
}

// ─── Main editor component ────────────────────────────────────────────────────

interface SlateEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  placeholder?: string;
  minHeight?: number;
}

export function SlateEditor({
  value,
  onChange,
  placeholder = 'متن مطلب را بنویسید...',
  minHeight = 300,
}: SlateEditorProps) {
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);
  const initialValue = value?.length ? value : EMPTY_SLATE_VALUE;

  const [isUploading, setIsUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // Saves the Slate selection before the modal opens (opening modal removes editor focus)
  const savedSelection = useRef<typeof editor.selection>(null);

  // Stable IDs for each top-level node — keyed by node object identity.
  // Using index-based IDs causes animation to break after the first reorder
  // because dnd-kit tracks items by ID across renders.
  const nodeIds = useRef<Map<Descendant, string>>(new Map());
  const getNodeId = useCallback((node: Descendant): string => {
    if (!nodeIds.current.has(node)) {
      nodeIds.current.set(node, Math.random().toString(36).slice(2));
    }
    return nodeIds.current.get(node)!;
  }, []);

  // dnd-kit sensors — MouseSensor with activation distance to avoid conflicting with clicks
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Map stable IDs back to current indices
      const children = editor.children;
      const ids = children.map((n) => getNodeId(n));
      const fromIndex = ids.indexOf(String(active.id));
      const toIndex = ids.indexOf(String(over.id));
      if (fromIndex === -1 || toIndex === -1) return;

      // arrayMove gives us the new desired order; apply it as a series of Slate moves
      const newOrder = arrayMove(ids, fromIndex, toIndex);
      // Build the sequence of Slate path moves from current → desired order
      // Simplest correct approach: move each node to its target position in order
      newOrder.forEach((id, desiredIndex) => {
        const currentIds = editor.children.map((n) => getNodeId(n));
        const currentIndex = currentIds.indexOf(id);
        if (currentIndex !== desiredIndex) {
          Transforms.moveNodes(editor, {
            at: [currentIndex] as Path,
            to: [desiredIndex] as Path,
          });
        }
      });
    },
    [editor, getNodeId],
  );

  const handleOpenLinkPopover = useCallback((currentUrl: string | null) => {
    // Save selection now — opening the modal removes editor focus and clears editor.selection
    savedSelection.current = editor.selection;
    setLinkUrl(currentUrl ?? '');
    setIsEditingLink(currentUrl !== null);
    setLinkModalOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    // Restore selection before mutating so wrapLink/unwrapLink operates on the right range
    if (savedSelection.current) {
      ReactEditor.focus(editor);
      Transforms.select(editor, savedSelection.current);
    }
    wrapLink(editor, trimmed);
    setLinkModalOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    if (savedSelection.current) {
      ReactEditor.focus(editor);
      Transforms.select(editor, savedSelection.current);
    }
    unwrapLink(editor);
    setLinkModalOpen(false);
  }, [editor]);

  const handleImageFileSelected = useCallback((files: FileList) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploading(true);
    uploadFileFetcher<{ url: string }>('/blog/cover-image', file)
      .then(({ url }) => insertImageNode(editor, url))
      .catch(() => { /* upload failed silently — user can retry */ })
      .finally(() => setIsUploading(false));
  }, [editor]);

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const { files } = event.dataTransfer;
      if (!files.length || !files[0].type.startsWith('image/')) return;
      event.preventDefault();

      const dropRange = ReactEditor.findEventRange(editor, event);
      Transforms.select(editor, dropRange);

      const placeholder: ImageElement = { type: 'image', url: '', children: [{ text: '' }] };
      Transforms.insertNodes(editor, placeholder);
      const [, placeholderPath] = Editor.node(editor, editor.selection!);
      const pathRef = Editor.pathRef(editor, placeholderPath);

      setIsUploading(true);
      uploadFileFetcher<{ url: string }>('/blog/cover-image', files[0])
        .then(({ url }) => {
          if (pathRef.current) {
            Transforms.setNodes<ImageElement>(editor, { url, caption: '' }, { at: pathRef.current });
          }
        })
        .catch(() => {
          if (pathRef.current) Transforms.removeNodes(editor, { at: pathRef.current });
        })
        .finally(() => {
          pathRef.unref();
          setIsUploading(false);
        });
    },
    [editor],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      switch (event.key) {
        case 'b': event.preventDefault(); toggleMark(editor, 'bold'); break;
        case 'i': event.preventDefault(); toggleMark(editor, 'italic'); break;
        case 'u': event.preventDefault(); toggleMark(editor, 'underline'); break;
        case '`': event.preventDefault(); toggleMark(editor, 'code'); break;
        case 'k': event.preventDefault(); handleOpenLinkPopover(getActiveLinkUrl(editor)); return;
      }
    },
    [editor, handleOpenLinkPopover],
  );

  // Stable IDs for SortableContext — recomputed whenever children array changes
  const topLevelIds = useMemo(() => editor.children.map(getNodeId), [editor.children, getNodeId]);

  // The overlay shows the dragged block's text as a ghost
  const activeNode = activeId !== null
    ? editor.children.find((n) => getNodeId(n) === activeId) ?? null
    : null;

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
      {/* Floating toolbar — rendered at root of Slate context so it sits above overflow-hidden containers */}
      <FloatingToolbar onOpenLink={handleOpenLinkPopover} />
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
          <MarkButton format="bold" label="B" />
          <MarkButton format="italic" label="I" />
          <MarkButton format="underline" label="U" />
          <MarkButton format="code" label="<>" />
          <div className="w-px bg-slate-200 mx-1" />
          <BlockButton format="heading-one" label="H1" />
          <BlockButton format="heading-two" label="H2" />
          <BlockButton format="heading-three" label="H3" />
          <div className="w-px bg-slate-200 mx-1" />
          <BlockButton format="bulleted-list" label="•—" />
          <BlockButton format="numbered-list" label="1—" />
          <BlockButton format="block-quote" label="❝" />
          <BlockButton format="code-block" label="{ }" />
          <div className="w-px bg-slate-200 mx-1" />
          <LinkToolbarButton onOpen={handleOpenLinkPopover} />
          <button
            type="button"
            disabled={isUploading}
            onMouseDown={(e) => { e.preventDefault(); imageInputRef.current?.click(); }}
            className="px-2 py-1 text-sm rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
            title="درج تصویر"
          >
            {isUploading ? '...' : '🖼'}
          </button>
        </div>

        {/* Editable area wrapped in DnD context */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
            <Editable
              renderElement={(props) => {
                // Only top-level nodes (path length === 1) get the sortable wrapper
                const path = ReactEditor.findPath(editor, props.element);
                if (path.length === 1) {
                  return <SortableElementRenderer {...props} nodeId={getNodeId(props.element)} />;
                }
                return renderElement(props);
              }}
              renderLeaf={renderLeaf}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              onDrop={handleFileDrop}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('Files')) e.preventDefault();
              }}
              className="p-4 outline-none relative"
              style={{ minHeight }}
            />
          </SortableContext>

          {/* Ghost overlay shown while dragging */}
          <DragOverlay>
            {activeNode && (
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-lg text-sm text-slate-600 opacity-90 cursor-grabbing">
                {SlateElement.isElement(activeNode) && (activeNode as CustomElement).type === 'image'
                  ? '🖼 تصویر'
                  : (() => {
                      const idx = editor.children.findIndex((n) => getNodeId(n) === activeId);
                      return idx !== -1 ? Editor.string(editor, [idx]).slice(0, 60) || '…' : '…';
                    })()}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <style>{`
          [data-slate-placeholder] {
            top: 1rem !important;
            right: 1rem !important;
            left: auto !important;
            pointer-events: none;
          }
        `}</style>
      </div>

      {/* Hidden file input for toolbar image button */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleImageFileSelected(e.target.files)}
      />

      {/* Link modal */}
      <Modal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)}>
        <div className="p-6 w-full" dir="rtl">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            {isEditingLink ? 'ویرایش لینک' : 'درج لینک'}
          </h2>

          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            آدرس لینک
          </label>
          <input
            autoFocus
            dir="ltr"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') { e.preventDefault(); setLinkModalOpen(false); }
            }}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors mb-5"
          />

          <div className="flex items-center gap-2 justify-end">
            {isEditingLink && (
              <button
                type="button"
                onClick={handleRemoveLink}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                حذف لینک
              </button>
            )}
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={applyLink}
              disabled={!linkUrl.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEditingLink ? 'ذخیره' : 'درج'}
            </button>
          </div>
        </div>
      </Modal>
    </Slate>
  );
}
