import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CardAction } from '@dailydotdev/shared/src/components/buttons/CardAction';
import { CardActionBar } from '@dailydotdev/shared/src/components/buttons/CardActionBar';
import { ColorName as ButtonColor } from '@dailydotdev/shared/src/styles/colors';
import {
  UpvoteIcon,
  DownvoteIcon,
  DiscussIcon,
  BookmarkIcon,
  ShareIcon,
  CopyIcon,
  StarIcon,
} from '@dailydotdev/shared/src/components/icons';

const meta: Meta<typeof CardAction> = {
  title: 'components/CardAction',
  component: CardAction,
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    count: { control: 'number' },
    color: {
      control: { type: 'select' },
      options: [undefined, ...Object.values(ButtonColor)],
    },
    density: {
      control: { type: 'inline-radio' },
      options: ['comfortable', 'compact'],
    },
    pressed: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    labelVisible: { control: 'boolean' },
  },
  args: {
    icon: <UpvoteIcon />,
    iconPressed: <UpvoteIcon secondary />,
    label: 'Upvote',
    color: ButtonColor.Avocado,
    density: 'comfortable',
    pressed: false,
    loading: false,
    disabled: false,
    labelVisible: false,
    onClick: fn(),
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CardAction>;

export const Default: Story = {};

export const WithCounter: Story = {
  args: {
    count: 142,
  },
};

export const Pressed: Story = {
  args: {
    pressed: true,
    count: 143,
  },
};

export const LabelVisible: Story = {
  args: {
    labelVisible: true,
  },
};

export const LoadingState: Story = {
  args: {
    loading: true,
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
    count: 12,
  },
};

/**
 * Both densities side by side. Comfortable (40 px / 24 px icon) is the
 * default for cards and post detail; compact (32 px / 20 px icon) is the
 * dense-row variant for comment toolbars and modal headers. Engagement-bar
 * icon ratio sits at 60 – 62 % (Material 3 / Instagram band) to address
 * recognition at feed-scroll glance.
 */
export const Densities: Story = {
  name: 'Densities — comfortable vs compact',
  render: () => (
    <div className="flex flex-col gap-6">
      <section>
        <header className="mb-2 typo-callout font-bold text-text-primary">
          Comfortable (40 px / 24 px icon)
        </header>
        <CardActionBar>
          <CardAction
            icon={<UpvoteIcon />}
            iconPressed={<UpvoteIcon secondary />}
            label="Upvote"
            color={ButtonColor.Avocado}
            count={142}
          />
          <CardAction
            icon={<DiscussIcon />}
            label="Comment"
            color={ButtonColor.BlueCheese}
            count={28}
          />
          <CardAction
            icon={<BookmarkIcon />}
            iconPressed={<BookmarkIcon secondary />}
            label="Bookmark"
            color={ButtonColor.Bun}
          />
          <CardAction
            icon={<ShareIcon />}
            label="Share"
          />
        </CardActionBar>
      </section>
      <section>
        <header className="mb-2 typo-callout font-bold text-text-primary">
          Compact (32 px / 20 px icon)
        </header>
        <CardActionBar layout="compact">
          <CardAction
            icon={<UpvoteIcon />}
            iconPressed={<UpvoteIcon secondary />}
            label="Upvote"
            color={ButtonColor.Avocado}
            count={142}
            density="compact"
          />
          <CardAction
            icon={<DiscussIcon />}
            label="Comment"
            color={ButtonColor.BlueCheese}
            count={28}
            density="compact"
          />
          <CardAction
            icon={<BookmarkIcon />}
            iconPressed={<BookmarkIcon secondary />}
            label="Bookmark"
            color={ButtonColor.Bun}
            density="compact"
          />
          <CardAction
            icon={<ShareIcon />}
            label="Share"
            density="compact"
          />
        </CardActionBar>
      </section>
    </div>
  ),
};

/**
 * Brand colour mapping — the engagement-bar palette. Each colour ties to
 * an action intent: avocado for "yes / approve", ketchup for "no / reject",
 * blueCheese for "discuss", cabbage for "honour / award", bun for "save".
 */
export const Colors: Story = {
  name: 'Colors — engagement palette',
  render: () => (
    <CardActionBar>
      <CardAction
        icon={<UpvoteIcon />}
        iconPressed={<UpvoteIcon secondary />}
        label="Upvote"
        color={ButtonColor.Avocado}
        count={142}
      />
      <CardAction
        icon={<DownvoteIcon />}
        iconPressed={<DownvoteIcon secondary />}
        label="Downvote"
        color={ButtonColor.Ketchup}
      />
      <CardAction
        icon={<DiscussIcon />}
        label="Comment"
        color={ButtonColor.BlueCheese}
        count={28}
      />
      <CardAction
        icon={<StarIcon />}
        iconPressed={<StarIcon secondary />}
        label="Award"
        color={ButtonColor.Cabbage}
      />
      <CardAction
        icon={<BookmarkIcon />}
        iconPressed={<BookmarkIcon secondary />}
        label="Bookmark"
        color={ButtonColor.Bun}
      />
    </CardActionBar>
  ),
};

const VOTE_NONE = 'none';
const VOTE_UP = 'up';
const VOTE_DOWN = 'down';
type VoteState = typeof VOTE_NONE | typeof VOTE_UP | typeof VOTE_DOWN;

/**
 * Realistic feed-card pattern — upvote toggles between idle / pressed
 * with the icon swap, counter updates accordingly, downvote shares the
 * vote state. Mirrors what a feed grid card ships in production.
 */
export const FeedCard: Story = {
  name: 'Vignette — feed card',
  render: () => {
    /* eslint-disable react-hooks/rules-of-hooks */
    const [vote, setVote] = useState<VoteState>(VOTE_NONE);
    const [bookmarked, setBookmarked] = useState(false);
    const baseCount = 142;
    const count =
      vote === VOTE_UP ? baseCount + 1 : vote === VOTE_DOWN ? baseCount - 1 : baseCount;
    /* eslint-enable react-hooks/rules-of-hooks */

    return (
      <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
        <p className="mb-3 typo-body text-text-primary">
          Why our team replaced 32&nbsp;px engagement bars with a 40&nbsp;px
          primitive — the recognition gap was real
        </p>
        <CardActionBar>
          <CardAction
            icon={<UpvoteIcon />}
            iconPressed={<UpvoteIcon secondary />}
            label="Upvote"
            color={ButtonColor.Avocado}
            count={count}
            pressed={vote === VOTE_UP}
            onClick={() => setVote(vote === VOTE_UP ? VOTE_NONE : VOTE_UP)}
          />
          <CardAction
            icon={<DownvoteIcon />}
            iconPressed={<DownvoteIcon secondary />}
            label="Downvote"
            color={ButtonColor.Ketchup}
            pressed={vote === VOTE_DOWN}
            onClick={() => setVote(vote === VOTE_DOWN ? VOTE_NONE : VOTE_DOWN)}
          />
          <CardAction
            icon={<DiscussIcon />}
            label="Comment"
            color={ButtonColor.BlueCheese}
            count={28}
          />
          <CardAction
            icon={<BookmarkIcon />}
            iconPressed={<BookmarkIcon secondary />}
            label="Bookmark"
            color={ButtonColor.Bun}
            pressed={bookmarked}
            onClick={() => setBookmarked((b) => !b)}
          />
          <CardAction icon={<ShareIcon />} label="Share" />
        </CardActionBar>
      </div>
    );
  },
};

/**
 * Post-detail strip — `between` layout, full-width, labels visible. Reads
 * as a chunky toolbar where each action gets equal real estate.
 */
export const PostDetailStrip: Story = {
  name: 'Vignette — post detail (between layout)',
  render: () => (
    <div className="rounded-12 border border-border-subtlest-tertiary p-4">
      <CardActionBar layout="between">
        <CardAction
          icon={<UpvoteIcon />}
          iconPressed={<UpvoteIcon secondary />}
          label="Upvote"
          color={ButtonColor.Avocado}
          count={142}
          labelVisible
        />
        <CardAction
          icon={<DiscussIcon />}
          label="Comment"
          color={ButtonColor.BlueCheese}
          count={28}
          labelVisible
        />
        <CardAction
          icon={<StarIcon />}
          iconPressed={<StarIcon secondary />}
          label="Award"
          color={ButtonColor.Cabbage}
          labelVisible
        />
        <CardAction
          icon={<BookmarkIcon />}
          iconPressed={<BookmarkIcon secondary />}
          label="Bookmark"
          color={ButtonColor.Bun}
          labelVisible
        />
      </CardActionBar>
    </div>
  ),
};

/**
 * Comment row — compact density (32 px), `compact` bar layout (`gap-0.5`).
 * Optimised for dense lists where four actions need to fit alongside a
 * timestamp without crowding.
 */
export const CommentRow: Story = {
  name: 'Vignette — comment row (compact density)',
  render: () => (
    <div className="rounded-12 border border-border-subtlest-tertiary p-4">
      <p className="mb-1 typo-callout text-text-primary">
        Switching to `CardAction` killed three sources of accidental drift.
      </p>
      <div className="mb-2 typo-caption1 text-text-tertiary">2 hours ago</div>
      <CardActionBar layout="compact">
        <CardAction
          icon={<UpvoteIcon />}
          iconPressed={<UpvoteIcon secondary />}
          label="Upvote"
          color={ButtonColor.Avocado}
          count={12}
          density="compact"
        />
        <CardAction
          icon={<DiscussIcon />}
          label="Reply"
          color={ButtonColor.BlueCheese}
          density="compact"
        />
        <CardAction
          icon={<CopyIcon />}
          label="Copy link"
          density="compact"
        />
        <CardAction
          icon={<ShareIcon />}
          label="Share"
          density="compact"
        />
      </CardActionBar>
    </div>
  ),
};

/**
 * Sticky bottom bar pattern — the consumer wraps the bar in their own
 * `sticky bottom-0` chrome (`bg-background-default` + top border).
 * `CardActionBar` itself stays chrome-less so it composes into any
 * surface without restyling.
 */
export const StickyBottomBar: Story = {
  name: 'Vignette — sticky bottom bar (mobile pattern)',
  render: () => (
    <div className="rounded-12 border border-border-subtlest-tertiary p-4">
      <p className="mb-2 typo-callout text-text-primary">Article body content scrolls above the sticky bar.</p>
      <div className="border-t border-border-subtlest-tertiary bg-background-default px-4 py-2">
        <CardActionBar layout="between">
          <CardAction
            icon={<UpvoteIcon />}
            iconPressed={<UpvoteIcon secondary />}
            label="Upvote"
            color={ButtonColor.Avocado}
            count={142}
          />
          <CardAction
            icon={<DiscussIcon />}
            label="Comment"
            color={ButtonColor.BlueCheese}
            count={28}
          />
          <CardAction
            icon={<BookmarkIcon />}
            iconPressed={<BookmarkIcon secondary />}
            label="Bookmark"
            color={ButtonColor.Bun}
          />
          <CardAction icon={<ShareIcon />} label="Share" />
        </CardActionBar>
      </div>
    </div>
  ),
};
