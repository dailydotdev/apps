import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { HackathonSignupButton } from './HackathonSignupButton';

export const HackathonClosingCTA = (): ReactElement => {
  return (
    <FlexCol className="w-full items-center gap-3 rounded-16 bg-surface-float p-8 text-center">
      <Typography type={TypographyType.Title3} bold center>
        Ready to build?
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        center
        className="max-w-md"
      >
        Sign up now and we&apos;ll send you the kickoff details and how to get
        your API access before the hackathon opens.
      </Typography>
      <div className="mt-2">
        <HackathonSignupButton />
      </div>
    </FlexCol>
  );
};
