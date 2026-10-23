import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { PlusInfo } from '@dailydotdev/shared/src/components/plus/PlusInfo';
import { PlusProductToggle } from '@dailydotdev/shared/src/components/plus/PlusProductToggle';
import { PlusTrustRefund } from '@dailydotdev/shared/src/components/plus/PlusTrustRefund';
import { PlusApiShowcase } from '@dailydotdev/shared/src/components/plus/PlusApiShowcase';
import { PlusFAQ } from '@dailydotdev/shared/src/components/plus/PlusFAQ';
import { PurchaseType } from '@dailydotdev/shared/src/graphql/paddle';
import { ChecklistAIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { PlusPage, productOptions, Providers } from './mocks';
import { PaddleFrameMock } from './checkout/PaddleFrameMock';

/**
 * TODAY — the A/B control. Production's page built from the production
 * components (PlusDesktop's layout: PlusProductToggle + PlusInfo on the left,
 * the inline Paddle frame + PlusTrustRefund on the right, PlusApiShowcase and
 * PlusFAQ below). Only the Paddle iframe is a mock, drawn in production's
 * current dashboard styling. Keep this file until the experiment is decided.
 */

const toggle = (
  <PlusProductToggle
    options={[
      { priceType: PurchaseType.Plus, label: 'Personal' },
      { priceType: PurchaseType.Organization, label: 'Team' },
    ]}
    onSelect={() => undefined}
    className="self-start"
  />
);

export const TodayDesktop = ({ withBelowFold = true }: { withBelowFold?: boolean }): ReactElement => {
  const [selected, setSelected] = useState(productOptions[0].priceId);
  return (
    <Providers>
      <PlusPage>
        <div className="flex flex-1 justify-center gap-20 pt-10">
          <div className="flex w-[28.5rem] flex-col">
            {toggle}
            <PlusInfo
              productOptions={productOptions}
              selectedOption={selected}
              onChange={({ priceId }) => setSelected(priceId)}
              shouldShowPlusHeader
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="min-h-40 w-[28.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
              <PaddleFrameMock
                look="production"
                browser="other"
                today={selected === 'pri_annual' ? '$89.99' : '$9.99'}
                then={selected === 'pri_annual' ? '$89.99/year from 8 Oct 2027' : '$9.99/month from 8 Nov 2026'}
                vatField
                discountField
              />
            </div>
            <div className="flex justify-center">
              <PlusTrustRefund />
            </div>
          </div>
        </div>
        {withBelowFold && (
          <div className="mx-auto w-full max-w-5xl px-6 pb-16">
            <PlusApiShowcase />
            <PlusFAQ />
          </div>
        )}
      </PlusPage>
    </Providers>
  );
};

/** Below 1020px production is two pages: this one (PlusMobile: pick a cycle,
    Continue) and then /plus/payment with the frame alone. */
export const TodayMobile = ({ step = 'plan' }: { step?: 'plan' | 'payment' }): ReactElement => {
  const [selected, setSelected] = useState(productOptions[0].priceId);
  return (
    <Providers>
      <PlusPage>
        {step === 'plan' ? (
          <div className="flex flex-col gap-4 px-4 pb-10 pt-4">
            {toggle}
            <PlusInfo
              productOptions={productOptions}
              selectedOption={selected}
              onChange={({ priceId }) => setSelected(priceId)}
              onContinue={() => undefined}
              shouldShowPlusHeader
            />
            <PlusTrustRefund />
            <PlusApiShowcase />
            <PlusFAQ />
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 pb-10 pt-4">
            <PaddleFrameMock look="production" browser="other" vatField discountField />
          </div>
        )}
      </PlusPage>
    </Providers>
  );
};

/** Production's /plus/success (webapp/pages/plus/success.tsx), redrawn from the
    same shared components because Storybook can't import webapp pages. Same
    for personal, team and gift today. */
export const TodaySuccess = (): ReactElement => (
  <Providers>
    <PlusPage>
      <div className="flex flex-1 items-center justify-center gap-20 px-4 py-16">
        <div className="flex max-w-[28.5rem] flex-col items-center text-center">
          <ChecklistAIcon size={IconSize.XXXLarge} className="mb-4 text-action-plus-default" />
          <Typography tag={TypographyTag.H1} type={TypographyType.LargeTitle} color={TypographyColor.Primary} bold>
            Payment successful
          </Typography>
          <Typography tag={TypographyTag.Span} type={TypographyType.Body} color={TypographyColor.Tertiary} className="my-6">
            Success! Your payment is complete, you’re all set.
          </Typography>
          <span className="flex flex-col gap-4 tablet:flex-row">
            <Button variant={ButtonVariant.Primary} tag="a" size={ButtonSize.Large}>
              See what&apos;s included in Plus
            </Button>
            <Button variant={ButtonVariant.Secondary} tag="a" size={ButtonSize.Large}>
              Back to feed
            </Button>
          </span>
        </div>
      </div>
    </PlusPage>
  </Providers>
);
