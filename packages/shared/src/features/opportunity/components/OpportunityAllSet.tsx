import React from 'react';
import type { ReactElement } from 'react';
import { JobIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { CandidatePreferenceButton } from './CandidatePreferenceButton';
import { TargetId } from '../../../lib/log';

export const OpportunityAllSet = (): ReactElement => {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-10">
      <JobIcon
        secondary
        size={IconSize.XLarge}
        className="text-text-secondary"
      />

      <Typography
        type={TypographyType.Title1}
        color={TypographyColor.Primary}
        bold
        center
      >
        You&apos;re all set!
      </Typography>

      <Typography
        center
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        We’ll surface the most relevant opportunities right here as they become
        available, so you won’t miss anything important.
      </Typography>

      <CandidatePreferenceButton
        label="Update job preferences"
        targetId={TargetId.OpportunityWelcomePage}
        className="w-full tablet:w-80"
      />
    </div>
  );
};
