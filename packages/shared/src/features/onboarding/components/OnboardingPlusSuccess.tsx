import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { OnboardingOnClickNext } from '../../../components/onboarding/common';
import { ChecklistAIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';

export const OnboardingPlusSuccess = ({
  onClickNext,
}: {
  onClickNext: OnboardingOnClickNext;
}): ReactElement => {
  return (
    <div className="flex flex-1 flex-col justify-center laptop:justify-between">
      <div className="mb-14 flex flex-col items-center justify-center gap-6 text-center">
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
            size={ButtonSize.Large}
            onClick={onClickNext}
          >
            Continue
          </Button>
        </span>
      </div>
    </div>
  );
};
