import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HybridProviders, Viewer } from './providers';
import type { PageProps } from './page';
import { PostPage, Version } from './versions';
import { postsByKind } from './data';
import type { PostKind } from './data';
import { ViewportFrame } from './frame';

// Shared furniture for the review pages: a header, sections, tables and
// live page frames of a real width.

export const DocPage = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
    <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-12">
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
        <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
          {eyebrow}
        </span>
        <h1 className="max-w-[28ch] font-bold typo-mega3">{title}</h1>
        <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
          {intro}
        </div>
      </header>
      {children}
    </div>
  </div>
);

export const Section = ({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {lead && (
        <p className="max-w-[76ch] text-text-tertiary typo-callout">{lead}</p>
      )}
    </div>
    {children}
  </section>
);

export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full border-collapse text-left typo-callout">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-tertiary typo-footnote"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-4 py-3',
                  cellIndex === 0
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
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

export enum Mark {
  Win = 'win',
  Loss = 'loss',
  Same = 'same',
  New = 'new',
}

const markClass: Record<Mark, string> = {
  [Mark.Win]: 'bg-accent-avocado-default',
  [Mark.Loss]: 'bg-accent-ketchup-default',
  [Mark.Same]: 'bg-text-quaternary',
  [Mark.New]: 'bg-accent-cabbage-default',
};

/** A cell with a colored dot: green kept or won, red lost, purple new. */
export const Cell = ({
  mark,
  children,
}: {
  mark: Mark;
  children: ReactNode;
}): ReactElement => (
  <span className="flex items-start gap-2">
    <span
      aria-hidden
      className={classNames(
        'mt-1.5 size-2 shrink-0 rounded-full',
        markClass[mark],
      )}
    />
    <span className="min-w-0 flex-1">{children}</span>
  </span>
);

export interface Device {
  label: string;
  width: number;
  height: number;
  scale: number;
}

export const devices = {
  phone: { label: 'Phone, 375px', width: 375, height: 812, scale: 0.8 },
  tablet: { label: 'Tablet, 768px', width: 768, height: 1024, scale: 0.6 },
  laptop: {
    label: 'Laptop, 1100px (sidebar open)',
    width: 1100,
    height: 800,
    scale: 0.55,
  },
  desktop: { label: 'Desktop, 1440px', width: 1440, height: 900, scale: 0.5 },
  wide: { label: 'Wide, 1920px', width: 1920, height: 1080, scale: 0.4 },
};

/** A live page, booted as `viewer`, inside a frame of the device's width. */
export const PageFrame = ({
  device,
  version = Version.Hybrid,
  kind,
  viewer,
  label,
  ...pageProps
}: Omit<PageProps, 'post'> & {
  device: Device;
  version?: Version;
  kind: PostKind;
  label?: string;
}): ReactElement => (
  <ViewportFrame
    width={device.width}
    height={device.height}
    scale={device.scale}
    label={label ?? device.label}
  >
    <HybridProviders viewer={viewer} posts={Object.values(postsByKind)}>
      <PostPage
        version={version}
        post={postsByKind[kind]}
        viewer={viewer}
        {...pageProps}
      />
    </HybridProviders>
  </ViewportFrame>
);

export { Version, Viewer };
