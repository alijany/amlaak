import { Descendant, Text } from 'slate';
import './slate.types';
import type { ImageElement, LinkElement } from './slate.types';

export const EMPTY_SLATE_VALUE: Descendant[] = [
  { type: 'paragraph', children: [{ text: '' }] },
];

export function slateToHtml(nodes: Descendant[]): string {
  return nodes.map(serializeNode).join('');
}

function serializeNode(node: Descendant): string {
  if (Text.isText(node)) {
    let text = escapeHtml(node.text);
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.code) text = `<code>${text}</code>`;
    return text;
  }

  switch (node.type) {
    case 'image': {
      const img = node as ImageElement;
      const cap = img.caption?.trim() ?? '';
      return `<figure><img src="${escapeHtml(img.url)}" alt="${escapeHtml(cap)}">${cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : ''}</figure>`;
    }
    case 'link': {
      const link = node as LinkElement;
      const children = link.children.map(serializeNode).join('');
      return `<a href="${escapeHtml(link.url)}">${children}</a>`;
    }
    default: {
      const children = node.children.map(serializeNode).join('');
      switch (node.type) {
        case 'heading-one':   return `<h1>${children}</h1>`;
        case 'heading-two':   return `<h2>${children}</h2>`;
        case 'heading-three': return `<h3>${children}</h3>`;
        case 'block-quote':   return `<blockquote>${children}</blockquote>`;
        case 'bulleted-list': return `<ul>${children}</ul>`;
        case 'numbered-list': return `<ol>${children}</ol>`;
        case 'list-item':     return `<li>${children}</li>`;
        case 'code-block':    return `<pre><code>${children}</code></pre>`;
        default:              return `<p>${children}</p>`;
      }
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function parseSlateValue(raw: string): Descendant[] {
  if (!raw) return EMPTY_SLATE_VALUE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Descendant[];
  } catch {
    // not JSON — treat as plain text paragraph
  }
  return [{ type: 'paragraph', children: [{ text: raw }] }];
}
