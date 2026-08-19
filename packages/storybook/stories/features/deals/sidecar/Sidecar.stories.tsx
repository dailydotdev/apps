import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { FakeStoreVariant } from './FakeStorePage';
import { FakeStorePage } from './FakeStorePage';
import { SidecarPill } from './SidecarPill';
import { SidecarPanel } from './SidecarPanel';
import type { AutoApplyOutcome } from './AutoApplyTheater';
import { AutoApplyTheater } from './AutoApplyTheater';
import {
  getSidecarStore,
  sidecarAutoApplyCodes,
  sidecarStores,
  withSidecar,
} from './sidecarMocks';

type Stage = 'pill' | 'panel' | 'theater' | 'muted';

const Scaffold = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="fixed bottom-6 left-6 z-max flex max-w-[22rem] flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2">
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
    >
      Mock controls, not part of the product surface
    </Typography>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const ControlButton = ({
  children,
  onClick,
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}): ReactElement => (
  <Button
    type="button"
    variant={pressed ? ButtonVariant.Primary : ButtonVariant.Secondary}
    size={ButtonSize.XSmall}
    onClick={onClick}
  >
    {children}
  </Button>
);

interface SidecarJourneyProps {
  storeId?: string;
  page?: FakeStoreVariant;
  outcome?: AutoApplyOutcome;
  stage?: Stage;
  controls?: 'minimal' | 'full';
}

const SidecarJourney = ({
  storeId = 'keychron',
  page = 'browsing',
  outcome = 'success',
  stage = 'pill',
  controls = 'minimal',
}: SidecarJourneyProps): ReactElement => {
  const [activeStoreId, setActiveStoreId] = useState(storeId);
  const [activePage, setActivePage] = useState<FakeStoreVariant>(page);
  const [activeStage, setActiveStage] = useState<Stage>(stage);
  const [activeOutcome, setActiveOutcome] = useState<AutoApplyOutcome>(outcome);
  const [runKey, setRunKey] = useState(0);

  const store = getSidecarStore(activeStoreId);
  const isCheckout = activePage === 'checkout';

  const reset = () => {
    setActiveStoreId(storeId);
    setActivePage(page);
    setActiveOutcome(outcome);
    setActiveStage(stage);
    setRunKey((key) => key + 1);
  };

  const replayTheater = () => {
    setActiveStage('theater');
    setRunKey((key) => key + 1);
  };

  return (
    <FakeStorePage store={store} variant={activePage}>
      {activeStage === 'pill' && (
        <SidecarPill
          key={`${store.id}-${activePage}-${runKey}`}
          label={
            isCheckout
              ? `Try ${sidecarAutoApplyCodes.length} codes automatically`
              : `${store.offers.length} deals for this store`
          }
          pulsing={isCheckout}
          onOpen={() => setActiveStage(isCheckout ? 'theater' : 'panel')}
          onMute={() => setActiveStage('muted')}
        />
      )}

      {activeStage === 'panel' && (
        <SidecarPanel store={store} onClose={() => setActiveStage('pill')} />
      )}

      {activeStage === 'theater' && (
        <AutoApplyTheater
          key={runKey}
          outcome={activeOutcome}
          onClose={() => setActiveStage('pill')}
        />
      )}

      <Scaffold>
        {controls === 'full' && (
          <>
            {sidecarStores.map((option) => (
              <ControlButton
                key={option.id}
                pressed={option.id === activeStoreId}
                onClick={() => {
                  setActiveStoreId(option.id);
                  setActiveStage('pill');
                }}
              >
                {option.domain}
              </ControlButton>
            ))}
            <ControlButton
              onClick={() => {
                setActivePage(isCheckout ? 'browsing' : 'checkout');
                setActiveStage('pill');
              }}
            >
              {isCheckout ? 'Back to browsing' : 'Go to checkout'}
            </ControlButton>
            <ControlButton
              onClick={() =>
                setActiveOutcome(
                  activeOutcome === 'success' ? 'bestPrice' : 'success',
                )
              }
            >
              Outcome: {activeOutcome === 'success' ? 'saved' : 'best price'}
            </ControlButton>
          </>
        )}
        {isCheckout && (
          <ControlButton onClick={replayTheater}>
            Replay auto apply
          </ControlButton>
        )}
        <ControlButton onClick={reset}>Reset</ControlButton>
      </Scaffold>
    </FakeStorePage>
  );
};

const meta: Meta = {
  title: 'Features/Deals/Sidecar (extension)',
  decorators: [withSidecar()],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Honey-style sidecar mock for the deals initiative. The daily.dev extension is already installed for the feed, so deals ride along on stores the user visits anyway. Three moments: a collapsed pill when a supported store is detected, an expanded panel with community-verified offers, and the checkout auto-apply theater. Both auto-apply endings get equal design weight, because the honest "best price already" answer is what builds the habit. Everything here is a self-contained storybook mock, nothing is wired to the extension.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const StoreDetected: Story = {
  render: () => <SidecarJourney />,
};

export const DealPanel: Story = {
  render: () => <SidecarJourney stage="panel" />,
};

export const CheckoutAutoApplySuccess: Story = {
  render: () => <SidecarJourney page="checkout" outcome="success" />,
};

export const CheckoutBestPrice: Story = {
  render: () => <SidecarJourney page="checkout" outcome="bestPrice" />,
};

export const FullJourney: Story = {
  render: () => <SidecarJourney controls="full" />,
};
