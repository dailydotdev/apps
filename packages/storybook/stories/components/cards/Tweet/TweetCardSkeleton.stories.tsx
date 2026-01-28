import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetCardSkeleton } from '@dailydotdev/shared/src/components/cards/tweet/TweetCardSkeleton';
import { mockAuthor } from '../../../../mock/tweet';

const meta: Meta<typeof TweetCardSkeleton> = {
  title: 'Components/Cards/Tweet/TweetCardSkeleton',
  component: TweetCardSkeleton,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="max-w-sm">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TweetCardSkeleton>;

export const Default: Story = {
  name: 'Default Loading',
};

export const WithAuthorInfo: Story = {
  name: 'With Author Info',
  args: {
    authorName: mockAuthor.name,
    authorUsername: mockAuthor.username,
    authorAvatar: mockAuthor.avatar,
  },
};

export const WithPartialInfo: Story = {
  name: 'With Partial Info',
  args: {
    authorUsername: mockAuthor.username,
  },
};
