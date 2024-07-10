import type { Meta, StoryObj } from '@storybook/react';
import YoutubeVideo
  from '@dailydotdev/shared/src/components/video/YoutubeVideo';

const meta: Meta<typeof YoutubeVideo> = {
  title: 'Atoms/YoutubeVideo',
  component: YoutubeVideo,
};

export default meta;

type Story = StoryObj<typeof YoutubeVideo>;

export const Primary: Story = {
  render: (props) => <YoutubeVideo {...props} />,
  name: 'YoutubeVideo',
  args: {
    videoId: 'igZCEr3HwCg',
    title: 'Daily dev introduction video',
    className: '',
  },
};
