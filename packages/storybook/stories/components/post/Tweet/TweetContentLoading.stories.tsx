import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetContentLoading } from '@dailydotdev/shared/src/components/post/tweet/TweetContentLoading';
import { mockAuthor } from '../../../../mock/tweet';

const meta: Meta<typeof TweetContentLoading> = {
  title: 'Components/Post/Tweet/TweetContentLoading',
  component: TweetContentLoading,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="max-w-2xl">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TweetContentLoading>;

export const Default: Story = {
  name: 'Default Loading',
};

export const WithAuthorInfo: Story = {
  name: 'With Author Info',
  args: {
    authorName: mockAuthor.name,
    authorUsername: mockAuthor.username,
    authorAvatar: mockAuthor.avatar,
    url: 'https://x.com/dailydotdev/status/1234567890123456789',
  },
};

export const WithUrlOnly: Story = {
  name: 'With URL Only',
  args: {
    url: 'https://x.com/dailydotdev/status/1234567890123456789',
  },
};

export const NoEstimate: Story = {
  name: 'No Time Estimate',
  args: {
    showEstimate: false,
  },
};
