import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetThread } from '@dailydotdev/shared/src/components/post/tweet/TweetThread';
import { mockThreadTweet, mockTweetMedia } from '../../../../mock/tweet';
import type { TweetData } from '@dailydotdev/shared/src/graphql/posts';

const shortThread: TweetData[] = [
  {
    tweetId: '1234567890123456790',
    content: 'This is the second tweet in the thread.',
    contentHtml: 'This is the second tweet in the thread.',
    createdAt: new Date('2026-01-13T10:01:00Z'),
    media: [],
    likeCount: 234,
    retweetCount: 45,
    replyCount: 12,
  },
  {
    tweetId: '1234567890123456791',
    content: 'Third and final tweet in the thread.',
    contentHtml: 'Third and final tweet in the thread.',
    createdAt: new Date('2026-01-13T10:02:00Z'),
    media: [],
    likeCount: 189,
    retweetCount: 34,
    replyCount: 8,
  },
];

const longThread: TweetData[] = Array.from({ length: 12 }, (_, i) => ({
  tweetId: `123456789012345679${i}`,
  content: `Tweet ${i + 2} of the thread. This is a longer thread to test the expand/collapse functionality.`,
  contentHtml: `Tweet ${i + 2} of the thread. This is a longer thread to test the expand/collapse functionality.`,
  createdAt: new Date(`2026-01-13T10:0${i}:00Z`),
  media: i === 3 ? mockTweetMedia : [],
  likeCount: 100 + i * 20,
  retweetCount: 20 + i * 5,
  replyCount: 5 + i,
}));

const meta: Meta<typeof TweetThread> = {
  title: 'Components/Post/Tweet/TweetThread',
  component: TweetThread,
  args: {
    threadTweets: mockThreadTweet.threadTweets,
    authorUsername: 'dailydotdev',
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="max-w-xl">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TweetThread>;

export const Default: Story = {
  name: 'Default Thread',
};

export const ShortThread: Story = {
  name: 'Short Thread (2-3 tweets)',
  args: {
    threadTweets: shortThread,
  },
};

export const LongThread: Story = {
  name: 'Long Thread (10+ tweets)',
  args: {
    threadTweets: longThread,
  },
};

export const InitiallyExpanded: Story = {
  name: 'Initially Expanded',
  args: {
    threadTweets: longThread,
    initialExpanded: true,
  },
};

export const CustomPreviewCount: Story = {
  name: 'Custom Preview Count (3)',
  args: {
    threadTweets: longThread,
    maxPreviewCount: 3,
  },
};

export const Empty: Story = {
  name: 'Empty Thread',
  args: {
    threadTweets: [],
  },
};
