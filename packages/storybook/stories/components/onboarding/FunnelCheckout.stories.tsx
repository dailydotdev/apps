import React, { ReactElement } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FunnelCheckout } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelCheckout';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { getBootMock } from '../../../mock/boot';
import { set } from 'date-fns';
import { useAtom } from 'jotai';
import { selectedPlanAtom } from '@dailydotdev/shared/src/features/onboarding/store/funnelStore';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const withRequiredProviders = (Story: () => ReactElement): ReactElement => {
  const [, setSelectedPlan] = useAtom(selectedPlanAtom);
  setSelectedPlan('pri_01jkzypjstw7k6w82375mafc89');

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Webapp}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={getBootMock()}
      >
        <Story />
      </BootDataProvider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof FunnelCheckout> = {
  title: 'Components/Onboarding/Steps/Checkout',
  component: FunnelCheckout,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27364-100151&m=dev',
    },
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  decorators: [withRequiredProviders],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FunnelCheckout>;

export const Default: Story = {
  args: {
    type: FunnelStepType.Checkout,
    id: 'checkout',
    parameters: {},
    transitions: [],
    onTransition: fn(),
  },
};
