import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ImageReview } from '@dailydotdev/shared/src/features/onboarding/shared/ImageReview';

const meta: Meta<typeof ImageReview> = {
  title: 'Components/Onboarding/Shared/ImageReview',
  component: ImageReview,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-12179&m=dev',
    },
    controls: {
      expanded: true,
    },
  },
  args: {
    image: 'https://media.daily.dev/image/upload/s--ZOzmj3AB--/f_auto/v1743939472/public/Review',
    reviewText:
      "This is the only tool I've stuck with for more than a month. It fits naturally into my routine and keeps me sharp.",
    authorInfo: 'Dave N., Senior Data Scientist',
    authorImage: 'https://media.daily.dev/image/upload/s--FgjC22Px--/f_auto/v1743491782/public/image',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-background-default p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ImageReview>;

export const Default: Story = {};
