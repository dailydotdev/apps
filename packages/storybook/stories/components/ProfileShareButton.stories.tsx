import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { ProfileShareButton } from '@dailydotdev/shared/src/components/profile/ProfileShareButton';
import {
  profile,
  userStats,
  withShareProviders,
} from '../share/shareStoryContext';

const meta: Meta<typeof ProfileShareButton> = {
  title: 'Components/Share/ProfileShareButton',
  component: ProfileShareButton,
  args: { user: profile },
  parameters: {
    docs: {
      description: {
        component:
          'Profile copy/share control built on the shared `ShareActions` primitive. Ships unconditionally — no flag. On the owner profile it sits next to "Edit profile"; on public profiles it fills the slot the edit button leaves empty, well away from Follow so the two intents never read as one control group.',
      },
    },
  },
  decorators: [withShareProviders()],
};

export default meta;

type Story = StoryObj<typeof ProfileShareButton>;

// Public profile: the label names whose profile is being shared.
export const OnPublicProfile: Story = {};

// Owner profile: first-person label, same control.
export const OwnProfile: Story = {
  args: { isSameUser: true },
};

// Desktop: clicking the trigger reveals the full share network list.
export const NetworkList: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByLabelText("Share @idoshamun's profile"),
    );
    await waitFor(() => expect(canvas.getByText('LinkedIn')).toBeVisible());
  },
};

// Copying state: the copy chip flips to "Copied!" for a beat. The clipboard is
// stubbed because the Storybook iframe isn't allowed to write to the real one.
export const Copying: Story = {
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByLabelText("Share @idoshamun's profile"),
    );
    await userEvent.click(await canvas.findByTestId('social-share-Copy link'));
    await waitFor(() =>
      expect(canvas.getByText('Copied!')).toBeInTheDocument(),
    );
  },
};

type HeaderStory = StoryObj<typeof ProfileHeader>;

const headerMeta = {
  render: (args: React.ComponentProps<typeof ProfileHeader>) => (
    <ProfileHeader {...args} />
  ),
};

// The control in place on a public profile header — it takes over the slot the
// (inapplicable) edit button used to reserve.
export const InPublicHeader: HeaderStory = {
  ...headerMeta,
  args: { user: profile, userStats, isSameUser: false },
};

// The control in place on the owner's header, alongside "Edit profile".
export const InOwnHeader: HeaderStory = {
  ...headerMeta,
  args: { user: profile, userStats, isSameUser: true },
};
