import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { WidgetSize } from './catalog';
import { sizeLabel, sizeSpan, WidgetSurface } from './catalog';

const UNIT_WIDTH = 17.25;
const UNIT_HEIGHT = 13.25;

const dimensions = (size: WidgetSize) => {
  const { cols, rows } = sizeSpan[size];
  return {
    width: `${cols * UNIT_WIDTH + (cols - 1) * 2}rem`,
    height: `${rows * UNIT_HEIGHT + (rows - 1)}rem`,
  };
};

/** One widget at true scale, captioned with its size. */
export const SizedCell = ({
  size,
  caption,
  children,
}: {
  size: WidgetSize;
  caption?: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex flex-col gap-2">
    <figcaption className="text-text-tertiary typo-footnote">
      {caption ?? sizeLabel[size]}
    </figcaption>
    <div className="flex" style={dimensions(size)}>
      <WidgetSurface className="flex-1">{children}</WidgetSurface>
    </div>
  </figure>
);

/** A state of a widget, shown at every size it comes in, side by side. */
export const StateRow = ({
  title,
  note,
  sizes = ['s', 'm', 'l'],
  render,
}: {
  title: string;
  note?: string;
  sizes?: WidgetSize[];
  render: (size: WidgetSize) => ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
    <div className="flex max-w-[56rem] flex-col gap-0.5">
      <h3 className="font-bold text-text-primary typo-body">{title}</h3>
      {note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    <div className="flex flex-wrap items-end gap-8">
      {sizes.map((size) => (
        <SizedCell key={size} size={size}>
          {render(size)}
        </SizedCell>
      ))}
    </div>
  </section>
);

/** The decisions a widget's page asks for, as a short checklist. */
export const Decisions = ({ items }: { items: string[] }): ReactElement => (
  <ul className="flex max-w-[56rem] flex-col gap-1.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <li className="font-bold text-text-primary typo-callout">To decide</li>
    {items.map((item) => (
      <li key={item} className="flex gap-2 text-text-secondary typo-callout">
        <span className="text-text-quaternary">□</span>
        {item}
      </li>
    ))}
  </ul>
);
