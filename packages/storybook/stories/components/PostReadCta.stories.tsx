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
 * led by a square, primary open-link button (no trailing arrow) — in two
 * stories:
 *   • "All variants" — interface-feel motion (jakub.kr spirit): hover/press
 *     micro-interactions. M1 (icon lift-off) + M2 (tile pop) ship in
 *     PostFocusCard.
 *   • "Prominent" — the same expression turned up: filled rows, a full primary
 *     block, an XL tile, and a bordered card.
 * Shown right after the last line of the TL;DR.
 */

const DOMAIN = 'pragmaticengineer.com';

const EASE_SNAP = 'ease-[cubic-bezier(0.2,0.7,0.2,1)]';
const EASE_SPRING = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]';

const nudge = classNames(
  'transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none',
  EASE_SNAP,
);

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

// Decorative primary tile (a span, not a button) for the prominent rows where
// the row itself is the link.
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

const Text = (): ReactElement => (
  <span className="flex flex-1 flex-col">
    <span className="font-bold text-text-primary typo-body">
      Read the full article
    </span>
    <span className="text-text-tertiary typo-footnote">
      {DOMAIN} · 6 min read
    </span>
  </span>
);

const baseRow =
  'group -mx-2 flex w-full items-center gap-4 rounded-16 px-2 py-2 hover:bg-surface-float';

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
      className={classNames(baseRow, 'transition-colors duration-200', EASE_SNAP)}
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
      <Text />
    </a>
  );
};

type Variant = { key: string; name: string; node: ReactElement };

const motionVariants: Variant[] = [
  {
    key: 'M1',
    name: 'Icon lift-off — the arrow leaves on hover',
    node: (
      <a
        href="#"
        className={classNames(
          baseRow,
          'w-fit transition-[background-color,transform] duration-200 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <Tile iconClassName={nudge} />
        <Text />
      </a>
    ),
  },
  {
    key: 'M2',
    name: 'Tile pop — springy scale + soft shadow',
    node: (
      <a
        href="#"
        className={classNames(
          baseRow,
          'w-fit transition-colors duration-200 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <Tile
          className={classNames(
            'transition-transform duration-200 group-hover:scale-[1.06] group-hover:shadow-2 motion-reduce:transition-none',
            EASE_SPRING,
          )}
        />
        <Text />
      </a>
    ),
  },
  {
    key: 'M1+M2',
    name: 'Combined — lift-off + pop (ships in PostFocusCard)',
    node: (
      <a
        href="#"
        className={classNames(
          baseRow,
          'w-fit transition-[background-color,transform] duration-200 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <Tile
          iconClassName={nudge}
          className={classNames(
            'transition-transform duration-200 group-hover:scale-[1.06] group-hover:shadow-2 motion-reduce:transition-none',
            EASE_SPRING,
          )}
        />
        <Text />
      </a>
    ),
  },
  {
    key: 'M4',
    name: 'Magnetic — the tile follows your cursor',
    node: <MagneticRow />,
  },
];

const prominentVariants: Variant[] = [
  {
    key: 'P1',
    name: 'Filled row — always tinted, full width',
    node: (
      <a
        href="#"
        className={classNames(
          'group flex w-full items-center gap-4 rounded-16 bg-surface-float px-4 py-3 transition-[background-color,transform] duration-200 hover:bg-surface-hover active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
        <SpanTile />
        <Text />
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
        <span className="font-bold typo-body">
          Read the full article on {DOMAIN}
        </span>
      </a>
    ),
  },
  {
    key: 'P3',
    name: 'XL tile + bigger heading',
    node: (
      <a
        href="#"
        className={classNames(
          baseRow,
          'w-fit transition-[background-color,transform] duration-200 active:scale-[0.99] motion-reduce:transition-none',
          EASE_SNAP,
        )}
      >
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
        <Text />
      </a>
    ),
  },
];

const VariantRow = ({ variant }: { variant: Variant }): ReactElement => (
  <div className="flex flex-col gap-4 py-7">
    <div className="flex items-baseline gap-3">
      <span className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 font-mono text-text-quaternary typo-footnote">
        {variant.key}
      </span>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
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
      blurb="A list row led by a square primary open-link tile (no trailing arrow). Hover each row for the interface-feel motion. M1 + M2 combined ships in PostFocusCard."
      list={motionVariants}
    />
  ),
};

export const Prominent: Story = {
  name: 'Prominent',
  render: () => (
    <Page
      title="Read-the-article CTA — prominent takes"
      blurb="The same primary-tile expression, turned up: an always-filled row, a full primary block, an XL tile, and a bordered card. Same hover/press feel."
      list={prominentVariants}
    />
  ),
};
