import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { AdList } from '@dailydotdev/shared/src/components/cards/ad/AdList';
import { RemoveAd } from '@dailydotdev/shared/src/components/cards/ad/common/RemoveAd';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { featureFeedCardGlassActions } from '@dailydotdev/shared/src/lib/featureManagement';

import { AdProviders, Page, Section } from '../../experiments/adLabel.mocks';
import {
  adProps,
  longCopyAd,
  shortCopyAd,
  withFlags,
} from './adPlacements.mocks';

// ---------------------------------------------------------------------------
// Two fixes found while reviewing the ad placements against the post cards.
//
// 1. The list card kept RemoveAd's own Float default, so "Remove ads" sat on a
//    filled surface while the grid card rendered it flat.
// 2. The disclosure line ("Promoted by ...") is pushed down by a flex spacer
//    that collapses on a long creative, leaving it touching the ad copy.
//
// "Before" columns are the same components with the old value forced back, so
// the comparison is the real card, not a mock-up of it.
// ---------------------------------------------------------------------------

/**
 * The grid card had no margin above the disclosure; the list card had 8px.
 * Plain CSS rather than an arbitrary Tailwind variant: the JIT only scans class
 * names it has seen, and a value that exists nowhere else in the app would
 * silently produce no rule.
 */
const beforeGridSpacing = 'ad-fix-before-grid';
const beforeListSpacing = 'ad-fix-before-list';

const beforeStyles = `
  .${beforeGridSpacing} [data-testid='adAttribution'] { margin-top: 0 !important; }
  .${beforeListSpacing} [data-testid='adAttribution'] { margin-top: 0.5rem !important; }
`;

// Feed rows are as tall as the tallest card in them, and a grid ad card has no
// floor of its own, so it stretches to whatever the post cards next to it set:
// min-h-cardGlass on a glass row. Locking that height here is what makes the
// flex spacer behave the way it does in the feed.
const glassRowHeight = { height: '21.5rem' };

// List mode caps the feed at 42.5rem (FeedPageLayoutList). Inline rather than an
// arbitrary Tailwind width for the same JIT reason as the before-state rules.
const listWidth = { width: '42.5rem' };

const Column = ({
  title,
  note,
  tone = 'before',
  feedRow,
  children,
}: {
  title: string;
  note: string;
  tone?: 'before' | 'after';
  feedRow?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className="flex shrink-0 flex-col gap-2"
    style={{ width: 'fit-content', minWidth: '20rem' }}
  >
    <span
      className={
        tone === 'after'
          ? 'font-bold text-action-upvote-default typo-footnote'
          : 'font-bold text-accent-ketchup-default typo-footnote'
      }
    >
      {title}
    </span>
    <span className="min-h-8 text-text-tertiary typo-caption1">{note}</span>
    {feedRow ? (
      <div className="flex" style={glassRowHeight}>
        {children}
      </div>
    ) : (
      children
    )}
  </div>
);

const Row = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-row flex-nowrap items-start gap-8 overflow-x-auto pb-2">
    {children}
  </div>
);

const glassOn = { [featureFeedCardGlassActions.id]: true };

const SpacingSection = (): ReactElement => (
  <Section
    title="Space between the ad copy and the disclosure"
    description="The disclosure is pushed to the bottom of the card by a flex spacer. Whenever that spacer has nothing to give, the line lands right under the ad copy and reads as part of it. A minimum margin fixes the collapsed case and is absorbed in the roomy one, so nothing moves where it already looked right."
    note="Before columns force the old margin back on the same card, so exactly one property differs between the pair."
  >
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="font-bold text-text-primary typo-callout">
          Card at its own height, which is the reported case
        </span>
        <Row>
          <Column
            title="Before, long copy"
            note="Disclosure flush against the ad copy"
          >
            <div className={beforeGridSpacing}>
              {withFlags(glassOn, <AdGrid ad={longCopyAd} {...adProps} />)}
            </div>
          </Column>
          <Column
            title="After, long copy"
            note="12px of its own, so the line reads as metadata"
            tone="after"
          >
            {withFlags(glassOn, <AdGrid ad={longCopyAd} {...adProps} />)}
          </Column>
          <Column
            title="Before, short copy"
            note="Same problem: a short creative does not give the spacer room either"
          >
            <div className={beforeGridSpacing}>
              {withFlags(glassOn, <AdGrid ad={shortCopyAd} {...adProps} />)}
            </div>
          </Column>
          <Column
            title="After, short copy"
            note="Same 12px, so both creatives read the same"
            tone="after"
          >
            {withFlags(glassOn, <AdGrid ad={shortCopyAd} {...adProps} />)}
          </Column>
        </Row>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-bold text-text-primary typo-callout">
          Card stretched by a taller row, where the spacer already had room
        </span>
        <Row>
          <Column
            title="Before"
            note="Spacer pushes the disclosure to the bottom"
            feedRow
          >
            <div className={beforeGridSpacing}>
              {withFlags(glassOn, <AdGrid ad={shortCopyAd} {...adProps} />)}
            </div>
          </Column>
          <Column
            title="After"
            note="Identical: the margin only eats into the flexible space"
            tone="after"
            feedRow
          >
            {withFlags(glassOn, <AdGrid ad={shortCopyAd} {...adProps} />)}
          </Column>
        </Row>
      </div>
    </div>
  </Section>
);

const ListSection = (): ReactElement => (
  <Section
    title="List card: disclosure spacing and the remove control"
    description="The list card had 8px above the disclosure and rendered Remove ads on a filled surface, because it never passed a variant and RemoveAd defaults itself to Float. Both now match the grid card."
  >
    <div className="flex flex-col gap-6">
      <Row>
        <Column
          title="Before"
          note="8px above the disclosure. Only the spacing is reverted here: the remove control's old treatment is the pair below, since a class swap cannot be undone with CSS."
        >
          <div className={beforeListSpacing} style={listWidth}>
            <AdList ad={shortCopyAd} {...adProps} />
          </div>
        </Column>
      </Row>
      <Row>
        <Column
          title="After"
          note="12px above the disclosure, and the remove control flat like the grid card"
          tone="after"
        >
          <div style={listWidth}>
            <AdList ad={shortCopyAd} {...adProps} />
          </div>
        </Column>
      </Row>
    </div>
  </Section>
);

const RemoveControlSection = (): ReactElement => (
  <Section
    title="The remove control on its own"
    description="The same RemoveAd component with the variant each card used. The grid card always passed Tertiary; the list card passed nothing and inherited Float."
  >
    <Row>
      <Column title="Before, list card" note="ButtonVariant.Float (inherited)">
        <div className="flex rounded-12 border border-border-subtlest-tertiary p-4">
          <RemoveAd variant={ButtonVariant.Float} size={ButtonSize.Small} />
        </div>
      </Column>
      <Column
        title="After, list card"
        note="ButtonVariant.Tertiary, same as the grid card"
        tone="after"
      >
        <div className="flex rounded-12 border border-border-subtlest-tertiary p-4">
          <RemoveAd variant={ButtonVariant.Tertiary} size={ButtonSize.Small} />
        </div>
      </Column>
    </Row>
  </Section>
);

const AdCardFixesPage = (): ReactElement => (
  <AdProviders>
    <Page>
      <style>{beforeStyles}</style>
      <SpacingSection />
      <ListSection />
      <RemoveControlSection />
    </Page>
  </AdProviders>
);

const meta: Meta = {
  title: 'Components/Cards/Ad Card Fixes',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Before and after for two ad card fixes: the disclosure line touching the ad copy on a long creative, and the list card rendering the remove control on a filled surface while the grid card renders it flat.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const BeforeAndAfter: Story = {
  render: () => <AdCardFixesPage />,
  name: 'Before and after',
};

export const Spacing: Story = {
  render: () => (
    <AdProviders>
      <Page>
        <style>{beforeStyles}</style>
        <SpacingSection />
      </Page>
    </AdProviders>
  ),
  name: 'Disclosure spacing only',
};

export const RemoveControl: Story = {
  render: () => (
    <AdProviders>
      <Page>
        <style>{beforeStyles}</style>
        <ListSection />
        <RemoveControlSection />
      </Page>
    </AdProviders>
  ),
  name: 'Remove control only',
};
