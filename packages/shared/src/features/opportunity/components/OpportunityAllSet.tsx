import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { opportunityBriefcaseDone } from '../../../lib/image';
import { briefButtonBg } from '../../../styles/custom';
import { TargetId } from '../../../lib/log';
import { CandidatePreferenceButton } from './CandidatePreferenceButton';

export const OpportunityAllSet = (): ReactElement => {
  return (
    <div className="flex flex-col gap-6 rounded-16 border-border-subtlest-secondary px-4 py-6 laptop:border">
      <div className="flex flex-col flex-wrap items-center gap-4 laptop:flex-row-reverse">
        <img
          src={opportunityBriefcaseDone}
          className="max-w-36"
          alt="daily.dev jobs"
        />
        <div className="flex flex-1 flex-wrap justify-center gap-2 text-center laptop:justify-start laptop:text-left">
          <Typography
            center
            type={TypographyType.Title1}
            bold
            style={{
              background: briefButtonBg,
            }}
            className="!bg-clip-text text-transparent"
          >
            You are all set!
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            className="flex-shrink"
          >
            We’ll surface the most relevant opportunities right here as they
            become available, so you won’t miss anything important.
          </Typography>
        </div>
      </div>
      <CandidatePreferenceButton
        label="Update job preferences"
        targetId={TargetId.OpportunityWelcomePage}
        className="w-full"
      />
    </div>
  );
};
