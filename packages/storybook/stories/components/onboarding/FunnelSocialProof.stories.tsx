import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FunnelSocialProof,
} from '@dailydotdev/shared/src/features/onboarding/steps/FunnelSocialProof';
import {
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from '@storybook/test';
import {
  FunnelStepSocialProof,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';

const meta: Meta<typeof FunnelSocialProof> = {
  title: 'Components/Onboarding/Steps/SocialProof',
  component: FunnelSocialProof,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6008&m=dev',
    },
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FunnelSocialProof>;

const commonProps = {
  type: FunnelStepType.SocialProof,
  parameters: {},
  transitions: [],
  onTransition: fn(),
};

export const Default: Story = {
  args: {
    ...commonProps,
    type: FunnelStepType.SocialProof,
    parameters: {
      imageUrl: 'https://media.daily.dev/image/upload/s--44oMC43t--/f_auto/v1744094774/public/Rating',
      rating: '4.8/5',
      reviewSubtitle: 'based on 2,598+ reviews',
      reviews: [
        {
          title: 'Perfect for Busy People',
          content:
            '"I used to spend hours sifting through Hacker News, Reddit, and newsletters. Now, I get everything I need in one place."',
          author: 'Priya, Full-Stack Dev',
        },
        {
          title: 'Quality Content',
          content:
            '"daily.dev is my go-to dev feed. No fluff, no clickbait—just quality."',
          author: 'Alex, Senior Engineer',
        },
        {
          title: 'Saved My Time',
          content:
            '"As a tech lead, staying updated is crucial. daily.dev curates the most relevant content so I don\'t miss anything important."',
          author: 'Michael, Tech Lead',
        },
        {
          title: 'Great for Learning',
          content:
            '"The personalized feed helps me discover new technologies and best practices that I wouldn\'t have found otherwise."',
          author: 'Sarah, Junior Developer',
        },
      ],
    },
  } satisfies FunnelStepSocialProof,
};
