import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MenuIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import {
  AVATAR,
  Category,
  Control,
  OverflowMenu,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'menu' | 'beside' | 'labeled';

const TopicHeader = ({
  spot,
  eyebrow,
  title,
  meta,
  cta,
  round,
  menu,
  highlight,
}: {
  spot: Spot;
  eyebrow?: string;
  title: string;
  meta: string;
  cta: string;
  round?: boolean;
  /** The production menu items for this surface. */
  menu: string[];
  /** Omitted where the menu carries no share action. */
  highlight?: string;
}) => (
  <Screen>
    <div className="relative flex items-center gap-3 p-4">
      <div
        className={`size-10 shrink-0 bg-surface-float ${
          round ? 'rounded-full' : 'rounded-10'
        }`}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {eyebrow && (
          <span className="font-bold uppercase text-text-quaternary typo-caption2">
            {eyebrow}
          </span>
        )}
        <span className="truncate font-bold text-text-primary typo-callout">
          {title}
        </span>
        <span className="truncate text-text-tertiary typo-caption1">
          {meta}
        </span>
      </div>
      {spot === 'beside' && (
        <Control action="Link" variant={ButtonVariant.Float} />
      )}
      {spot === 'labeled' && (
        <Control action="Link" label variant={ButtonVariant.Secondary} />
      )}
      <Button
        icon={<PlusIcon />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
      >
        {cta}
      </Button>
      {spot === 'menu' && (
        <>
          <Button
            aria-label="Options"
            icon={<MenuIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <OverflowMenu highlight={highlight} items={menu} />
        </>
      )}
    </div>
  </Screen>
);

const CollectionHeader = ({
  spot,
  menu,
  highlight,
}: {
  spot: Spot;
  menu: string[];
  highlight?: string;
}) => (
  <Screen>
    <div className="relative flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold uppercase text-text-quaternary typo-caption2">
            Best of · August 2026
          </span>
          <span className="truncate font-bold text-text-primary typo-title3">
            August&apos;s most upvoted reads
          </span>
        </div>
        {spot === 'beside' && <Control action="Link" />}
        {spot === 'labeled' && (
          <>
            <Control action="Snapshot" />
            <Control action="Link" label variant={ButtonVariant.Secondary} />
          </>
        )}
        {spot === 'menu' && (
          <>
            <Button
              aria-label="Options"
              icon={<MenuIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
            <OverflowMenu highlight={highlight} items={menu} />
          </>
        )}
      </div>
      {['Why iconic tech brands lost their dominance', 'Postgres is all you need, again'].map(
        (title) => (
          <div key={title} className="flex items-center gap-3">
            <img
              alt=""
              className="size-7 rounded-full object-cover"
              src={AVATAR}
            />
            <span className="min-w-0 flex-1 truncate text-text-primary typo-caption1">
              {title}
            </span>
          </div>
        ),
      )}
    </div>
  </Screen>
);

const Directories = () => (
  <SurfacePage
    intro="Tags, sources, squads, leaderboards and best-of pages all share one shape: a header, a Follow or Join button, and a live feed under it. The share control has to sit beside a primary CTA without competing with it."
    map="Sharing map: Copy link leads on all of them (#6357, #6363, #6359, #6364). These are live pages — an image of a tag says nothing a feed does not say better, and the point of a squad share is joining."
    title="Topic & directory pages"
  >
    <Category
      covers="#6357 · tag and source pages"
      title="Tags & sources"
      verdict="Link leads. Snapshot stays out entirely — there is no static payload worth an image."
    >
      <Variant
        headline="No share action anywhere on the page"
        note="Verified: the tag and source ⋯ menus carry Block and Report only, and no share control sits beside Follow. This is the one surface in the set where the control is genuinely missing rather than buried."
        step="Today"
      >
        <TopicHeader
          cta="Follow"
          menu={['Block #typescript', 'Report']}
          meta="48.2k followers"
          spot="menu"
          title="#typescript"
        />
      </Variant>
      <Variant
        headline="Icon next to Follow, matched to it"
        note="Recommended. Same size and Float weight as Follow, so it reads as a peer without pulling attention from the CTA."
        step="Recommended"
      >
        <TopicHeader
          cta="Follow"
          menu={['Block #typescript', 'Report']}
          meta="48.2k followers"
          spot="beside"
          title="#typescript"
        />
      </Variant>
      <Variant
        headline="Labeled beside Follow"
        note="Maximum visibility, and the one variant that genuinely competes with Follow. Worth testing only if follow rate is not the metric that matters here."
        step="Push"
      >
        <TopicHeader
          cta="Follow"
          menu={['Block #typescript', 'Report']}
          meta="48.2k followers"
          spot="labeled"
          title="#typescript"
        />
      </Variant>
    </Category>

    <Category
      covers="#6363 · squad directory cards"
      title="Squads"
      verdict="Same shape, higher stakes: Join is the conversion event on this page, so the share control has to stay quieter than it."
    >
      <Variant
        headline="Hidden in the card menu"
        note="Squads grow by word of mouth, from a control nobody sees."
        step="Today"
      >
        <TopicHeader
          cta="Join"
          eyebrow="Squad"
          highlight="Share via"
          menu={['Share via', 'Hide', 'Block frontend-fans', 'Report']}
          meta="2.4k members"
          round
          spot="menu"
          title="Frontend Fans"
        />
      </Variant>
      <Variant
        headline="Small control next to Join"
        note="Recommended, and deliberately the quieter of the two — the point is joining."
        step="Recommended"
      >
        <TopicHeader
          cta="Join"
          eyebrow="Squad"
          highlight="Share via"
          menu={['Share via', 'Hide', 'Block frontend-fans', 'Report']}
          meta="2.4k members"
          round
          spot="beside"
          title="Frontend Fans"
        />
      </Variant>
    </Category>

    <Category
      covers="#6364 · discovery and best-of · #6359 · leaderboard page"
      title="Collections & boards"
      verdict="Evergreen pages worth landing on, so the link is the gift. Snapshot works as a teaser — provided the card carries a URL back."
    >
      <Variant
        headline="No header control"
        note="The most linkable thing we publish, with no share affordance on it."
        step="Today"
      >
        <CollectionHeader menu={['Share', 'Add to custom feed']} highlight="Share" spot="menu" />
      </Variant>
      <Variant
        headline="Icon in the section header"
        note="Recommended. Quiet, conventional, and enough for a page people already arrive at with intent."
        step="Recommended"
      >
        <CollectionHeader menu={['Share', 'Add to custom feed']} highlight="Share" spot="beside" />
      </Variant>
      <Variant
        headline="Labeled link, with a snapshot of the top five"
        note="The snapshot is a teaser that carries the link home in the card footer. Blocked until short URLs are baked into the cards."
        step="Push"
      >
        <CollectionHeader menu={['Share', 'Add to custom feed']} highlight="Share" spot="labeled" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof Directories> = {
  title: 'Features/Snapshot/Surfaces/Topic & directory pages',
  component: Directories,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof Directories> = {};
