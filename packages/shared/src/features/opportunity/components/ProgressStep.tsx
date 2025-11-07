import React from 'react';
import type { ReactElement } from 'react';
import { FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import ProgressCircle from '../../../components/ProgressCircle';

export const ProgressStep = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}): ReactElement => {
  return (
    <FlexRow className="items-center gap-2">
      <ProgressCircle
        size={16}
        stroke={2}
        progress={(currentStep / totalSteps) * 100}
      />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Step {currentStep} of {totalSteps}
      </Typography>
    </FlexRow>
  );
};
