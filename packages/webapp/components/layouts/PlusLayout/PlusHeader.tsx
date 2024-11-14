import React, { ReactElement, useCallback } from 'react';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

export const PlusHeader = (): ReactElement => {
  const { back, replace } = useRouter();

  const onBackClick = useCallback(() => {
    console.log({ referrer: document.referrer }, 'referrer');
    return;
    if (window.history?.length > 1) {
      back();
    } else {
      replace(webappUrl);
    }
  }, [back, replace]);

  return (
    <header className="flex h-16 w-full items-center gap-4 border-b border-border-subtlest-tertiary px-4">
      <Button
        variant={ButtonVariant.Float}
        icon={<ArrowIcon className="-rotate-90" />}
        onClick={onBackClick}
      >
        Back
      </Button>
      <HeaderLogo />
    </header>
  );
};
