import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ChecklistAIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  plusDetailsUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { NextSeo } from 'next-seo';
import { useBoot } from '@dailydotdev/shared/src/hooks';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketingCta/common';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

const PlusSuccessPage = (): ReactElement => {
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const clearPlusMarketing = useRef(false);

  useEffect(() => {
    if (clearPlusMarketing.current) {
      return;
    }

    if (!marketingCta) {
      return;
    }

    const { campaignId } = marketingCta;
    clearMarketingCta(campaignId);

    clearPlusMarketing.current = true;
  }, [marketingCta, clearMarketingCta]);

  return (
    <>
      <NextSeo nofollow noindex />
      <div className="flex flex-1 items-center justify-center gap-20">
        <div className="flex max-w-[28.5rem] flex-col items-center">
          <ChecklistAIcon
            size={IconSize.XXXLarge}
            className="mb-4 text-action-plus-default"
          />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
          >
            Payment successful
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="my-6"
          >
            Success! Your payment is complete, you’re all set.
          </Typography>
          <span className="flex flex-col gap-4 tablet:flex-row">
            <Button
              variant={ButtonVariant.Primary}
              tag="a"
              href={plusDetailsUrl}
              size={ButtonSize.Large}
              rel={anchorDefaultRel}
              target="_blank"
            >
              See what&apos;s included in Plus
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              tag="a"
              href={webappUrl}
              size={ButtonSize.Large}
            >
              Back to feed
            </Button>
          </span>
        </div>
      </div>
    </>
  );
};

PlusSuccessPage.getLayout = getPlusLayout;

export default PlusSuccessPage;
