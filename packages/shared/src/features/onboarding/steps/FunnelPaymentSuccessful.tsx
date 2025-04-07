'use client';

import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import type { FunnelStepTransitionCallback } from '../types/funnel';
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

type FunnelPaymentSuccessfulProps = {
  onTransition: FunnelStepTransitionCallback<void>;
};

const FunnelPaymentSuccessful = ({
  onTransition,
}: FunnelPaymentSuccessfulProps): ReactElement => {
  return (
    <div className="relative flex w-full flex-1 justify-center">
      <LazyImage
        src={cloudinaryOnboardingFullBackgroundDesktop}
        className="left-0 top-0 -z-1 h-full w-full translate-y-52 scale-150 blur-3xl"
        imgSrc={cloudinaryOnboardingFullBackgroundDesktop}
        imgAlt="Blurred purple background"
        absolute
      />
      <div className="flex w-full flex-col gap-10">
        <div className="h-12 bg-background-default">
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
          >
            Payment successful!
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="my-6"
          >
            Success! Your payment is complete, you’re all set.
          </Typography>
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
              Continue
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FunnelPaymentSuccessful;
