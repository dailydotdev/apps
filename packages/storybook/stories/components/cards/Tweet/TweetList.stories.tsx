import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetList } from '@dailydotdev/shared/src/components/cards/tweet/TweetList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  mockTweetPost,
  mockTweetWithImages,
  mockTweetWithVideo,
  mockLongTweet,
  mockThreadTweet,
  mockUnverifiedTweet,
} from '../../../../mock/tweet';

const meta: Meta<typeof TweetList> = {
  title: 'Components/Cards/Tweet/TweetList',
  component: TweetList,
  args: {
    post: mockTweetPost as Post,
  },
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

type Story = StoryObj<typeof TweetList>;

export const Default: Story = {
  name: 'Default Tweet',
};

export const WithImages: Story = {
  name: 'With Images',
  args: {
    post: mockTweetWithImages as Post,
  },
};

export const WithVideo: Story = {
  name: 'With Video',
  args: {
    post: mockTweetWithVideo as Post,
  },
};

export const LongText: Story = {
  name: 'Long Text',
  args: {
    post: mockLongTweet as Post,
  },
};

export const Thread: Story = {
  name: 'Thread Tweet',
  args: {
    post: mockThreadTweet as Post,
  },
};

export const UnverifiedAuthor: Story = {
  name: 'Unverified Author',
  args: {
    post: mockUnverifiedTweet as Post,
  },
};
