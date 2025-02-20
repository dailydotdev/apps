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
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/PaymentContext';

export const PlusFreeTrialAlert = (): ReactElement => {
  return (
    <div className="min-w-full bg-status-success px-6 py-4 text-center text-black">
      <Typography bold type={TypographyType.Callout}>
        Pay nothing today. Start your 7-day free trial!
      </Typography>
    </div>
  );
};

export const PlusHeader = (): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { back, replace, isReady, query, pathname } = useRouter();
  const { isFreeTrialExperiment } = usePaymentContext();
  const shouldShowFreeTrial =
    isFreeTrialExperiment && pathname === '/plus' && !query?.gift;

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
    <>
      {shouldShowFreeTrial && <PlusFreeTrialAlert />}
      <header className="flex h-16 w-full items-center justify-center gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 tablet:bg-transparent laptop:justify-start">
        <Button
          variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBackClick}
          className="absolute left-4 laptop:relative laptop:left-0"
        >
          {!isMobile ? 'Back' : undefined}
        </Button>
        <LogoWithPlus />
      </header>
    </>
  );
};
