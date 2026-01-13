import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetMediaGallery } from '@dailydotdev/shared/src/components/post/tweet/TweetMediaGallery';
import {
  mockTweetMedia,
  mockTweetMediaTwo,
  mockTweetMediaThree,
  mockTweetMediaFour,
  mockVideoMedia,
  mockGifMedia,
} from '../../../../mock/tweet';

const meta: Meta<typeof TweetMediaGallery> = {
  title: 'Components/Post/Tweet/TweetMediaGallery',
  component: TweetMediaGallery,
  args: {
    media: mockTweetMedia,
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

type Story = StoryObj<typeof TweetMediaGallery>;

export const SingleImage: Story = {
  name: 'Single Image',
  args: {
    media: mockTweetMedia,
  },
};

export const TwoImages: Story = {
  name: 'Two Images',
  args: {
    media: mockTweetMediaTwo,
  },
};

export const ThreeImages: Story = {
  name: 'Three Images',
  args: {
    media: mockTweetMediaThree,
  },
};

export const FourImages: Story = {
  name: 'Four Images',
  args: {
    media: mockTweetMediaFour,
  },
};

export const Video: Story = {
  name: 'Video',
  args: {
    media: mockVideoMedia,
  },
};

export const Gif: Story = {
  name: 'Animated GIF',
  args: {
    media: mockGifMedia,
  },
};

export const Empty: Story = {
  name: 'Empty (No Media)',
  args: {
    media: [],
  },
};
