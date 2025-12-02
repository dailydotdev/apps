import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol } from '../utilities';

export interface ScreeningQuestion {
  question: string;
  answer: string;
}

export interface ScreeningQuestionsProps {
  questions: ScreeningQuestion[];
}

export const ScreeningQuestions = ({
  questions,
}: ScreeningQuestionsProps): ReactElement => {
  return (
    <FlexCol className="gap-6">
      <Typography type={TypographyType.Body}>Screening questions</Typography>

      <FlexCol className="gap-6">
        {questions.length > 0 ? (
          questions.map((q) => (
            <FlexCol key={q.question} className="flex-1 gap-2">
              <Typography type={TypographyType.Callout} bold>
                {q.question}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="whitespace-pre-wrap break-words"
              >
                {q.answer}
              </Typography>
            </FlexCol>
          ))
        ) : (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            No screening questions available
          </Typography>
        )}
      </FlexCol>
    </FlexCol>
  );
};
