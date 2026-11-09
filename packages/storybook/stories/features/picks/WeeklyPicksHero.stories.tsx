import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Picks } from '@dailydotdev/shared/src/graphql/picks';
import { WeeklyPicksHeroCard } from '@dailydotdev/shared/src/components/picks/WeeklyPicksHero';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../../extension/_providers';

// The weekly picks card on the home feed. From Thursday, a member whose
// week's reading clears the bar is nudged to turn it into picks; once this
// week's picks are out, the card shows how far they went and offers the
// share sheet. Closing it hides it until the next week. On laptop it sits
// in the top-hero strip beside the reading reminder; below that, inline
// above the feed.

const picks: Picks = {
  id: 'picks-demo',
  weekStart: '2026-11-02',
  author: {
    id: defaultUser.id,
    name: defaultUser.name,
    username: defaultUser.username,
    image: defaultUser.image,
    permalink: defaultUser.permalink,
  },
  items: [],
};

const meta: Meta = {
  title: 'Features/Picks/Weekly picks hero',
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="mx-auto max-w-[42rem]">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const phone = { viewport: { value: 'mobile2', isRotated: false } };

/** Thursday to Sunday, reading on the clock, no picks yet. */
export const Nudge: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      state="nudge"
      signals={{ upvotes: 4, bookmarks: 2, reads: 6 }}
      onDismiss={() => undefined}
    />
  ),
};

export const NudgePhone: Story = { ...Nudge, globals: phone };

/** Only one kind of signal reads naturally too. */
export const NudgeReadsOnly: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      state="nudge"
      signals={{ upvotes: 0, bookmarks: 0, reads: 5 }}
      onDismiss={() => undefined}
    />
  ),
};

/** This week's picks are published and people opened them. */
export const Live: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      state="live"
      picks={picks}
      viewCount={12}
      user={defaultUser}
      onDismiss={() => undefined}
    />
  ),
};

export const LivePhone: Story = { ...Live, globals: phone };

/** Published, but nobody has opened the link yet. */
export const LiveNotOpened: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      state="live"
      picks={picks}
      viewCount={0}
      user={defaultUser}
      onDismiss={() => undefined}
    />
  ),
};
