import React from 'react';
import type { ReactElement } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import Textarea from '../../../components/fields/Textarea';
import { ProgressStep } from './ProgressStep';

export const RejectionReasonStep = ({
  value,
  currentStep,
  totalSteps,
  onChange,
  skipButton,
}: {
  value: string;
  currentStep: number;
  totalSteps: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  skipButton?: React.ReactNode;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Help us improve
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          Understanding why this wasn&apos;t the right fit helps us surface
          better matches for you in the future.
        </Typography>
      </FlexCol>
      <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <Typography type={TypographyType.Title3}>
          Why did you reject this opportunity?
        </Typography>
        <Textarea
          inputId="rejection-reason"
          placeholder="E.g., Not interested in the tech stack, location doesn't work for me, compensation too low..."
          label="rejection-reason"
          rows={5}
          maxLength={500}
          fieldType="quaternary"
          value={value}
          onChange={onChange}
        />
        {skipButton}
      </FlexCol>
    </>
  );
};
