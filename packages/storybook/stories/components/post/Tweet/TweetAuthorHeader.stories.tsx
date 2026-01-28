import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetAuthorHeader } from '@dailydotdev/shared/src/components/post/tweet/TweetAuthorHeader';
import { mockAuthor, mockAuthorUnverified } from '../../../../mock/tweet';

const meta: Meta<typeof TweetAuthorHeader> = {
  title: 'Components/Post/Tweet/TweetAuthorHeader',
  component: TweetAuthorHeader,
  args: {
    username: mockAuthor.username,
    name: mockAuthor.name,
    avatar: mockAuthor.avatar,
    verified: mockAuthor.verified,
    createdAt: new Date().toISOString(),
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="max-w-md rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TweetAuthorHeader>;

export const Verified: Story = {
  name: 'Verified Author',
};

export const Unverified: Story = {
  name: 'Unverified Author',
  args: {
    username: mockAuthorUnverified.username,
    name: mockAuthorUnverified.name,
    avatar: mockAuthorUnverified.avatar,
    verified: mockAuthorUnverified.verified,
  },
};

export const LongUsername: Story = {
  name: 'Long Username',
  args: {
    username: 'verylongusernamethatmightoverflow',
    name: 'User with Long Username',
    verified: false,
  },
};

export const LongDisplayName: Story = {
  name: 'Long Display Name',
  args: {
    username: 'shortuser',
    name: 'This Is A Very Long Display Name That Might Need Truncation',
    verified: true,
  },
};

export const NoAvatar: Story = {
  name: 'No Avatar',
  args: {
    avatar: '',
  },
};

export const NoTimestamp: Story = {
  name: 'No Timestamp',
  args: {
    createdAt: undefined,
  },
};
