import type { ReactElement, ReactNode } from 'react';
import React from 'react';

/* A small Markdown renderer for the spec pages, so IMPLEMENTATION.md and
   README.md stay the single source: an agent reads the file, a person reads
   the same text in Storybook. Covers what those files use: headings,
   paragraphs, lists, tables, fenced code, quotes, **bold**, `code`, [links](). */

const inline = (text: string, key = ''): ReactNode[] => {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(text))) {
    if (m.index > last) {
      out.push(text.slice(last, m.index));
    }
    const t = m[0];
    const k = `${key}-${i}`;
    if (t.startsWith('**')) {
      out.push(<b key={k} className="text-text-primary">{inline(t.slice(2, -2), k)}</b>);
    } else if (t.startsWith('`')) {
      out.push(<code key={k} className="rounded-4 bg-surface-float px-1 font-mono text-[0.92em] text-text-primary">{t.slice(1, -1)}</code>);
    } else {
      const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/) ?? [];
      out.push(<a key={k} href={href} target="_blank" rel="noreferrer" className="text-accent-cabbage-default underline underline-offset-2">{label}</a>);
    }
    last = m.index + t.length;
    i += 1;
  }
  if (last < text.length) {
    out.push(text.slice(last));
  }
  return out;
};

const isTableSep = (l: string) => /^\s*\|?\s*:?-{2,}/.test(l) && l.includes('|');
const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export const Markdown = ({ source }: { source: string }): ReactElement => {
  const lines = source.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let n = 0;
  const key = () => `b${(n += 1)}`;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre key={key()} className="overflow-x-auto rounded-12 border border-border-subtlest-tertiary bg-background-popover p-4 font-mono typo-footnote text-text-secondary">
          {body.join('\n')}
        </pre>,
      );
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls = ['font-bold typo-title1 pt-2', 'font-bold typo-title2 pt-6 border-t border-border-subtlest-tertiary', 'font-bold typo-title3 pt-3', 'font-bold typo-callout pt-2'][level - 1];
      const id = h[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      blocks.push(React.createElement(`h${level}`, { key: key(), id, className: `${cls} text-text-primary` }, inline(h[2])));
      i += 1;
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(cells(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={key()} className="overflow-x-auto rounded-12 border border-border-subtlest-tertiary">
          <table className="w-full typo-footnote">
            <thead>
              <tr className="text-left text-text-quaternary">
                {head.map((c) => <th key={c} className="px-3 py-2 font-mono uppercase tracking-wider typo-caption1">{inline(c)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={ri} className="border-t border-border-subtlest-tertiary align-top">
                  {r.map((c, ci) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <td key={ci} className={ci === 0 ? 'px-3 py-2 text-text-primary' : 'px-3 py-2 text-text-tertiary'}>{inline(c, `${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: { depth: number; text: string }[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const depth = (lines[i].match(/^\s*/)?.[0].length ?? 0) >= 2 ? 1 : 0;
        let text = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '');
        i += 1;
        // continuation lines indented under the item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
          text += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push({ depth, text });
      }
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(
        <Tag key={key()} className={`${ordered ? 'list-decimal' : 'list-disc'} flex flex-col gap-1 pl-5 typo-callout text-text-secondary`}>
          {items.map((it, ii) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={ii} className={it.depth ? 'ml-5 list-[circle]' : undefined}>{inline(it.text, `${ii}`)}</li>
          ))}
        </Tag>,
      );
      continue;
    }
    if (line.startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote key={key()} className="rounded-12 border-l-4 border-accent-cabbage-default bg-surface-float px-4 py-3 typo-callout text-text-secondary">
          {inline(body.join(' '))}
        </blockquote>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\s*([-*]|\d+\.)\s+)/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(<p key={key()} className="typo-callout text-text-secondary">{inline(para.join(' '))}</p>);
  }

  return <div className="flex flex-col gap-3">{blocks}</div>;
};
