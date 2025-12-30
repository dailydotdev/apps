import React from 'react';
import type { ReactElement } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import ExperienceLevelDropdown from '../../../components/profile/ExperienceLevelDropdown';
import type { UserExperienceLevel } from '../../../lib/user';
import { ProgressStep } from '../../opportunity/components/ProgressStep';

export const ExperienceLevelStep = ({
  currentStep,
  totalSteps,
  defaultValue,
  onChange,
}: {
  currentStep: number;
  totalSteps: number;
  defaultValue?: keyof typeof UserExperienceLevel;
  onChange: (value: keyof typeof UserExperienceLevel) => void;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Verify your experience level
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          Make sure this is still accurate to get the best matches
        </Typography>
      </FlexCol>
      <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <ExperienceLevelDropdown
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </FlexCol>
    </>
  );
};
