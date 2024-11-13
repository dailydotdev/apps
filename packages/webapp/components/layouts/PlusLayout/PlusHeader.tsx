import React, { ReactElement } from 'react';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useRouter } from 'next/router';

export const PlusHeader = (): ReactElement => {
  const { back } = useRouter();

  return (
    <header className="flex h-16 w-full items-center gap-4 border-b border-border-subtlest-tertiary px-4">
      <Button
        variant={ButtonVariant.Float}
        icon={<ArrowIcon className="-rotate-90" />}
        onClick={back}
      >
        Back
      </Button>
      <HeaderLogo />
    </header>
  );
};
