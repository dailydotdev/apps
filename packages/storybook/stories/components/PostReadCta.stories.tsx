import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
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
import {
  OpenLinkIcon,
  ArrowIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

/**
 * Design-review playground (not shipping UI). Deeper exploration of the three
 * favoured directions for the "read the full article" CTA in `PostFocusCard`:
 *   A — big button, left
 *   B — big button + source meta
 *   E — icon tile + stacked text
 * Each direction gets a few refinements so we can converge on one. Shown right
 * after the last line of the TL;DR.
 */

const DOMAIN = 'pragmaticengineer.com';

type Variant = { key: string; name: string; node: ReactElement };
type Group = { letter: string; title: string; blurb: string; variants: Variant[] };

const bigButton = (
  label: string,
  size: ButtonSize = ButtonSize.Large,
  className = 'w-fit',
): ReactElement => (
  <Button
    tag="a"
    href="#"
    variant={ButtonVariant.Primary}
    size={size}
    icon={<OpenLinkIcon />}
    iconPosition={ButtonIconPosition.Right}
    className={className}
  >
    {label}
  </Button>
);

const groups: Group[] = [
  {
    letter: 'A',
    title: 'Big button, left',
    blurb: 'One confident button leading the row. Exploring label and size.',
    variants: [
      { key: 'A1', name: 'Large · generic label', node: bigButton('Read the full article') },
      { key: 'A2', name: 'XLarge · punchy', node: bigButton('Read article', ButtonSize.XLarge) },
      { key: 'A3', name: 'Large · names the source', node: bigButton(`Read the full article on ${DOMAIN}`) },
    ],
  },
  {
    letter: 'B',
    title: 'Big button + source meta',
    blurb: 'Large button leading; source + read time supporting it on the right.',
    variants: [
      {
        key: 'B1',
        name: 'Stacked meta',
        node: (
          <div className="flex w-fit items-center gap-4">
            {bigButton('Read article')}
            <span className="flex flex-col">
              <span className="font-bold text-text-primary typo-callout">
                {DOMAIN}
              </span>
              <span className="text-text-tertiary typo-footnote">
                6 min read
              </span>
            </span>
          </div>
        ),
      },
      {
        key: 'B2',
        name: 'Divider + single line',
        node: (
          <div className="flex w-fit items-center gap-4">
            {bigButton('Read article')}
            <span className="h-8 w-px bg-border-subtlest-tertiary" />
            <span className="text-text-tertiary typo-callout">
              <span className="font-bold text-text-primary">{DOMAIN}</span> · 6
              min read
            </span>
          </div>
        ),
      },
      {
        key: 'B3',
        name: 'Lead-in copy + button',
        node: (
          <div className="flex w-fit items-center gap-4">
            <span className="text-text-tertiary typo-callout">
              Continue on{' '}
              <span className="font-bold text-text-primary">{DOMAIN}</span>
            </span>
            {bigButton('Read article')}
          </div>
        ),
      },
    ],
  },
  {
    letter: 'E',
    title: 'Icon tile + stacked text',
    blurb: 'App-row feel — a tile leads, action + source stacked beside it.',
    variants: [
      {
        key: 'E1',
        name: 'Subtle tile',
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
        key: 'E2',
        name: 'Outline tile',
        node: (
          <a href="#" className="flex w-fit items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-16 border border-border-subtlest-tertiary text-text-link">
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
        key: 'E3',
        name: 'List row + trailing arrow + hover',
        node: (
          <a
            href="#"
            className="-mx-2 flex w-full items-center gap-4 rounded-16 px-2 py-2 transition-colors hover:bg-surface-float"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-16 bg-surface-float text-text-primary">
              <OpenLinkIcon size={IconSize.Large} />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="font-bold text-text-primary typo-body">
                Read the full article
              </span>
              <span className="text-text-tertiary typo-footnote">
                {DOMAIN} · 6 min read
              </span>
            </span>
            <ArrowIcon
              size={IconSize.Small}
              className="rotate-90 text-text-tertiary"
            />
          </a>
        ),
      },
    ],
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
    <div className="flex w-full max-w-[560px] flex-col gap-4">
      <Typography type={TypographyType.Body} color={TypographyColor.Secondary}>
        …and here&apos;s the timeline, the root cause, and the three guardrails
        the team added so a single index can&apos;t take down checkout again.
      </Typography>
      {variant.node}
    </div>
  </div>
);

const GroupBlock = ({ group }: { group: Group }): ReactElement => (
  <section className="border-t border-border-subtlest-tertiary pt-8">
    <div className="flex items-baseline gap-3">
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        {group.letter} · {group.title}
      </Typography>
    </div>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="mt-1 max-w-[62ch]"
    >
      {group.blurb}
    </Typography>
    <div className="mt-2 flex flex-col divide-y divide-border-subtlest-tertiary">
      {group.variants.map((variant) => (
        <VariantRow key={variant.key} variant={variant} />
      ))}
    </div>
  </section>
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
    <div className="mx-auto flex min-h-screen max-w-[760px] flex-col gap-10 bg-background-default px-8 py-10 text-text-primary">
      <div>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Read-the-article CTA — A · B · E, refined
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mt-2 max-w-[64ch]"
        >
          Deeper takes on the three favoured directions. Pick a row; the chosen
          one ships in PostFocusCard after the summary.
        </Typography>
      </div>
      {groups.map((group) => (
        <GroupBlock key={group.letter} group={group} />
      ))}
    </div>
  ),
};
