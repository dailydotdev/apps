import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { FunnelPricing } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPricing';
import {
  FunnelStepType,
  FunnelStepPricingV2,
  FunnelPricingType,
  FunnelStepTransitionType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from 'storybook/test';
import { PricingPlanVariation } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlan';
import ExtensionProviders from '../../extension/_providers';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared';
import { FunnelPaymentPricingContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { MockPaymentProvider, mockPricing } from './FunnelPricing.stories';
import { DISCOUNT_LOCAL_STORAGE_KEY } from '@dailydotdev/shared/src/features/onboarding/store/funnel.store';
import FunnelPricingV2 from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPricing/FunnelPricingV2';

const meta: Meta<typeof FunnelPricingV2> = {
  title: 'Components/Onboarding/Steps/FunnelPricingV2',
  component: FunnelPricing,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  render: (props) => (
    <ExtensionProviders>
      <FunnelPaymentPricingContext.Provider value={{ pricing: mockPricing }}>
        <MockPaymentProvider>
          <div className="flex flex-col min-h-dvh">
            <FunnelStepBackground step={props}>
              <div className="mx-auto flex w-full flex-1 flex-col tablet:max-w-md laptopXL:max-w-lg">
                <FunnelPricing {...props} />
              </div>
            </FunnelStepBackground>
          </div>
        </MockPaymentProvider>
      </FunnelPaymentPricingContext.Provider>
    </ExtensionProviders>
  ),
  play: () => {
    // clear start date from localStorage at the beginning of each story
    localStorage.removeItem(DISCOUNT_LOCAL_STORAGE_KEY);
  },
};

export default meta;
type Story = StoryObj<typeof FunnelPricingV2>;

// Base props for all stories
const baseProps: FunnelStepPricingV2 = {
  id: 'pricing-v2',
  type: FunnelStepType.Pricing,
  isActive: true,
  onTransition: fn(),
  discountStartDate: new Date(),
  transitions: [
    {
      on: FunnelStepTransitionType.Skip,
      destination: 'next',
    },
    {
      on: FunnelStepTransitionType.Complete,
      destination: 'next',
    },
  ],
  parameters: {
    version: 'v2',
    discount: {
      message: 'Your special offer is live for the next:',
      duration: 15,
    },
    hero: {
      image: '/images/onboarding/pricing-v2-header.png',
      headline: 'It’s time to level up',
      explainer:
        'Stay ahead, grow your skills, and get noticed.  Less effort, more results.',
    },
    features: {
      heading: 'What you get',
      items: [
        'Curated content from top sources',
        'Easy discovery of trending tools',
        'AI-powered learning, simplified',
        'Distraction-free reading',
        'Build your dev presence faster',
      ],
    },
    plans: [
      {
        priceId: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
        label: '1 Month',
        variation: PricingPlanVariation.DEFAULT,
        badge: {
          text: 'Popular',
          background: 'bg-accent-cabbage-default',
        },
        oldPrice: {
          monthly: '$9.99',
          daily: '$0.99',
        },
      },
      {
        priceId: 'pri_01jcdp5ef4yhv00p43hr2knrd2',
        label: '3 Months',
        variation: PricingPlanVariation.BEST_VALUE,
        badge: {
          text: 'Save 50%',
          background: 'bg-status-success',
        },
      },
      {
        priceId: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
        label: '6 Months',
        variation: PricingPlanVariation.DEFAULT,
      },
    ],
    plansBlock: {
      heading: 'Your personalized plan is ready!',
      timer: {
        message: 'This offer ends in',
      },
      pricingType: FunnelPricingType.Monthly,
      defaultPlan: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
      ctaMessage: '30-day money-back guarantee',
      cta: 'Get my plan',
    },
    refund: {
      image:
        'https://media.daily.dev/image/upload/s--QHvr7zBd--/f_auto/v1743491782/public/approved',
      title:
        '100% money back <strong class="text-status-success">guarantee</strong>',
      content:
        "We're confident in the quality of our plan. More than a million developers around the world use daily.dev to grow professionally. To get the most out of it, use daily.dev daily. Consume content, explore, and interact with the community. If you still don't love it after 30 days, contact us. We guarantee a full hassle-free refund. No questions asked.",
    },
    reviews: {
      heading: 'Engineers ❤️ daily.dev',
      items: [
        {
          authorInfo: 'Dave N., Senior Data Scientist',
          reviewText:
            'This is the only tool I’ve stuck with for more than a month. It fits naturally into my routine and keeps me sharp.',
          authorImage: 'https://placehold.co/80',
        },
        {
          authorInfo: 'Lina P., Senior Frontend Engineer',
          reviewText:
            'I’ve tried dozens of dev tools, but only daily.dev feels like it actually understands what I need.',
          authorImage: 'https://placehold.co/80',
        },
        {
          authorInfo: 'Ravi S., DevOps Lead',
          reviewText:
            'It’s the only feed that actually saves me time and keeps me learning.',
          authorImage: 'https://placehold.co/80',
        },
      ],
    },
    trust: {
      image:
        'https://media.daily.dev/image/upload/s--ZOzmj3AB--/f_auto/v1743939472/public/Review',
    },
    faq: {
      items: [
        {
          question: 'What is daily.dev Plus?',
          answer:
            'daily.dev Plus is our premium subscription that offers enhanced features and an ad-free experience.',
        },
        {
          question: 'Can I cancel anytime?',
          answer:
            'Yes, you can cancel your subscription at any time. If you cancel, you will still have access until the end of your billing period.',
        },
        {
          question: 'How does the money-back guarantee work?',
          answer:
            'If you are not satisfied with your purchase, contact us within 30 days for a full refund, no questions asked.',
        },
      ],
    },
  },
};

export const Default: Story = {
  args: {
    ...baseProps,
    discountStartDate: new Date(),
  },
};
