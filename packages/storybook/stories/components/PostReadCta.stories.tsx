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
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

/**
 * Design-review playground (not shipping UI). Explores the flat "read the full
 * article" call-to-action that sits right after the TL;DR in `PostFocusCard`.
 *
 * Constraints from the brief: flat (no box / border / fill), no source image
 * (the avatar already shows at the top), and the read button hugging the
 * descriptive text — close to it, not pushed to a far edge. Each variant is
 * shown exactly where it lives: directly under the last line of the summary.
 */

const DOMAIN = 'pragmaticengineer.com';

const ReadText = ({
  emphasizeDomain = false,
}: {
  emphasizeDomain?: boolean;
}): ReactElement => (
  <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
    Read the full article on{' '}
    {emphasizeDomain ? (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
      >
        {DOMAIN}
      </Typography>
    ) : (
      DOMAIN
    )}
  </Typography>
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
    name: 'Solid primary',
    note: 'Highest emphasis. The button clearly is the action; reads as the obvious exit.',
    node: (
      <div className="flex w-fit items-center gap-3">
        <ReadText />
        <Button
          tag="a"
          href="#"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Read post
        </Button>
      </div>
    ),
  },
  {
    key: 'B',
    name: 'Subtle button',
    note: 'Quieter — blends into the reading flow while still being a real button.',
    node: (
      <div className="flex w-fit items-center gap-3">
        <ReadText />
        <Button
          tag="a"
          href="#"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Read post
        </Button>
      </div>
    ),
  },
  {
    key: 'C',
    name: 'Secondary outline',
    note: 'Outlined button — medium emphasis, crisp edge without a heavy fill.',
    node: (
      <div className="flex w-fit items-center gap-3">
        <ReadText />
        <Button
          tag="a"
          href="#"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Read post
        </Button>
      </div>
    ),
  },
  {
    key: 'D',
    name: 'Emphasized domain + solid',
    note: 'Domain bolded in primary so the source pops next to the muted lead-in.',
    node: (
      <div className="flex w-fit items-center gap-3">
        <ReadText emphasizeDomain />
        <Button
          tag="a"
          href="#"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Read post
        </Button>
      </div>
    ),
  },
  {
    key: 'E',
    name: 'Icon-only button',
    note: 'Tightest pairing — text plus a compact icon button. Most "blended".',
    node: (
      <div className="flex w-fit items-center gap-2.5">
        <ReadText />
        <Button
          tag="a"
          href="#"
          aria-label="Read post"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
        />
      </div>
    ),
  },
  {
    key: 'F',
    name: 'Inline link (no button)',
    note: 'Lightest touch — one clickable line, domain in the link colour, trailing arrow. No button at all.',
    node: (
      <a
        href="#"
        className="inline-flex w-fit items-center gap-1.5 text-text-tertiary typo-callout"
      >
        Read the full article on{' '}
        <span className="text-text-link underline">{DOMAIN}</span>
        <OpenLinkIcon size={IconSize.Size16} />
      </a>
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
      className="max-w-[60ch]"
    >
      {variant.note}
    </Typography>
    {/* Shown in context: the last line of the summary, then the CTA below it. */}
    <div className="mt-2 flex max-w-[640px] flex-col gap-4">
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
        Flat read-the-article CTA
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="mt-2 max-w-[64ch]"
      >
        Flat, no box, no source image — the read button sits right beside the
        text. Pick a direction; the chosen one ships in PostFocusCard after the
        summary.
      </Typography>
      <div className="mt-4 flex flex-col">
        {variants.map((variant) => (
          <Row key={variant.key} variant={variant} />
        ))}
      </div>
    </div>
  ),
};
