import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Device, devices } from '../history/device';

// Review furniture shared by every story in this folder: the doc atoms
// (sections, cards, tables, callouts) and the laptop frames the shells
// render into. The frames are the History review's Device: an iframe of its
// own width with this document's styles, so `laptop:` classes and fixed
// chrome behave as they do in a real window of that size.

/** The three states of the anonymous laptop shell, plus the signed-in one. */
export type Version = 'before' | 'today' | 'proposed';
export type Audience = 'anonymous' | 'member';

export const versionLabel: Record<Version, string> = {
  before: '1 · Before layout v2 (production until 23 Oct 2026)',
  today: '2 · Production today (after #7017, 23 Oct 2026)',
  proposed: '3 · Proposed fix',
};

export const versionNote: Record<Version, string> = {
  before:
    'Global header (logo, search, Get the app, Log in, Sign up) over the 44px v1 sidebar. Page runs straight in <main>.',
  today:
    'The same header, now over the v2 rail. Two logos, two searches, the rail’s own logo and toggle hidden under the header, no floating card.',
  proposed:
    'The rail owns the header for everyone on laptop. Same card, same page strip as a member. Auth lives in the sticky sign-in strip above the card; the rail carries nothing that needs an account.',
};

export const Eyebrow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

export const Section = ({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <section id={id} className="flex scroll-mt-6 flex-col gap-5">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold typo-title1">{title}</h2>
      {lead && (
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      )}
    </div>
    {children}
  </section>
);

export const Card = ({
  title,
  children,
  tone = 'neutral',
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'warning';
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-20 border p-5',
      tone === 'brand' &&
        'border-accent-cabbage-default bg-overlay-float-cabbage',
      tone === 'warning' && 'border-accent-bun-default bg-overlay-float-bun',
      tone === 'neutral' && 'border-border-subtlest-tertiary',
      className,
    )}
  >
    {title && <h3 className="font-bold typo-body">{title}</h3>}
    <div className="flex flex-col gap-2 text-text-secondary typo-callout">
      {children}
    </div>
  </div>
);

export const Table = ({
  head,
  rows,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full border-collapse text-left typo-callout">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <th key={index} className="px-4 py-2.5 font-bold text-text-primary">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, index) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={classNames(
                  'px-4 py-2.5 text-text-secondary',
                  index === 0 && 'font-bold text-text-primary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Page = ({
  title,
  lead,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-dvh bg-background-default text-text-primary antialiased">
    <div className="mx-auto flex max-w-[96rem] flex-col gap-10 px-6 py-10">
      <header className="flex flex-col gap-3">
        <Eyebrow>Layout v2 · anonymous laptop visitors</Eyebrow>
        <h1 className="font-bold typo-mega2">{title}</h1>
        {lead && (
          <div className="max-w-[90ch] text-text-secondary typo-body">
            {lead}
          </div>
        )}
      </header>
      {children}
    </div>
  </div>
);

/** A labelled laptop of the given width around one shell. */
export const Shot = ({
  label,
  note,
  width = 1440,
  height = 900,
  children,
}: {
  label: ReactNode;
  note?: ReactNode;
  width?: number;
  height?: number;
  children: ReactNode;
}): ReactElement => (
  <Device width={width} height={height} label={label} note={note}>
    {children}
  </Device>
);

export { devices };

/** One version's frame, with the legend row above it. */
export const VersionShot = ({
  version,
  audience = 'anonymous',
  width,
  height,
  children,
}: {
  version: Version;
  audience?: Audience;
  width?: number;
  height?: number;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-title3">
        {audience === 'member' ? 'Signed in · today' : versionLabel[version]}
      </span>
      <span className="max-w-[100ch] text-text-tertiary typo-callout">
        {audience === 'member'
          ? 'The reference the anonymous shell should match: the rail, the floating card and the page strip.'
          : versionNote[version]}
      </span>
    </div>
    <Shot
      label={`${width ?? 1440} × ${height ?? 900}`}
      width={width}
      height={height}
    >
      {children}
    </Shot>
  </div>
);
