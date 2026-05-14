import type { ReactElement } from 'react';
import React from 'react';
import { Loader } from '../../../../components/Loader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizEnrichingProps {
  message?: string;
  tip?: string;
}

export const PersonaQuizEnriching = ({
  message = 'Cooking up your developer profile…',
  tip,
}: PersonaQuizEnrichingProps): ReactElement => (
  <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-10">
    <Loader />
    <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
      {message}
    </Typography>
    {tip ? (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
        className="max-w-xs text-center"
      >
        Tip: {tip}
      </Typography>
    ) : null}
  </div>
);
