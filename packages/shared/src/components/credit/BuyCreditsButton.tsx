import React from 'react';
import type { ReactElement } from 'react';
import { CoinIcon, PlusIcon } from '../icons';

import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

export const BuyCreditsButton = (): ReactElement => {
  return (
    <div className="flex items-center rounded-10 bg-surface-float">
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<CoinIcon />}
        size={ButtonSize.Small}
      >
        20
      </Button>
      <div className="h-[1.375rem] w-px bg-border-subtlest-tertiary" />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<PlusIcon />}
        size={ButtonSize.Small}
      />
    </div>
  );
};
