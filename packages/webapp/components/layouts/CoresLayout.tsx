import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';

import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { MainFeedPageProps } from './MainFeedPage';

export default function CoresLayout({
  children,
}: MainFeedPageProps): ReactElement {
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
    <main className="relative flex min-h-dvh flex-col">
      <header className="flex h-16 w-full items-center justify-center gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 tablet:bg-transparent laptop:justify-start">
        <Button
          variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBackClick}
          className="absolute left-4 laptop:relative laptop:left-0"
        >
          {!isMobile ? 'Back' : undefined}
        </Button>
        <div className="relative flex items-center">
          <Logo position={LogoPosition.Relative} />
        </div>
      </header>
      {children}
    </main>
  );
}

export function getCoresLayout(page: ReactNode): ReactNode {
  return <CoresLayout>{page}</CoresLayout>;
}
