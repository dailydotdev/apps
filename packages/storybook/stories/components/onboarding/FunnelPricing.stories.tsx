import React, { ReactElement } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FunnelPricing } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPricing';
import {
  FunnelStepType,
  FunnelStepPricing,
  FunnelStepPricingParameters,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from '@storybook/test';
import { PricingPlanVariation } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlan';
import { usePaddle } from '@dailydotdev/shared/src/features/payment/hooks/usePaddle';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Continent } from '@dailydotdev/shared/src/lib/geo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const withQueryClient = (
  Story: () => ReactElement,
  { parameters }: { parameters: { region: string } },
): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider
      user={{
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        username: 'testuser',
      }}
      updateUser={fn()}
      tokenRefreshed={true}
      getRedirectUri={fn()}
      loadingUser={false}
      loadedUserFromCache={true}
      refetchBoot={fn()}
      isFetched={true}
      squads={[]}
      firstLoad={true}
      geo={{
        region: parameters?.region || 'US',
      }}
      isAndroidApp={false}
    >
      <Story />
    </AuthContextProvider>
  </QueryClientProvider>
);

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
  decorators: [withQueryClient],
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { paddle } = usePaddle({
      paddleCallback: (event) => {
        console.log('Paddle event:', event);
      },
    });

    return <FunnelPricing {...args} paddle={paddle} />;
  },
};

export default meta;

type Story = StoryObj<typeof FunnelPricing>;

const commonParams: FunnelStepPricingParameters = {
  headline: 'Choose your plan',
  cta: 'Proceed to checkout →',
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
      'This is the only tool I’ve stuck with for more than a month. It fits naturally into my routine and keeps me sharp.',
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
