import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

/**
 * Design-review playground (not shipping UI). The chosen direction — a list row
 * led by a square, primary open-link tile — across three stories:
 *   • All variants — interface-feel motion (jakub.kr spirit). M1 + M2 ship.
 *   • Prominent — the same expression turned up.
 *   • M2 variations — ten takes on the springy-tile-pop row, no source name.
 * Shown right after the last line of the TL;DR.
 */

const DOMAIN = 'pragmaticengineer.com';

const EASE_SNAP = 'ease-[cubic-bezier(0.2,0.7,0.2,1)]';
const EASE_SPRING = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]';

const nudge = classNames(
  'transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none',
  EASE_SNAP,
);

// Decorative primary tile (a span, not a button) — the row itself is the link.
// Built-in springy pop (M2) + icon lift-off (M1) on group hover.
const SpanTile = ({
  sizeClass = 'size-12',
  iconSize = IconSize.Large,
}: {
  sizeClass?: string;
  iconSize?: IconSize;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'grid shrink-0 place-items-center rounded-16 bg-text-primary text-surface-invert transition-transform duration-200 group-hover:scale-[1.06] group-hover:shadow-2 motion-reduce:transition-none',
      sizeClass,
      EASE_SPRING,
    )}
  >
    <OpenLinkIcon size={iconSize} className={nudge} />
  </span>
);

// Button-based tile for the motion story (keeps the real primary button look).
const Tile = ({
  iconClassName,
  className,
}: {
  iconClassName?: string;
  className?: string;
}): ReactElement => (
  <Button
    tag="a"
    href="#"
    aria-label="Read the full article"
    variant={ButtonVariant.Primary}
    size={ButtonSize.Large}
    icon={<OpenLinkIcon className={iconClassName} />}
    className={classNames('!rounded-16 shrink-0', className)}
  />
);

const SourceText = (): ReactElement => (
  <span className="flex flex-1 flex-col">
    <span className="font-bold text-text-primary typo-body">
      Read the full article
    </span>
    <span className="text-text-tertiary typo-footnote">
      {DOMAIN} · 6 min read
    </span>
  </span>
);

const row =
  'group -mx-2 flex items-center gap-4 rounded-16 px-2 py-2 transition-[background-color,transform] duration-200 active:scale-[0.99] motion-reduce:transition-none';

const MagneticRow = (): ReactElement => {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.MouseEvent): void => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
  };
  const reset = (): void => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0, 0)';
    }
  };
  return (
    <a
      href="#"
      className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      <span
        ref={ref}
        className={classNames(
          'shrink-0 transition-transform duration-300',
          EASE_SPRING,
        )}
      >
        <Tile iconClassName="transition-transform duration-200" />
      </span>
      <SourceText />
    </a>
  );
};

type Variant = { key: string; name: string; node: ReactElement };

const motionVariants: Variant[] = [
  {
    key: 'M1',
    name: 'Icon lift-off',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <Tile iconClassName={nudge} />
        <SourceText />
      </a>
    ),
  },
  {
    key: 'M2',
    name: 'Tile pop — springy scale + soft shadow',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <Tile
          className={classNames(
            'transition-transform duration-200 group-hover:scale-[1.06] group-hover:shadow-2 motion-reduce:transition-none',
            EASE_SPRING,
          )}
        />
        <SourceText />
      </a>
    ),
  },
  {
    key: 'M1+M2',
    name: 'Combined — ships in PostFocusCard',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <Tile
          iconClassName={nudge}
          className={classNames(
            'transition-transform duration-200 group-hover:scale-[1.06] group-hover:shadow-2 motion-reduce:transition-none',
            EASE_SPRING,
          )}
        />
        <SourceText />
      </a>
    ),
  },
  { key: 'M4', name: 'Magnetic — tile follows the cursor', node: <MagneticRow /> },
];

const prominentVariants: Variant[] = [
  {
    key: 'P1',
    name: 'Filled row — always tinted, full width',
    node: (
      <a href="#" className={classNames(row, 'w-full bg-surface-float !px-4 !py-3 hover:bg-surface-hover', EASE_SNAP)}>
        <SpanTile />
        <SourceText />
      </a>
    ),
  },
  {
    key: 'P2',
    name: 'Primary block — the whole row is the button',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-full items-center gap-3 rounded-16 bg-text-primary px-5 py-4 text-surface-invert transition-transform duration-200 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <OpenLinkIcon size={IconSize.Large} className={classNames('shrink-0', nudge)} />
        <span className="font-bold typo-body">Read the full article on {DOMAIN}</span>
      </a>
    ),
  },
  {
    key: 'P3',
    name: 'XL tile + bigger heading',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <SpanTile sizeClass="size-14" iconSize={IconSize.XLarge} />
        <span className="flex flex-col">
          <span className="font-bold text-text-primary typo-title3">
            Read the full article
          </span>
          <span className="text-text-tertiary typo-footnote">
            {DOMAIN} · 6 min read
          </span>
        </span>
      </a>
    ),
  },
  {
    key: 'P4',
    name: 'Bordered card row',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-4 transition-[background-color,transform] duration-200 hover:bg-surface-float active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <SpanTile />
        <SourceText />
      </a>
    ),
  },
];

// Ten takes on the M2 row, with the source name dropped.
const Action = ({ className }: { className?: string }): ReactElement => (
  <span className={classNames('font-bold text-text-primary', className ?? 'typo-body')}>
    Read the full article
  </span>
);

const m2Variants: Variant[] = [
  {
    key: '01',
    name: 'Single line, left',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <SpanTile />
        <Action />
      </a>
    ),
  },
  {
    key: '02',
    name: 'Two-line — action + read time',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <SpanTile />
        <span className="flex flex-col">
          <Action />
          <span className="text-text-tertiary typo-footnote">6 min read</span>
        </span>
      </a>
    ),
  },
  {
    key: '03',
    name: 'XL tile + title heading',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <SpanTile sizeClass="size-14" iconSize={IconSize.XLarge} />
        <Action className="typo-title3" />
      </a>
    ),
  },
  {
    key: '04',
    name: 'Filled row, full width',
    node: (
      <a href="#" className={classNames(row, 'w-full bg-surface-float !px-4 !py-3 hover:bg-surface-hover', EASE_SNAP)}>
        <SpanTile />
        <Action className="flex-1 typo-body" />
      </a>
    ),
  },
  {
    key: '05',
    name: 'Primary block · w-fit · source + read time (ships)',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-fit items-center gap-3 rounded-16 bg-text-primary px-5 py-3 text-surface-invert transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-3 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SPRING,
        )}
      >
        <OpenLinkIcon size={IconSize.Large} className={classNames('shrink-0', nudge)} />
        <span className="flex flex-col">
          <span className="font-bold typo-body">Read the full article</span>
          <span className="opacity-70 typo-footnote">{DOMAIN} · 6 min read</span>
        </span>
      </a>
    ),
  },
  {
    key: '05b',
    name: 'Primary block · w-fit · read time only',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-fit items-center gap-3 rounded-16 bg-text-primary px-5 py-3 text-surface-invert transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-3 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SPRING,
        )}
      >
        <OpenLinkIcon size={IconSize.Large} className={classNames('shrink-0', nudge)} />
        <span className="flex flex-col">
          <span className="font-bold typo-body">Read the full article</span>
          <span className="opacity-70 typo-footnote">6 min read</span>
        </span>
      </a>
    ),
  },
  {
    key: '06',
    name: 'Tile on the right',
    node: (
      <a href="#" className={classNames(row, 'w-fit hover:bg-surface-float', EASE_SNAP)}>
        <Action />
        <SpanTile />
      </a>
    ),
  },
  {
    key: '07',
    name: 'Centered',
    node: (
      <a href="#" className={classNames(row, 'mx-auto w-fit hover:bg-surface-float', EASE_SNAP)}>
        <SpanTile />
        <Action />
      </a>
    ),
  },
  {
    key: '08',
    name: 'Full width — tile pinned right',
    node: (
      <a href="#" className={classNames(row, 'w-full justify-between hover:bg-surface-float', EASE_SNAP)}>
        <Action className="typo-body" />
        <SpanTile />
      </a>
    ),
  },
  {
    key: '09',
    name: 'Bordered card',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-4 transition-[background-color,transform] duration-200 hover:bg-surface-float active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <SpanTile />
        <Action className="flex-1 typo-body" />
      </a>
    ),
  },
  {
    key: '10',
    name: 'Compact pill',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-fit items-center gap-3 rounded-16 bg-surface-float px-3 py-2 transition-[background-color,transform] duration-200 hover:bg-surface-hover active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <SpanTile sizeClass="size-9" iconSize={IconSize.Medium} />
        <Action className="typo-callout" />
      </a>
    ),
  },
];

// Ten takes on the 05 primary block: softer label colours, icon on either
// side, and optical padding (a touch more room opposite the icon).
const blockBase =
  'group flex w-fit items-center rounded-16 bg-text-primary text-surface-invert transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-3 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none';

const BlockIcon = (): ReactElement => (
  <OpenLinkIcon size={IconSize.Large} className={classNames('shrink-0', nudge)} />
);

const Block = ({
  iconRight = false,
  titleClass = 'font-medium',
  subtitle,
  pad = 'pl-5 pr-6 py-3',
  gap = 'gap-3',
}: {
  iconRight?: boolean;
  titleClass?: string;
  subtitle?: string;
  pad?: string;
  gap?: string;
}): ReactElement => (
  <a href="#" className={classNames(blockBase, gap, pad, EASE_SPRING)}>
    {!iconRight && <BlockIcon />}
    <span className="flex flex-col">
      <span className={classNames('typo-body', titleClass)}>
        Read the full article
      </span>
      {subtitle && <span className="opacity-60 typo-footnote">{subtitle}</span>}
    </span>
    {iconRight && <BlockIcon />}
  </a>
);

const SOURCE = `${DOMAIN} · 6 min read`;

const block05Variants: Variant[] = [
  { key: '01', name: 'Icon left · medium weight', node: <Block subtitle={SOURCE} /> },
  {
    key: '02',
    name: 'Icon left · secondary (80%)',
    node: <Block titleClass="font-medium opacity-80" subtitle={SOURCE} />,
  },
  {
    key: '03',
    name: 'Icon left · tertiary (65%)',
    node: <Block titleClass="font-medium opacity-[0.65]" subtitle={SOURCE} />,
  },
  {
    key: '04',
    name: 'Icon left · roomy right gap',
    node: <Block pad="pl-5 pr-8 py-3" gap="gap-4" subtitle={SOURCE} />,
  },
  { key: '05', name: 'Icon left · single line', node: <Block /> },
  {
    key: '06',
    name: 'Icon right · medium weight',
    node: <Block iconRight pad="pl-6 pr-5 py-3" subtitle={SOURCE} />,
  },
  {
    key: '07',
    name: 'Icon right · bold',
    node: <Block iconRight titleClass="font-bold" pad="pl-6 pr-5 py-3" subtitle={SOURCE} />,
  },
  {
    key: '08',
    name: 'Icon right · secondary (80%)',
    node: (
      <Block
        iconRight
        titleClass="font-medium opacity-80"
        pad="pl-6 pr-5 py-3"
        subtitle={SOURCE}
      />
    ),
  },
  {
    key: '09',
    name: 'Icon right · single line',
    node: <Block iconRight pad="pl-6 pr-5 py-3" />,
  },
  {
    key: '10',
    name: 'Icon right · roomy · read time only',
    node: <Block iconRight pad="pl-7 pr-5 py-3" gap="gap-4" subtitle="6 min read" />,
  },
];

const VariantRow = ({ variant }: { variant: Variant }): ReactElement => (
  <div className="flex flex-col gap-4 py-7">
    <div className="flex items-baseline gap-3">
      <span className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 font-mono text-text-quaternary typo-footnote">
        {variant.key}
      </span>
      <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
        {variant.name}
      </Typography>
    </div>
    <div className="flex w-full max-w-[540px] flex-col gap-4">
      <Typography type={TypographyType.Body} color={TypographyColor.Secondary}>
        …and here&apos;s the timeline, the root cause, and the three guardrails
        the team added so a single index can&apos;t take down checkout again.
      </Typography>
      {variant.node}
    </div>
  </div>
);

const Page = ({
  title,
  blurb,
  list,
}: {
  title: string;
  blurb: string;
  list: Variant[];
}): ReactElement => (
  <div className="mx-auto flex min-h-screen max-w-[760px] flex-col bg-background-default px-8 py-10 text-text-primary">
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Title2}
      color={TypographyColor.Primary}
      bold
    >
      {title}
    </Typography>
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
      className="mt-2 max-w-[64ch]"
    >
      {blurb}
    </Typography>
    <div className="mt-4 flex flex-col divide-y divide-border-subtlest-tertiary">
      {list.map((variant) => (
        <VariantRow key={variant.key} variant={variant} />
      ))}
    </div>
  </div>
);

const meta: Meta = {
  title: 'Components/Post/Read CTA variants',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
};

export default meta;

type Story = StoryObj;

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <Page
      title="Read-the-article CTA — primary tile row, with feel"
      blurb="A list row led by a square primary open-link tile. Hover for the interface-feel motion. M1 + M2 combined ships in PostFocusCard."
      list={motionVariants}
    />
  ),
};

export const Prominent: Story = {
  name: 'Prominent',
  render: () => (
    <Page
      title="Read-the-article CTA — prominent takes"
      blurb="The same primary-tile expression, turned up. Same hover/press feel."
      list={prominentVariants}
    />
  ),
};

export const M2Variations: Story = {
  name: 'M2 variations',
  render: () => (
    <Page
      title="Read-the-article CTA — M2, ten ways"
      blurb="Ten takes on the springy-tile-pop row, source name dropped. All share the primary tile + pop + icon lift-off."
      list={m2Variants}
    />
  ),
};

export const Block05Variations: Story = {
  name: '05 explorations',
  render: () => (
    <Page
      title="Read-the-article CTA — 05, ten ways"
      blurb="The primary block from 05 with a softer label (medium weight / secondary / tertiary), icon on the left or right, and optical padding (more room opposite the icon). Hover for the lift + icon nudge."
      list={block05Variants}
    />
  ),
};
