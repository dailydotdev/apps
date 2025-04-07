import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Reviews } from '@dailydotdev/shared/src/features/onboarding/shared/Reviews';
import type { Review } from '@dailydotdev/shared/src/features/onboarding/shared/Reviews';

const reviews: Review[] = [
  {
    title: 'Perfect for Busy People',
    content: '"I used to spend hours sifting through Hacker News, Reddit, and newsletters. Now, I get everything I need in one place."',
    author: 'Priya, Full-Stack Dev'
  },
  {
    title: 'Quality Content',
    content: '"daily.dev is my go-to dev feed. No fluff, no clickbait—just quality."',
    author: 'Alex, Senior Engineer'
  },
  {
    title: 'Saved My Time',
    content: '"As a tech lead, staying updated is crucial. daily.dev curates the most relevant content so I don\'t miss anything important."',
    author: 'Michael, Tech Lead'
  },
  {
    title: 'Great for Learning',
    content: '"The personalized feed helps me discover new technologies and best practices that I wouldn\'t have found otherwise."',
    author: 'Sarah, Junior Developer'
  }
];

const meta: Meta<typeof Reviews> = {
  title: 'Components/Onboarding/Reviews',
  component: Reviews,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27352-35307&m=dev',
    },
    controls: {
      expanded: true,
    },
  },
  args: {
    reviews,
    rating: '4.8/5',
    reviewSubtitle: 'based on 2,598+ reviews',
  },
};

export default meta;

type Story = StoryObj<typeof Reviews>;

export const Default: Story = {}; 