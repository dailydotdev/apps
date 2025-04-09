import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FunnelPricing } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPricing';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from '@storybook/test';
import { PricingPlanVariation } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlan';

const meta: Meta<typeof FunnelPricing> = {
  title: 'Components/Onboarding/Steps/Pricing',
  component: FunnelPricing,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-5458&m=dev',
    },
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FunnelPricing>;

const commonProps = {
  type: FunnelStepType.Pricing,
  parameters: {},
  transitions: [],
  onTransition: fn(),
  isActive: true,
};

export const Default: Story = {
  args: {
    ...commonProps,
    defaultPlan: 'annual',
    discount: {
      message:
        'Get <b>additional 20% discount</b> if you subscribe in the next 15 minutes',
      duration: 15,
      startDate: new Date(),
    },
    headline: 'Choose your plan',
    pricing: {
      perks: [
        '30-day refund, no questions asked',
        'Cancel anytime, no strings attached',
        'Works across all your devices',
      ],
      plans: [
        {
          id: 'monthly',
          value: 'monthly',
          label: 'Monthly',
          price: {
            amount: '$0.49',
            subtitle: 'per day',
          },
          badge: {
            text: 'Popular',
            background: '#CE3DF3',
          },
        },
        {
          id: 'annual',
          value: 'annual',
          label: 'Annual',
          price: {
            amount: '$0.24',
            subtitle: 'per day',
          },
          badge: {
            text: 'Save 50%',
            background: '#39E58C',
          },
          variation: PricingPlanVariation.BEST_VALUE,
        },
      ],
    },
    cta: 'Proceed to checkout →',
    featuresList: {
      title: 'Your new abilities',
      items: [
        'Curated tech content from all over the web',
        'Personalized feed based on your interests',
        'AI assistant to explain complex topics',
        'Distraction-free reading mode',
        'Save posts for later and organize with folders',
        'Discover trending tools early',
        'Engage with like-minded professionals',
        'Exclusive content from top creators',
      ],
    },
    review: {
      image:
        'https://media.daily.dev/image/upload/s--ZOzmj3AB--/f_auto/v1743939472/public/Review',
      reviewText:
        'This is the only tool I’ve stuck with for more than a month. It fits naturally into my routine and keeps me sharp.',
      authorInfo: 'Dave N., Senior Data Scientist',
      authorImage:
        'https://media.daily.dev/image/upload/s--FgjC22Px--/f_auto/v1743491782/public/image',
    },
    refund: {
      image: {
        src: 'https://media.daily.dev/image/upload/s--QHvr7zBd--/f_auto/v1743491782/public/approved',
        alt: 'Checkmark',
      },
      title: '100% money back guarantee',
      content:
        "We're confident in the quality of our plan. More than a million developers around the world use daily.dev to grow professionally. To get the most out of it, use daily.dev daily. Consume content, explore, and interact with the community. If you still don't love it after 30 days, contact us. We guarantee a full hassle-free refund. No questions asked.",
    },
    faq: {
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
  },
};
