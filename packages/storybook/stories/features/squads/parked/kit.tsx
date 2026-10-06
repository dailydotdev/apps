import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { storyNameFromExport, toId } from 'storybook/internal/csf';

// The building blocks of the spec pages and the responsive sheets.

export const PARKED = 'Verified Squads (parked)';

/** The id Storybook gives an exported story, for embedding it. */
export const storyId = (title: string, exportName: string): string =>
  toId(title, storyNameFromExport(exportName));

export const phone = { viewport: { value: 'mobile2', isRotated: false } };
export const tablet = { viewport: { value: 'tablet', isRotated: false } };

/* --------------------------------------------------------- spec pages */

export const SpecPage = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto flex max-w-[60rem] flex-col gap-4 px-4 py-10 tablet:px-8">
    {children}
  </main>
);

export const H1 = ({ children }: { children: ReactNode }) => (
  <h1 className="text-balance font-bold text-text-primary typo-mega3">
    {children}
  </h1>
);

export const Lead = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[48rem] text-pretty text-text-secondary typo-title3">
    {children}
  </p>
);

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-8 border-t border-border-subtlest-tertiary pt-6 font-bold text-text-primary typo-title2">
    {children}
  </h2>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-2 font-bold text-text-primary typo-body">{children}</h3>
);

export const P = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[48rem] text-pretty text-text-secondary typo-callout">
    {children}
  </p>
);

export const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="flex max-w-[48rem] list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-callout">
    {items.map((item, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={i} className="text-pretty">
        {item}
      </li>
    ))}
  </ul>
);

export const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-6 bg-surface-float px-1.5 py-0.5 font-mono text-text-primary typo-footnote">
    {children}
  </code>
);

export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              className="border-b border-border-subtlest-tertiary px-3 py-2 font-bold text-text-tertiary typo-footnote"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={r}>
            {row.map((cell, i) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="border-b border-border-subtlest-tertiary px-3 py-2 align-top text-text-primary typo-callout"
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

/** A decision that was made in review, so nobody re-opens it by accident. */
export const Decision = ({ children }: { children: ReactNode }) => (
  <div className="flex max-w-[48rem] gap-3 rounded-12 border border-accent-cabbage-default/40 bg-accent-cabbage-default/10 px-4 py-3 text-text-primary typo-callout">
    <span aria-hidden className="font-bold text-accent-cabbage-default">
      Decided
    </span>
    <span className="text-pretty">{children}</span>
  </div>
);

/** Links to the stories that show a spec point. */
export const StoryLinks = ({
  links,
}: {
  links: { label: string; title: string; story: string }[];
}) => (
  <div className="flex flex-wrap gap-2">
    {links.map(({ label, title, story }) => (
      <a
        key={label}
        href={`?path=/story/${storyId(title, story)}`}
        target="_top"
        className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
      >
        {label}
      </a>
    ))}
  </div>
);

/* --------------------------------------------------- responsive sheet */

const devices = [
  { name: 'Phone', width: 390, height: 844, scale: 0.7 },
  { name: 'Tablet', width: 834, height: 1112, scale: 0.45 },
  { name: 'Desktop', width: 1280, height: 900, scale: 0.42 },
];

export interface SheetScreen {
  label: string;
  title: string;
  story: string;
  note?: string;
}

/**
 * Every screen at the three widths that matter, side by side. Each frame
 * is a real story at that width, so the breakpoints are the app's own.
 */
export const ResponsiveSheet = ({
  heading,
  screens,
}: {
  heading: string;
  screens: SheetScreen[];
}): ReactElement => {
  const [isActualSize, setIsActualSize] = useState(false);

  return (
    <div className="flex flex-col gap-8 px-4 py-8 tablet:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-text-primary typo-title1">{heading}</h1>
          <p className="text-text-tertiary typo-callout">
            Phone 390px · Tablet 834px · Desktop 1280px. Each frame is the live
            story at that width; laptop (1020px) is where the right column
            appears.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActualSize((value) => !value)}
          className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
        >
          {isActualSize ? 'Fit to screen' : 'Actual size'}
        </button>
      </div>
      {screens.map((screen) => (
        <section key={screen.label} className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-bold text-text-primary typo-title3">
              {screen.label}
            </h2>
            {!!screen.note && (
              <p className="text-text-tertiary typo-footnote">{screen.note}</p>
            )}
          </div>
          <div
            className={classNames(
              'flex gap-6',
              isActualSize ? 'overflow-x-auto pb-4' : 'flex-wrap',
            )}
          >
            {devices.map((device) => {
              const scale = isActualSize ? 1 : device.scale;

              return (
                <figure
                  key={device.name}
                  className="flex shrink-0 flex-col gap-2"
                >
                  <figcaption className="font-bold text-text-tertiary typo-caption1">
                    {`${device.name} · ${device.width}px`}
                  </figcaption>
                  <div
                    className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
                    style={{
                      width: device.width * scale,
                      height: device.height * scale,
                    }}
                  >
                    <iframe
                      title={`${screen.label}, ${device.name}`}
                      src={`iframe.html?id=${storyId(
                        screen.title,
                        screen.story,
                      )}&viewMode=story`}
                      loading="lazy"
                      style={{
                        width: device.width,
                        height: device.height,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        border: 0,
                      }}
                    />
                  </div>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
