import type { ReactElement, ReactNode } from 'react';
import React from 'react';

// Renders the implementation guide (IMPLEMENTATION.md) in Storybook, so the
// page a reviewer reads and the file an agent reads are the same text.
// Covers what the guide uses: headings, paragraphs, lists, tables, fenced
// code, inline code, bold and links. Nothing else.

const inline = (text: string, keyPrefix: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match = pattern.exec(text);
  let index = 0;
  while (match) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    if (token.startsWith('`')) {
      parts.push(
        <code
          key={key}
          className="rounded-4 bg-surface-float px-1 text-text-primary typo-footnote"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      parts.push(
        <strong key={key} className="text-text-primary">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(token) ?? [];
      parts.push(
        <a key={key} href={href} className="text-text-link underline">
          {label}
        </a>,
      );
    }
    last = match.index + token.length;
    index += 1;
    match = pattern.exec(text);
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts;
};

const cells = (row: string): string[] =>
  row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

export const Markdown = ({ source }: { source: string }): ReactElement => {
  const lines = source.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const next = () => {
    key += 1;
    return `md-${key}`;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={next()}
          className="overflow-x-auto rounded-12 bg-surface-float p-4 text-text-primary typo-footnote"
        >
          <code>{body.join('\n')}</code>
        </pre>,
      );
    } else if (/^#{1,4} /.test(line)) {
      const level = line.match(/^#+/)?.[0].length ?? 1;
      const text = line.replace(/^#+ /, '');
      const className = {
        1: 'font-bold typo-mega3',
        2: 'mt-6 border-t border-border-subtlest-tertiary pt-8 font-bold typo-title1',
        3: 'mt-2 font-bold typo-title3',
        4: 'font-bold typo-callout',
      }[level];
      const Tag = `h${level}` as 'h1';
      blocks.push(
        <Tag key={next()} className={className}>
          {inline(text, `h${key}`)}
        </Tag>,
      );
      i += 1;
    } else if (line.trim().startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i]);
        i += 1;
      }
      const [head, , ...body] = rows;
      blocks.push(
        <div key={next()} className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left typo-callout">
            <thead>
              <tr className="border-b border-border-subtlest-tertiary text-text-quaternary typo-footnote">
                {cells(head).map((cell, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <th key={index} className="py-2 pr-6 font-bold">
                    {inline(cell, `th${key}-${index}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr
                  // eslint-disable-next-line react/no-array-index-key
                  key={rowIndex}
                  className="border-b border-border-subtlest-tertiary align-top"
                >
                  {cells(row).map((cell, index) => (
                    <td
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className="text-pretty py-2 pr-6 text-text-secondary"
                    >
                      {inline(cell, `td${key}-${rowIndex}-${index}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^\s*(- |\d+\. )/.test(line)) {
      const ordered = /^\s*\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*(- |\d+\. |  \S)/.test(lines[i])) {
        if (/^\s*(- |\d+\. )/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*(- |\d+\. )/, ''));
        } else {
          items[items.length - 1] += ` ${lines[i].trim()}`;
        }
        i += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List
          key={next()}
          className={`flex flex-col gap-1.5 pl-5 text-text-secondary typo-callout ${
            ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {items.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index} className="text-pretty">
              {inline(item, `li${key}-${index}`)}
            </li>
          ))}
        </List>,
      );
    } else if (line.trim() === '') {
      i += 1;
    } else {
      const para: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^(#{1,4} |```|\s*\||\s*- |\s*\d+\. )/.test(lines[i])
      ) {
        para.push(lines[i].trim());
        i += 1;
      }
      blocks.push(
        <p
          key={next()}
          className="text-pretty text-text-secondary typo-callout"
        >
          {inline(para.join(' '), `p${key}`)}
        </p>,
      );
    }
  }

  return <div className="flex max-w-[60rem] flex-col gap-4">{blocks}</div>;
};
