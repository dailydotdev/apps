import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Picks, PicksPost } from '@dailydotdev/shared/src/graphql/picks';
import { WeeklyPicksHeroCard } from '@dailydotdev/shared/src/components/picks/WeeklyPicksHero';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../../extension/_providers';

// The weekly picks card on the home feed. From Thursday, a member whose
// week's reading clears the bar is asked which three posts were worth it,
// with their own posts stacked beside the question; once this week's picks
// are out, the card leads with how many people opened them and offers the
// share sheet and a one-tap copy of the link. Closing it hides it until the
// next week, and so does going to pick. On laptop it sits in the top-hero
// strip beside the reading reminder, laid out like it: stack first, copy
// and button after. Below laptop it is the reminder's dark panel above
// the feed.

const post = (id: string, placeholder: number): PicksPost => ({
  id,
  permalink: `https://app.daily.dev/posts/${id}`,
  commentsPermalink: `https://app.daily.dev/posts/${id}`,
  image: `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${placeholder}`,
  type: 'article',
});

const week = [post('a', 1), post('b', 6), post('c', 11)];

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
  items: week.map((item, index) => ({ post: item, position: index + 1 })),
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
const tablet = { viewport: { value: 'tablet', isRotated: false } };

/** Thursday to Sunday, reading on the clock, no picks yet. In the strip on laptop. */
export const Nudge: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      state="nudge"
      signals={{ upvotes: 4, bookmarks: 2, reads: 6 }}
      suggestions={week}
      onDismiss={() => undefined}
    />
  ),
};

/** Below laptop: the reading reminder's panel, copy centered, stack in a band under it. */
export const NudgePhone: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      variant="panel"
      state="nudge"
      signals={{ upvotes: 4, bookmarks: 2, reads: 6 }}
      suggestions={week}
      onDismiss={() => undefined}
    />
  ),
  globals: phone,
};

/** The panel from tablet: copy left, stack right. */
export const NudgeTablet: Story = { ...NudgePhone, globals: tablet };

/** The thumbnails are decoration: the card reads the same before they land. */
export const NudgeNoThumbnails: Story = {
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
      onDismiss={() => undefined}
    />
  ),
};

export const LivePhone: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      variant="panel"
      state="live"
      picks={picks}
      viewCount={12}
      onDismiss={() => undefined}
    />
  ),
  globals: phone,
};

/** Published, but nobody has opened the link yet: copying it leads. */
export const LiveNotOpened: Story = {
  render: () => (
    <WeeklyPicksHeroCard
      state="live"
      picks={picks}
      viewCount={0}
      onDismiss={() => undefined}
    />
  ),
};
