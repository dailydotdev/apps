import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  BoxList,
  BoxContentImage,
  BoxFaq,
} from '@dailydotdev/shared/src/features/onboarding/shared';

// Define the base Meta for all Box components
const meta = {
  title: 'Components/Onboarding/Box',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-12152&t=pw0DFbZJPWhxjPgs-4',
    },
    controls: {
      expanded: true,
    },
  },
} as const;

export default meta;

// BoxList Stories
type BoxListStory = StoryObj<typeof BoxList>;

export const List: BoxListStory = {
  render: (args) => <BoxList {...args} />,
  args: {
    title: 'Your new abilities',
    items: [
      { text: 'Curated tech content from all over the web' },
      { text: 'Personalized feed based on your interests' },
      { text: 'AI assistant to explain complex topics' },
      { text: 'Distraction-free reading mode' },
    ],
  },
};

// BoxContentImage Stories
type BoxContentImageStory = StoryObj<typeof BoxContentImage>;

export const ContentWithImage: BoxContentImageStory = {
  render: (args) => <BoxContentImage {...args} />,
  args: {
    title: '100% money back guarantee',
    content:
      "We're confident in the quality of our plan. More than a million developers around the world use daily.dev to grow professionally. To get the most out of it, use daily.dev daily. Consume content, explore, and interact with the community. If you still don't love it after 30 days, contact us. We guarantee a full hassle-free refund. No questions asked.",
    image: {
      src:
        'https://static.vecteezy.com/system/resources/previews/024/382/936/non_2x/approved-sign-with-checkmark-symbol-icon-label-stamp-green-round-design-transparent-background-free-png.png',
      alt: 'Money Back Guarantee',
    },
  },
};

// BoxFaq Stories
type BoxFaqStory = StoryObj<typeof BoxFaq>;

export const FAQ: BoxFaqStory = {
  render: (args) => <BoxFaq {...args} />,
  args: {
    items: [
      {
        question: 'Can I cancel anytime?',
        answer:
          "Yes. You can cancel your plan at any point from your account settings. You'll keep access until the end of your billing cycle.",
      },
      {
        question: 'What happens if I forget to use it?',
        answer:
          "We'll send personalized nudges to help you stay consistent, and your feed will always be waiting. No FOMO required.",
      },
      {
        question: "Is this useful if I'm not a full-time developer?",
        answer:
          "Absolutely. daily.dev is built for anyone in tech. From junior devs to DevOps, PMs, and hobbyists. If you want to stay sharp, it's for you.",
      },
    ],
  },
};
