import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { FunnelPricingV2 } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPricing/FunnelPricingV2';
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

const meta: Meta<typeof FunnelPricingV2> = {
  title: 'Components/Onboarding/Steps/FunnelPricingV2',
  component: FunnelPricingV2,
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
                <FunnelPricingV2 {...props} />
              </div>
            </FunnelStepBackground>
          </div>
        </MockPaymentProvider>
      </FunnelPaymentPricingContext.Provider>
    </ExtensionProviders>
  ),
};

export default meta;
type Story = StoryObj<typeof FunnelPricingV2>;

// Base props for all stories
const baseProps: FunnelStepPricingV2 = {
  id: 'pricing-v2',
  type: FunnelStepType.PricingV2,
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
    plansBlock: {
      heading: 'Your personalized plan is ready!',
      timer: {
        message: 'This offer ends in',
      },
      pricingType: FunnelPricingType.Monthly,
      plans: [
        {
          priceId: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
          label: '1 Month',
          variation: PricingPlanVariation.DEFAULT,
          badge: {
            text: 'Popular',
            background: 'bg-accent-cabbage-default',
          },
        },
        {
          priceId: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
          label: '3 Months',
          variation: PricingPlanVariation.BEST_VALUE,
          badge: {
            text: 'Save 50%',
            background: 'bg-accent-cabbage-default',
          },
        },
        {
          priceId: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
          label: '6 Months',
          variation: PricingPlanVariation.DEFAULT,
        },
      ],
      ctaMessage: '30-day money-back guarantee',
      cta: 'Get my plan',
    },
    refund: {
      title: '30-day money-back guarantee',
      content:
        'If you are not satisfied with daily.dev Plus, we will provide a full refund within 30 days of purchase.',
      image: '/images/onboarding/pricing-v2-header.png',
    },
    reviews: {
      heading: 'What our users say',
      items: [
        {
          authorInfo: 'John Doe',
          reviewText:
            'daily.dev Plus has completely transformed how I stay updated with tech news.',
          authorImage: 'https://placehold.co/80',
          image: 'https://placehold.co/400',
        },
        {
          authorInfo: 'Jane Smith',
          reviewText:
            'The premium features are worth every penny. I especially love the advanced filtering.',
          authorImage: 'https://placehold.co/80',
          image: 'https://placehold.co/400',
        },
      ],
    },
    trust: {
      image: 'https://daily.dev/static/placeholders/trust-badges.png',
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

export const WithoutDiscount: Story = {
  args: {
    ...baseProps,
  },
};

export const DailyPricing: Story = {
  args: {
    ...baseProps,
    parameters: {
      ...baseProps.parameters,
      plansBlock: {
        ...baseProps.parameters.plansBlock,
        pricingType: FunnelPricingType.Daily,
      },
    },
  },
};
