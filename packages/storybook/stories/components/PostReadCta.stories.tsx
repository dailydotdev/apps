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

/**
 * Design-review playground (not shipping UI). The chosen direction — a list row
 * led by a square, primary open-link button (T1, no trailing arrow) — explored
 * with interface-feel motion in the spirit of jakub.kr: fast, springy,
 * purposeful micro-interactions on hover/press. Shown right after the TL;DR.
 */

const DOMAIN = 'pragmaticengineer.com';

// Snappy "settle" and a slight overshoot for the tactile bits.
const EASE_SNAP = 'ease-[cubic-bezier(0.2,0.7,0.2,1)]';
const EASE_SPRING = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]';

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

/**
 * Magnetic tile — the open-link button drifts a little toward the cursor as it
 * crosses the row, then springs home on leave. The jakub.kr "alive" touch.
 */
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

const variants: Variant[] = [
  {
    key: 'M1',
    name: 'Icon lift-off — the arrow leaves on hover',
    node: (
      <a
        href="#"
        className={classNames(
          baseRow,
          'transition-[background-color,transform] duration-200 active:scale-[0.99]',
          EASE_SNAP,
        )}
      >
        <Tile
          iconClassName={classNames(
            'transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
            EASE_SNAP,
          )}
        />
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
          'transition-colors duration-200 active:scale-[0.99]',
          EASE_SNAP,
        )}
      >
        <Tile
          className={classNames(
            'transition-transform duration-200 group-hover:scale-[1.06] group-hover:shadow-2',
            EASE_SPRING,
          )}
        />
        <Text />
      </a>
    ),
  },
  {
    key: 'M3',
    name: 'Glide — content advances, icon leans out',
    node: (
      <a
        href="#"
        className={classNames(
          baseRow,
          'transition-colors duration-200 active:scale-[0.99]',
          EASE_SNAP,
        )}
      >
        <span
          className={classNames(
            'flex flex-1 items-center gap-4 transition-transform duration-200 group-hover:translate-x-1',
            EASE_SNAP,
          )}
        >
          <Tile
            iconClassName={classNames(
              'transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
              EASE_SNAP,
            )}
          />
          <Text />
        </span>
      </a>
    ),
  },
  {
    key: 'M4',
    name: 'Magnetic — the tile follows your cursor',
    node: <MagneticRow />,
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
    <div className="mx-auto flex min-h-screen max-w-[760px] flex-col bg-background-default px-8 py-10 text-text-primary">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
      >
        Read-the-article CTA — primary tile row, with feel
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="mt-2 max-w-[64ch]"
      >
        T1 without the trailing arrow — the white open-link button already is
        the signal. Each row adds a different interface-feel touch (hover over
        them). Pick the motion; it ships in PostFocusCard after the summary.
      </Typography>
      <div className="mt-4 flex flex-col divide-y divide-border-subtlest-tertiary">
        {variants.map((variant) => (
          <VariantRow key={variant.key} variant={variant} />
        ))}
      </div>
    </div>
  ),
};
