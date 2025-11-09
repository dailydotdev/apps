import React from 'react';
import type { ReactElement } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { PreferenceOptionsForm } from '../../../components/opportunity/PreferenceOptionsForm';
import { ProgressStep } from './ProgressStep';

export const PreferenceFormStep = ({
  currentStep,
  totalSteps,
  skipButton,
}: {
  currentStep: number;
  totalSteps: number;
  skipButton?: React.ReactNode;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Train us to find your unicorn job
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          Tell us exactly what&apos;s worth bugging you about so we can ghost
          every irrelevant recruiter on your behalf. The better you set this up,
          the less nonsense you&apos;ll ever see.
        </Typography>
      </FlexCol>
      <FlexCol className="rounded-16 border-border-subtlest-tertiary gap-3 border p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <div className="flex w-full flex-col gap-2">
          <PreferenceOptionsForm />
        </div>
        {skipButton}
      </FlexCol>
    </>
  );
};
