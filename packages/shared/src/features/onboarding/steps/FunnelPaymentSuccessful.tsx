'use client';

import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { FunnelStepTransitionType } from '../types/funnel';
import { IconSize } from '../../../components/Icon';
import {
  TypographyColor,
  TypographyTag,
  TypographyType,
  Typography,
} from '../../../components/typography/Typography';
import { ChecklistAIcon } from '../../../components/icons';
import { cloudinaryOnboardingFullBackgroundDesktop } from '../../../lib/image';
import { LazyImage } from '../../../components/LazyImage';
import Logo from '../../../components/Logo';
import type { FunnelStepPaymentSuccessful } from '../types/funnel';
import { sanitizeMessage } from '../shared';

export const FunnelPaymentSuccessful = ({
  onTransition,
  parameters: {
    headline = 'Payment successful!',
    explainer = `Your payment is complete, you're all set.`,
    imageUrl = cloudinaryOnboardingFullBackgroundDesktop,
    cta = 'Continue',
  },
}: FunnelStepPaymentSuccessful): ReactElement => {
  const { headHtml, descHtml } = useMemo(() => {
    return {
      headHtml: sanitizeMessage(headline),
      descHtml: sanitizeMessage(explainer),
    };
  }, [headline, explainer]);

  return (
    <div className="relative left-1/2 flex w-full min-w-[100dvw] flex-1 -translate-x-1/2 justify-center overflow-hidden">
      <LazyImage
        className="left-0 top-0 -z-1 h-full w-full translate-y-52 scale-150 blur-3xl"
        imgSrc={imageUrl}
        imgAlt="Blurred purple background"
        absolute
      />
      <div className="flex w-full flex-col gap-10">
        <div className="grid h-12 place-items-center bg-background-default">
          <Logo isPlus />
        </div>
        <div className="flex flex-col items-center">
          <ChecklistAIcon
            size={IconSize.XXXLarge}
            className="mb-4 text-action-plus-default"
          />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            dangerouslySetInnerHTML={{ __html: headHtml }}
          />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="my-6"
            dangerouslySetInnerHTML={{ __html: descHtml }}
          />

          <span className="flex flex-col gap-4">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={() =>
                onTransition({
                  type: FunnelStepTransitionType.Complete,
                })
              }
            >
              {cta}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
};
