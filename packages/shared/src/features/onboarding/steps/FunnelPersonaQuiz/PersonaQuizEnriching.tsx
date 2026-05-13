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
}

export const PersonaQuizEnriching = ({
  message = 'Cooking up your developer profile…',
}: PersonaQuizEnrichingProps): ReactElement => (
  <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-10">
    <Loader />
    <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
      {message}
    </Typography>
  </div>
);
