import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons';
import {
  AVATAR,
  Category,
  Control,
  OverflowMenu,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

const InviteScreen = ({
  spot,
}: {
  spot: 'today' | 'labeled' | 'onboarding';
}) => (
  <Screen>
    <div className="flex flex-col gap-4 p-6">
      {spot === 'onboarding' && (
        <span className="font-bold uppercase text-text-quaternary typo-caption2">
          Step 4 of 5
        </span>
      )}
      <div className="flex flex-col gap-1">
        <span className="font-bold text-text-primary typo-title3">
          {spot === 'onboarding'
            ? 'Invite 3 friends'
            : 'Come read with me on daily.dev'}
        </span>
        <span className="text-text-tertiary typo-footnote">
          We both get a month of Plus
        </span>
      </div>

      {spot === 'onboarding' && (
        <div className="flex gap-2">
          {[0, 1, 2].map((slot) => (
            <span
              key={slot}
              className="flex size-10 items-center justify-center rounded-full border border-dashed border-border-subtlest-tertiary text-text-quaternary typo-footnote"
            >
              +
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-10 bg-surface-float p-2">
        <span className="min-w-0 flex-1 truncate text-text-tertiary typo-caption1">
          dly.to/tomer
        </span>
        {spot === 'today' ? (
          <Control action="Link" />
        ) : (
          <Control action="Link" label variant={ButtonVariant.Primary} />
        )}
      </div>

      {spot !== 'today' && (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-text-quaternary typo-caption1">
            Or send the card
          </span>
          <Control action="Snapshot" label variant={ButtonVariant.Float} />
        </div>
      )}
    </div>
  </Screen>
);

const FeedExportScreen = ({
  spot,
}: {
  spot: 'today' | 'header' | 'labeled';
}) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <div className="relative flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold text-text-primary typo-title3">
            My feed
          </span>
          <span className="text-text-quaternary typo-caption1">
            Top 20 posts this week
          </span>
        </div>
        {spot === 'header' && <Control action="Snapshot" />}
        {spot === 'labeled' && (
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        )}
        {spot === 'today' && (
          <>
            <Button
              aria-label="Options"
              icon={<MenuIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
            <OverflowMenu
              highlight="Share"
              items={['Share', 'Add to custom feed']}
            />
          </>
        )}
      </div>

      {[
        'Why iconic tech brands lost their dominance',
        'The case against microservices',
        'Postgres is all you need, again',
      ].map((title) => (
        <div key={title} className="flex items-center gap-3">
          <img alt="" className="size-7 rounded-full object-cover" src={AVATAR} />
          <span className="min-w-0 flex-1 truncate text-text-primary typo-caption1">
            {title}
          </span>
        </div>
      ))}
    </div>
  </Screen>
);

const InviteAndFeed = () => (
  <SurfacePage
    intro="Two surfaces whose entire purpose is sending something outward, and they sit at opposite ends of the payload question: the invite is worthless without a clickable URL, and the feed export has no URL anyone else can open."
    map="Sharing map: Copy link leads the invite (#6366) — an image of a referral cannot be clicked. Snapshot leads Copy my feed (#6362), because your feed is yours and there is nothing to link to."
    title="Invite & feed export"
  >
    <Category
      covers="#6366 · invite a friend · blocked on backend"
      title="Invite a friend"
      verdict="Link leads and always will. Placement, not styling, is the lever — the reward only means something while the account is new."
    >
      <Variant
        headline="A quiet icon on the invite screen"
        note="The referral link is the product here, and it looks like a footnote."
        step="Today"
      >
        <InviteScreen spot="today" />
      </Variant>
      <Variant
        headline="Filled copy button, snapshot beside it"
        note="Recommended. The link leads; the card gives the invite something to look at in a chat window."
        step="Recommended"
      >
        <InviteScreen spot="labeled" />
      </Variant>
      <Variant
        headline="An onboarding step, not a settings page"
        note="The highest-leverage change on this page and the only one that is not a frontend decision — needs the funnel step and a Plus-grant mechanism."
        step="Push"
      >
        <InviteScreen spot="onboarding" />
      </Variant>
    </Category>

    <Category
      covers="#6362 · copy my feed"
      title="Copy my feed"
      verdict="A capability nobody is looking for, so it needs a label the first time they meet it."
    >
      <Variant
        headline="Does not exist"
        note="Your feed is the most personal thing in the product and it has no export at all."
        step="Today"
      >
        <FeedExportScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot in the feed header"
        note="Consistent with every other header control, and easy to miss on a surface where nobody is looking for it."
        step="Recommended"
      >
        <FeedExportScreen spot="header" />
      </Variant>
      <Variant
        headline="Labeled and filled"
        note="A new capability has to announce itself once. Worth shipping labeled, then quietening it after the first weeks of discovery."
        step="Push"
      >
        <FeedExportScreen spot="labeled" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof InviteAndFeed> = {
  title: 'Features/Snapshot/Surfaces/Invite & feed export',
  component: InviteAndFeed,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof InviteAndFeed> = {};
