import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

export const JobPageIntro = () => {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4">
      <Typography bold center type={TypographyType.LargeTitle}>
        Now it&apos;s your turn to call the shots
      </Typography>
      <Typography
        center
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
      >
        We&apos;ve pulled this role because we believe it&apos;s worth your
        attention, but you have the final say. If it&apos;s a fit, we&apos;ll
        discuss with the recruiter. If not, it disappears without a trace.
      </Typography>
    </div>
  );
};
