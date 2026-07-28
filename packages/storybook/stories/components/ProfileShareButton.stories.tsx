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
          'Profile copy-link control. One click copies the shortened, referral-tagged profile URL, flips the glyph to a green check for a second and toasts what was copied — no network picker. Mobile still gets the native share sheet where the platform offers one. Ships unconditionally — no flag.',
      },
    },
  },
  decorators: [withShareProviders()],
};

export default meta;

type Story = StoryObj<typeof ProfileShareButton>;

// Public profile: the label names whose profile is being copied.
export const OnPublicProfile: Story = {};

// Owner profile: first-person label, same control.
export const OwnProfile: Story = {
  args: { isSameUser: true },
};

// Copied state: the glyph flips to a green check for a second. The clipboard is
// stubbed because the Storybook iframe isn't allowed to write to the real one.
export const Copied: Story = {
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const button = within(canvasElement).getByLabelText(
      "Copy link to @idoshamun's profile",
    );
    await userEvent.click(button);
    await waitFor(() =>
      expect(button.querySelector('.text-status-success')).toBeInTheDocument(),
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
