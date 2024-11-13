import React, { ReactElement } from 'react';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';

export const PlusHeader = (): ReactElement => {
  return (
    <header className="flex h-16 w-full items-center gap-4 border-b border-border-subtlest-tertiary px-4">
      <Button
        variant={ButtonVariant.Float}
        icon={<ArrowIcon className="-rotate-90" />}
      >
        Back
      </Button>
      <HeaderLogo />
    </header>
  );
};
