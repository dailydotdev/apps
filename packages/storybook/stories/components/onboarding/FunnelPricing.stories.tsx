import React, { ReactElement } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { FunnelPricing } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPricing';
import {
  FunnelStepType,
  FunnelStepPricing,
  FunnelPricingType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from 'storybook/test';
import { PricingPlanVariation } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlan';
import ExtensionProviders from '../../extension/_providers';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared';
import { PaymentContext, FunnelPaymentPricingContext } from '@dailydotdev/shared/src/contexts/payment/context';
import type { ProductPricingPreview } from '@dailydotdev/shared/src/graphql/paddle';
import {
  PlusPriceType,
  PlusPriceTypeAppsId,
} from '@dailydotdev/shared/src/lib/featureValues';
import {
  selectedPlanAtom,
  applyDiscountAtom,
  discountTimerAtom,
} from '@dailydotdev/shared/src/features/onboarding/store/funnel.store';

// Mock pricing data
const mockPricing: ProductPricingPreview[] = [
  {
    priceId: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
    price: {
      amount: 15,
      formatted: '$15',
      monthly: {
        amount: 15,
        formatted: '$15',
      },
      daily: {
        amount: 0.49,
        formatted: '$0.49',
      },
    },
    currency: {
      code: 'USD',
      symbol: '$',
    },
    duration: PlusPriceType.Monthly,
    metadata: {
      appsId: PlusPriceTypeAppsId.Default,
      title: 'Monthly',
      idMap: {
        paddle: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
        ios: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
      },
    },
  },
  {
    priceId: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
    price: {
      amount: 150,
      formatted: '$150',
      monthly: {
        amount: 12.50,
        formatted: '$12.50',
      },
      daily: {
        amount: 0.24,
        formatted: '$0.24',
      },
    },
    currency: {
      code: 'USD',
      symbol: '$',
    },
    duration: PlusPriceType.Yearly,
    metadata: {
      appsId: PlusPriceTypeAppsId.Default,
      title: 'Annual',
      idMap: {
        paddle: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
        ios: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
      },
    },
  },
];

// Mock PaymentContext provider
const MockPaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const mockContextValue = {
    openCheckout: fn(),
    productOptions: mockPricing,
    isPlusAvailable: true,
    giftOneYear: undefined,
    isPricesPending: false,
    isPaddleReady: true,
  };

  return (
    <PaymentContext.Provider value={mockContextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// Hydrate atoms wrapper
const HydrateAtoms = ({ children, initialValues }: { children: React.ReactNode; initialValues: [any, any][] }) => {
  useHydrateAtoms(initialValues);
  return <>{children}</>;
};

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
  render: (props): ReactElement => {
    return (
      <Provider>
        <HydrateAtoms
          initialValues={[
            [selectedPlanAtom, props.parameters?.defaultPlan],
            [applyDiscountAtom, true],
            [discountTimerAtom, new Date()],
          ]}
        >
          <ExtensionProviders>
            <FunnelPaymentPricingContext.Provider value={{ pricing: mockPricing }}>
              <MockPaymentProvider>
                <FunnelStepBackground step={props}>
                  <FunnelPricing {...props} />
                </FunnelStepBackground>
              </MockPaymentProvider>
            </FunnelPaymentPricingContext.Provider>
          </ExtensionProviders>
        </HydrateAtoms>
      </Provider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof FunnelPricing>;

const commonParams: FunnelStepPricing['parameters'] = {
  headline: 'Choose your plan',
  cta: 'Proceed to checkout →',
  pricingType: FunnelPricingType.Monthly,
  discount: {
    message:
      'Get <b>additional 20% discount</b> if you subscribe in the next 15 minutes',
    duration: 15,
  },
  defaultPlan: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
  plans: [
    {
      priceId: 'pri_01jcdp5ef4yhv00p43hr2knrdg',
      label: 'Monthly',
      badge: {
        text: 'Popular',
        background: '#CE3DF3',
      },
    },
    {
      priceId: 'pri_01jmf95s11a9hedbh2bfcz5dz7',
      label: 'Annual',
      badge: {
        text: 'Save 50%',
        background: '#39E58C',
      },
      variation: PricingPlanVariation.BEST_VALUE,
    },
  ],
  perks: [
    '30-day refund, no questions asked',
    'Cancel anytime, no strings attached',
    'Works across all your devices',
  ],
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
      "This is the only tool I've stuck with for more than a month. It fits naturally into my routine and keeps me sharp.",
    authorInfo: 'Dave N., Senior Data Scientist',
    authorImage:
      'https://media.daily.dev/image/upload/s--FgjC22Px--/f_auto/v1743491782/public/image',
  },
  refund: {
    image:
      'https://media.daily.dev/image/upload/s--QHvr7zBd--/f_auto/v1743491782/public/approved',
    title: '100% money back guarantee',
    content:
      "We're confident in the quality of our plan. More than a million developers around the world use daily.dev to grow professionally. To get the most out of it, use daily.dev daily. Consume content, explore, and interact with the community. If you still don't love it after 30 days, contact us. We guarantee a full hassle-free refund. No questions asked.",
  },
  faq: [
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
};

const commonProps: Partial<FunnelStepPricing> = {
  type: FunnelStepType.Pricing,
  transitions: [],
  onTransition: fn(),
  isActive: true,
  discountStartDate: new Date(),
};

export const Default: Story = {
  args: {
    ...commonProps,
    parameters: {
      ...commonParams,
    },
  },
};
