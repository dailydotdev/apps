import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import post from '@dailydotdev/shared/__tests__/fixture/post';
import PostItemCard from '@dailydotdev/shared/src/components/post/PostItemCard';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import ExtensionProviders from '../extension/_providers';

const timestamp = new Date();

// The reading-history row. In production `showCopyLink` is driven by the
// `sharing_visibility` + `share_history` flags inside `ReadingHistoryList`;
// the story drives the prop directly because the storybook GrowthBook mock
// forces every boolean flag on, so a real flag-off render can't be mocked here
// (Jest covers the flag-off guarantee).
const meta: Meta<typeof PostItemCard> = {
  title: 'Components/History/PostItemCard',
  component: PostItemCard,
  args: {
    postItem: { timestamp, timestampDb: timestamp, post },
    showVoteActions: true,
    logOrigin: Origin.History,
    onHide: fn(),
  },
  argTypes: {
    showCopyLink: {
      control: 'boolean',
      description:
        'Sharing-visibility opt-in: visible "Copy link" action next to the votes',
    },
    showVoteActions: { control: 'boolean' },
    showButtons: { control: 'boolean' },
    clickable: { control: 'boolean' },
  },
  render: (props) => (
    <ExtensionProviders>
      <div className="mx-auto w-full max-w-[40rem]">
        <PostItemCard {...props} />
      </div>
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof PostItemCard>;

// Baseline history row exactly as it ships today (flag off) — no copy control.
export const HistoryRow: Story = {
  args: { showCopyLink: false },
};

// Flag-on variant: the copy-link action sits with the always-visible vote
// buttons, same button size, so row height and truncation are unchanged.
export const HistoryRowWithCopyLink: Story = {
  args: { showCopyLink: true },
};
