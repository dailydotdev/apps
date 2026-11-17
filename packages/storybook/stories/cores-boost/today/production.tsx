import type { ReactElement } from 'react';
import React from 'react';
import { BuyCoresProcessing } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import type {
  BuyCoresContextData,
  Screens,
} from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { BuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import { noop } from '../real/providers';

// Production's Buy Cores processing screen at a given step, for the Today
// stories.

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
    paddle: {} as NonNullable<BuyCoresContextData['paddle']>,
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
