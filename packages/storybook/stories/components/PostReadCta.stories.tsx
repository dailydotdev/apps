import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
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
import {
  OpenLinkIcon,
  ArrowIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

/**
 * Design-review playground (not shipping UI). The converged direction for the
 * "read the full article" CTA in `PostFocusCard`: a list row (E3) led by a
 * square, primary-coloured open-link button (E2), action + source stacked
 * beside it, with a whole-row hover. A few refinements to pick the final form.
 * Shown right after the last line of the TL;DR.
 */

const DOMAIN = 'pragmaticengineer.com';

const PrimaryTile = ({
  size = ButtonSize.Large,
}: {
  size?: ButtonSize;
}): ReactElement => (
  <Button
    tag="a"
    href="#"
    aria-label="Read the full article"
    variant={ButtonVariant.Primary}
    size={size}
    icon={<OpenLinkIcon />}
    className="!rounded-16 shrink-0"
  />
);

const TrailingArrow = (): ReactElement => (
  <ArrowIcon
    size={IconSize.Small}
    className="rotate-90 text-text-tertiary"
    aria-hidden
  />
);

type Variant = { key: string; name: string; node: ReactElement };

const rowClass =
  '-mx-2 flex w-full items-center gap-4 rounded-16 px-2 py-2 transition-colors hover:bg-surface-float';

const variants: Variant[] = [
  {
    key: 'T1',
    name: 'Large tile · two-line · trailing arrow',
    node: (
      <a href="#" className={rowClass}>
        <PrimaryTile />
        <span className="flex flex-1 flex-col">
          <span className="font-bold text-text-primary typo-body">
            Read the full article
          </span>
          <span className="text-text-tertiary typo-footnote">
            {DOMAIN} · 6 min read
          </span>
        </span>
        <TrailingArrow />
      </a>
    ),
  },
  {
    key: 'T2',
    name: 'XLarge tile · two-line · no arrow',
    node: (
      <a href="#" className={rowClass}>
        <PrimaryTile size={ButtonSize.XLarge} />
        <span className="flex flex-1 flex-col">
          <span className="font-bold text-text-primary typo-body">
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
    key: 'T3',
    name: 'Large tile · single line · trailing arrow',
    node: (
      <a href="#" className={rowClass}>
        <PrimaryTile />
        <span className="flex-1 text-text-primary typo-body">
          Read the full article on{' '}
          <span className="font-bold">{DOMAIN}</span>
        </span>
        <TrailingArrow />
      </a>
    ),
  },
  {
    key: 'T4',
    name: 'Contained row · hairline border',
    node: (
      <a
        href="#"
        className="flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary"
      >
        <PrimaryTile />
        <span className="flex flex-1 flex-col">
          <span className="font-bold text-text-primary typo-body">
            Read the full article
          </span>
          <span className="text-text-tertiary typo-footnote">
            {DOMAIN} · 6 min read
          </span>
        </span>
        <TrailingArrow />
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
        Read-the-article CTA — primary tile row
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="mt-2 max-w-[64ch]"
      >
        A list row led by a square, primary-coloured open-link button, action
        and source stacked beside it, with a whole-row hover. Pick the final
        form; it ships in PostFocusCard after the summary.
      </Typography>
      <div className="mt-4 flex flex-col divide-y divide-border-subtlest-tertiary">
        {variants.map((variant) => (
          <VariantRow key={variant.key} variant={variant} />
        ))}
      </div>
    </div>
  ),
};
