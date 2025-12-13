import React from 'react';
import type { ReactElement } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import Textarea from '../../../components/fields/Textarea';
import type { OpportunityScreeningQuestion } from '../types';
import { ProgressStep } from './ProgressStep';

export const ScreeningQuestionStep = ({
  question,
  value,
  currentStep,
  totalSteps,
  onChange,
}: {
  question: OpportunityScreeningQuestion;
  value: string;
  currentStep: number;
  totalSteps: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Tell us a bit more
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          These help confirm the role is truly worth your time and ensure the
          recruiter already sees you as a strong match.
        </Typography>
      </FlexCol>
      <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <Typography type={TypographyType.Title3}>{question.title}</Typography>
        <Textarea
          inputId="screening-question"
          placeholder={question.placeholder}
          label="question"
          rows={5}
          maxLength={500}
          fieldType="quaternary"
          value={value}
          onChange={onChange}
        />
      </FlexCol>
    </>
  );
};
