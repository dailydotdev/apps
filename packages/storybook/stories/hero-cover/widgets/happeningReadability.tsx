import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Case, Page } from '../parts';
import type { WidgetSize } from './catalog';
import { LiveDot, Stack, WidgetLabel } from './production';
import { SizedCell } from './review';
import { Scroll } from './scroll';

/*
 * Nimrod (28 Oct): the Happening now headlines read too heavy. Production
 * sets every headline in bold 15/20 (HappeningNowWidget.tsx), so a column
 * of eight bold two-line headlines is one dark block with no entry point.
 * Each variation below changes only the type of the rows, on the headlines
 * from his screenshot, so they can be compared like for like.
 */

type Row = {
  id: string;
  headline: string;
  time: string;
  /** The live chat row: its meta line replaces the time. */
  live?: string;
};

const rows: Row[] = [
  {
    id: 'live',
    headline: 'PaperPilot: Zero-Cloud, Pure-Rust PDF Engine with WASM and MCP',
    time: '',
    live: 'Live chat · 12 here · ends in 17h',
  },
  {
    id: 's1',
    headline:
      'Anthropic S-1 reveals $80.7B net loss in H1 2026 on $16.3B revenue',
    time: '15m ago',
  },
  {
    id: 's2',
    headline: "Apple's first touchscreen MacBook Pro starts at $2,899",
    time: '33m ago',
  },
  {
    id: 's3',
    headline:
      'Critical EDK II flaw lets attackers run code before Secure Boot, and the fix leaked early',
    time: '49m ago',
  },
  {
    id: 's4',
    headline: 'Google opened Android Studio to Claude Code and Codex',
    time: '52m ago',
  },
  {
    id: 's5',
    headline:
      'Node.js 26 enters LTS as Lithium with Temporal enabled and old APIs removed',
    time: '1h ago',
  },
  {
    id: 's6',
    headline:
      'GitHub Copilot Fusion launches with automatic model orchestration at half the API cost of Claude Code',
    time: '2h ago',
  },
  {
    id: 's7',
    headline:
      'GitHub Octoverse 2026: pushes exceed 2024 and 2025 combined as agents reshape development',
    time: '3h ago',
  },
  {
    id: 's8',
    headline:
      "CPython's experimental JIT will be removed after its PEP was withdrawn",
    time: '3h ago',
  },
  {
    id: 's9',
    headline:
      '700 OpenAI test agents escaped sandboxes and breached Hugging Face in July',
    time: '6h ago',
  },
  {
    id: 's10',
    headline:
      'Ghostty 1.4.0: scrollback compression, full Kitty graphics, and faster parsing',
    time: '7h ago',
  },
];

type Variant = {
  id: string;
  name: string;
  /** What changes against today, in one line. */
  change: string;
  why: string;
  headline: string;
  /** 15px over 22px instead of 20px: two-line headlines stop touching. */
  isAiry?: boolean;
  time: 'inline' | 'below' | 'above';
  rowClassName?: string;
  /** Hairlines between rows, so the gap carries the grouping. */
  isDivided?: boolean;
  /** The first row reads as the lead story, the rest as the list. */
  lead?: string;
  isRecommended?: boolean;
};

const airy: CSSProperties = { lineHeight: '1.375rem' };

export const variants: Variant[] = [
  {
    id: 'today',
    name: 'Today',
    change: 'Bold 15/20 on every headline, time inline.',
    why: 'Every row has the same weight, so nothing leads and the two columns read as one dark block. Light text on a dark card also looks heavier than the same weight on white.',
    headline: 'font-bold typo-callout',
    time: 'inline',
  },
  {
    id: 'medium',
    name: 'A · Medium',
    change: 'Bold → Medium (500). Nothing else moves.',
    why: 'The smallest possible fix. Helvetica Neue has no SemiBold: 600 falls back to Bold, so 500 is the only step down that keeps the headline voice.',
    headline: 'font-medium typo-callout',
    time: 'inline',
  },
  {
    id: 'medium-air',
    name: 'B · Medium, more air',
    change: 'Medium (500), 22px leading, 4px more between rows.',
    why: 'Lighter strokes plus more line gap than glyph height: two-line headlines stop crowding, and the gap between stories is clearly bigger than the gap inside one.',
    headline: 'font-medium typo-callout',
    isAiry: true,
    time: 'inline',
    rowClassName: 'py-2',
    isRecommended: true,
  },
  {
    id: 'regular',
    name: 'C · Regular, time below',
    change: 'Regular (400), 22px leading, time on its own line.',
    why: 'The calmest read, the way news lists like Hacker News and Google News set titles. Contrast comes from white vs. gray, not from weight.',
    headline: 'font-normal typo-callout',
    isAiry: true,
    time: 'below',
  },
  {
    id: 'time-first',
    name: 'D · Time first, hairlines',
    change: 'Medium, time as a small eyebrow above, hairlines between rows.',
    why: '“Happening now” is about recency, so the time leads. Hairlines do the grouping, which frees the headline to be lighter.',
    headline: 'font-medium typo-callout',
    isAiry: true,
    time: 'above',
    rowClassName: 'py-2.5',
    isDivided: true,
  },
  {
    id: 'lead',
    name: 'E · Lead story',
    change: 'First row Medium 17/22, the rest Regular 15/22.',
    why: 'One entry point instead of eight: the eye lands on the top story, then scans the list. Hierarchy by size, not by bolding everything.',
    headline: 'font-normal typo-callout',
    lead: 'font-medium typo-body',
    isAiry: true,
    time: 'inline',
  },
  {
    id: 'compact',
    name: 'F · Smaller, medium',
    change: 'Medium 14/20 (subhead), time inline.',
    why: 'A notch smaller and lighter, so more stories fit above the fold. Denser, so it suits the widget more than reading at length.',
    headline: 'font-medium typo-subhead',
    time: 'inline',
    rowClassName: 'py-2',
  },
];

const HeadlineRow = ({
  row,
  variant,
  isLead,
  isFirst,
}: {
  row: Row;
  variant: Variant;
  isLead: boolean;
  isFirst: boolean;
}): ReactElement => {
  const style = variant.isAiry ? airy : undefined;
  const headlineClassName = classNames(
    'break-words text-text-primary',
    isLead && variant.lead ? variant.lead : variant.headline,
  );
  const meta = row.live ? (
    <span className="flex items-center gap-1.5 truncate text-brand-default typo-caption1">
      <span className="size-1.5 shrink-0 rounded-max bg-brand-default" />
      {row.live}
    </span>
  ) : null;
  const time = (
    <span className="tabular-nums text-text-tertiary typo-caption1">
      {row.time}
    </span>
  );

  return (
    <li
      className={classNames(
        'break-inside-avoid',
        variant.isDivided &&
          !isFirst &&
          'border-t border-border-subtlest-tertiary',
      )}
    >
      <a
        href="#"
        onClick={(event) => event.preventDefault()}
        className={classNames(
          'flex flex-col gap-0.5 rounded-12 px-2 transition-colors duration-150 hover:bg-surface-hover',
          variant.rowClassName ?? 'py-1.5',
        )}
      >
        {variant.time === 'above' && !row.live && time}
        {variant.time === 'inline' && !row.live ? (
          <span className={headlineClassName} style={style}>
            {row.headline}{' '}
            <span className="whitespace-nowrap font-normal text-text-tertiary typo-footnote">
              <span aria-hidden>· </span>
              {row.time}
            </span>
          </span>
        ) : (
          <span className={headlineClassName} style={style}>
            {row.headline}
          </span>
        )}
        {variant.time === 'below' && !row.live && time}
        {meta}
      </a>
    </li>
  );
};

export const HappeningVariant = ({
  variant,
  size,
}: {
  variant: Variant;
  size: WidgetSize;
}): ReactElement => (
  <Stack mood="live">
    <WidgetLabel kind="happening" leading={<LiveDot />} link="Read all">
      Happening now
    </WidgetLabel>
    <Scroll>
      <ul
        className={classNames(
          '-mx-2',
          size === 'l' ? 'columns-2 gap-x-4' : 'flex flex-col',
          !variant.isDivided && size !== 'l' && 'gap-1',
        )}
      >
        {rows.map((row, index) => (
          <HeadlineRow
            key={row.id}
            row={row}
            variant={variant}
            isLead={index === 0}
            isFirst={index === 0 || (size === 'l' && index === 6)}
          />
        ))}
      </ul>
    </Scroll>
  </Stack>
);

const principles: { title: string; body: string }[] = [
  {
    title: 'Bold everything, and nothing stands out',
    body: 'Weight is an emphasis tool. When every headline is bold the list loses its hierarchy and the eye has no place to start. Most news lists set titles in Regular or Medium and save Bold for one lead.',
  },
  {
    title: 'Light on dark reads heavier',
    body: 'White strokes on a dark card bloom (the irradiation effect), so the same weight looks bolder than on white. The common advice is one step lighter in dark mode, which is where most readers see this widget.',
  },
  {
    title: 'Helvetica Neue has no SemiBold',
    body: 'Our stack is Helvetica Neue first. It ships Regular, Medium and Bold, so 600 renders as Bold. Medium (500) is the one real step down, and it is already in use across the app.',
  },
  {
    title: 'Space between stories > space inside one',
    body: 'Multi-line headlines need leading of about 1.4× (22px at 15px) so lines don’t touch, and the gap between rows has to be clearly larger than that, or the rows blur into a paragraph.',
  },
  {
    title: 'Metadata steps back',
    body: 'Time stays small, regular and tertiary, so the scan path is headline → headline. Readers scan lists like this far more than they read them word by word.',
  },
];

export const HappeningReadabilityPage = (): ReactElement => {
  const recommended = variants.find(({ isRecommended }) => isRecommended);
  return (
    <Page
      chapter="Widgets"
      question="How do we make Happening now easier to read?"
      title="Happening now · readability"
      goal="Headlines that feel gentle and scan quickly, in the same widget, with the same font. Nimrod found today’s bold rows too heavy."
      metric="Highlight clicks per widget impression, and how far down the list readers click."
    >
      <Case
        title="Why it reads heavy"
        note="What the research and the common news-list patterns agree on."
      >
        <div className="grid max-w-[64rem] grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              <h3 className="font-bold text-text-primary typo-callout">
                {principle.title}
              </h3>
              <p className="text-text-secondary typo-footnote">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </Case>

      {recommended && (
        <Case
          title={`Recommendation: ${recommended.name}`}
          note="Medium instead of Bold, 22px leading, a little more room between rows. Same font, same size, same layout, a three-class change in HappeningNowWidget.tsx and LiveChatHighlightRow.tsx."
        >
          <div className="flex flex-wrap items-end gap-8">
            <SizedCell size="l" caption="Today">
              <HappeningVariant variant={variants[0]} size="l" />
            </SizedCell>
            <SizedCell size="l" caption={recommended.name}>
              <HappeningVariant variant={recommended} size="l" />
            </SizedCell>
          </div>
        </Case>
      )}

      <Case
        title="Every variation"
        note="Same headlines as the screenshot, Large and Tall. Toggle the Storybook theme to check light mode too."
      >
        <div className="flex flex-col gap-10">
          {variants.map((variant) => (
            <section
              key={variant.id}
              className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6"
            >
              <div className="flex max-w-[56rem] flex-col gap-0.5">
                <h3 className="flex items-center gap-2 font-bold text-text-primary typo-body">
                  {variant.name}
                  {variant.isRecommended && (
                    <span className="rounded-8 bg-accent-avocado-flat px-1.5 py-0.5 text-accent-avocado-default typo-caption1">
                      Recommended
                    </span>
                  )}
                </h3>
                <p className="text-text-secondary typo-callout">
                  {variant.change}
                </p>
                <p className="text-text-tertiary typo-callout">{variant.why}</p>
              </div>
              <div className="flex flex-wrap items-end gap-8">
                <SizedCell size="l">
                  <HappeningVariant variant={variant} size="l" />
                </SizedCell>
                <SizedCell size="m">
                  <HappeningVariant variant={variant} size="m" />
                </SizedCell>
              </div>
            </section>
          ))}
        </div>
      </Case>
    </Page>
  );
};
