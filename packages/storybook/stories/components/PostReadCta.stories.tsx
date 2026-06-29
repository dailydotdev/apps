import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonIconPosition,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { OpenLinkIcon, ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

/**
 * Design-review playground (not shipping UI). Bolder, layout-led directions for
 * the "read the full article" CTA in `PostFocusCard` — these change the
 * composition and placement of the action, not just the button's colour. Each
 * is shown where it lives: right after the last line of the TL;DR.
 */

const DOMAIN = 'pragmaticengineer.com';

const Lead = (): ReactElement => (
  <span className="text-text-tertiary typo-callout">
    Read the full article on{' '}
    <span className="font-bold text-text-primary">{DOMAIN}</span>
  </span>
);

type Variant = {
  key: string;
  name: string;
  note: string;
  node: ReactElement;
};

const variants: Variant[] = [
  {
    key: 'A',
    name: 'Big button, left',
    note: 'One large, confident button leading the row — unmissable, reads as the primary action.',
    node: (
      <Button
        tag="a"
        href="#"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        icon={<OpenLinkIcon />}
        iconPosition={ButtonIconPosition.Right}
        className="w-fit"
      >
        Read the full article
      </Button>
    ),
  },
  {
    key: 'B',
    name: 'Big button + source meta',
    note: 'Large button on the left; the source and read time sit quietly to its right.',
    node: (
      <div className="flex w-fit items-center gap-4">
        <Button
          tag="a"
          href="#"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Read article
        </Button>
        <span className="flex flex-col">
          <span className="font-bold text-text-primary typo-callout">
            {DOMAIN}
          </span>
          <span className="text-text-tertiary typo-footnote">6 min read</span>
        </span>
      </div>
    ),
  },
  {
    key: 'C',
    name: 'Full-width block',
    note: 'The whole strip is the button: label hugging the left, arrow pinned right. Maximum target.',
    node: (
      <Button
        tag="a"
        href="#"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        icon={<OpenLinkIcon />}
        iconPosition={ButtonIconPosition.Right}
        className="w-full !justify-between"
      >
        Read the full article on {DOMAIN}
      </Button>
    ),
  },
  {
    key: 'D',
    name: 'Text left, round arrow right',
    note: 'Reads like a row you advance through — copy on the left, a big circular “go” on the far right.',
    node: (
      <div className="flex w-full items-center justify-between gap-4">
        <Lead />
        <Button
          tag="a"
          href="#"
          aria-label="Read the full article"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<ArrowIcon className="rotate-90" />}
          className="!rounded-full"
        />
      </div>
    ),
  },
  {
    key: 'E',
    name: 'Icon tile + stacked text',
    note: 'App-row feel — a large open-link tile leads, with the action and source stacked beside it. Whole row is the link.',
    node: (
      <a href="#" className="flex w-fit items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-16 bg-surface-float text-text-primary">
          <OpenLinkIcon size={IconSize.Large} />
        </span>
        <span className="flex flex-col">
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
    key: 'F',
    name: 'Centered, with caption',
    note: 'A confident centered button with a one-line caption — feels like an intentional “end of summary” moment.',
    node: (
      <div className="flex flex-col items-center gap-2 py-1">
        <Button
          tag="a"
          href="#"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Read on {DOMAIN}
        </Button>
        <span className="text-text-tertiary typo-footnote">
          Opens the original article
        </span>
      </div>
    ),
  },
];

const Row = ({ variant }: { variant: Variant }): ReactElement => (
  <div className="flex flex-col gap-4 border-b border-border-subtlest-tertiary py-8 last:border-b-0">
    <div className="flex items-baseline gap-3">
      <span className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 font-mono text-text-quaternary typo-footnote">
        {variant.key}
      </span>
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {variant.name}
      </Typography>
    </div>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="max-w-[62ch]"
    >
      {variant.note}
    </Typography>
    {/* In context: the last line of the summary, then the CTA below it. */}
    <div className="mt-2 flex w-full max-w-[560px] flex-col gap-4">
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
        Read-the-article CTA — layout directions
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="mt-2 max-w-[64ch]"
      >
        Different compositions and placements for the action, not just button
        styles. Pick a direction; the chosen one ships in PostFocusCard after
        the summary.
      </Typography>
      <div className="mt-4 flex flex-col">
        {variants.map((variant) => (
          <Row key={variant.key} variant={variant} />
        ))}
      </div>
    </div>
  ),
};
