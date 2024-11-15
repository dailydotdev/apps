import React, { ReactElement, useCallback } from 'react';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';

export const PlusHeader = (): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { back, replace } = useRouter();

  const onBackClick = useCallback(() => {
    if (window.history?.length > 1) {
      back();
    } else {
      replace(webappUrl);
    }
  }, [back, replace]);

  return (
    <header className="flex h-16 w-full items-center justify-center gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 tablet:bg-transparent">
      <Button
        variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
        icon={<ArrowIcon className="-rotate-90" />}
        onClick={onBackClick}
        className="absolute left-4"
      >
        {!isMobile ? 'Back' : undefined}
      </Button>
      <HeaderLogo position={LogoPosition.Relative} className="!mt-0" />
    </header>
  );
};
