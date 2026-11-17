import type { ReactElement } from 'react';
import React from 'react';
import { mocked } from 'storybook/test';
import mockedRouter, { useRouter } from 'next/router';
import type { Paddle } from '@paddle/paddle-js';
import { BuyCoresProcessing } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import type {
  BuyCoresContextData,
  Screens,
} from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { BuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import { noop } from '../real/providers';

// Production helpers for the Today stories: the route a page reads, and
// production's Buy Cores processing screen at a given step.

export const routeTo = (
  pathname: string,
  query: Record<string, string> = {},
): void => {
  const search = new URLSearchParams(query).toString();

  mocked(useRouter).mockReturnValue({
    ...mockedRouter,
    isReady: true,
    pathname,
    asPath: search ? `${pathname}?${search}` : pathname,
    query,
  } as never);
};

/** Production BuyCoresProcessing at a step: processing, timeout, completed */
export const Processing = ({
  step,
  origin,
  cores,
}: {
  step: Screens;
  origin: Origin;
  cores: number;
}): ReactElement => {
  const context: BuyCoresContextData = {
    paddle: {} as Paddle,
    activeStep: step,
    setActiveStep: noop,
    selectedProduct: { id: 'sb-pack', value: cores },
    setSelectedProduct: noop,
    onCompletion: noop,
    origin,
    error:
      step === 'PROCESSING_ERROR'
        ? {
            title: 'Processing timed out',
            description:
              'Please check the status of your transaction in your Core Wallet.',
          }
        : undefined,
  };

  return (
    <BuyCoresContext.Provider value={context}>
      <BuyCoresProcessing isOpen onRequestClose={noop} />
    </BuyCoresContext.Provider>
  );
};
