import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogoWithPlus } from '@dailydotdev/shared/src/components/Logo';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';

export const PlusHeader = (): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { back, replace, isReady } = useRouter();

  const onBackClick = useCallback(() => {
    if (window.history?.length > 1) {
      back();
    } else {
      replace(webappUrl);
    }
  }, [back, replace]);

  if (!isReady) {
    return null;
  }

  return (
    <header className="border-border-subtlest-tertiary bg-background-default tablet:bg-transparent laptop:justify-start flex h-16 w-full items-center justify-center gap-4 border-b px-4">
      <Button
        variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
        icon={<ArrowIcon className="-rotate-90" />}
        onClick={onBackClick}
        className="laptop:relative laptop:left-0 absolute left-4"
      >
        {!isMobile ? 'Back' : undefined}
      </Button>
      <LogoWithPlus />
    </header>
  );
};
