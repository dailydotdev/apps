import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DocsIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { CandidatePreferenceButton } from './CandidatePreferenceButton';
import { TargetId } from '../../../lib/log';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { UserCandidatePreferences } from '../types';

export const CVExists = ({
  preferences,
}: {
  preferences: UserCandidatePreferences;
}): ReactElement => {
  const { user } = useAuthContext();
  return (
    <div className="rounded-16 border-border-subtlest-secondary bg-blur-baseline tablet:w-full mx-auto mt-10 flex max-w-[42.5rem] flex-col items-center gap-6 border p-6">
      <Typography type={TypographyType.LargeTitle} bold center>
        You&apos;re all set
      </Typography>
      <VIcon
        size={IconSize.XXLarge}
        className="border-border-subtlest-secondary self-center rounded-full border p-2"
      />

      <Typography
        center
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
        className="flex max-w-[75%] items-center gap-2"
      >
        Your CV gives us the signal to cut the noise. Refine your job
        preferences to get sharper matches.
      </Typography>

      <Typography
        center
        type={TypographyType.Title4}
        color={TypographyColor.Secondary}
        className="flex items-center gap-2"
      >
        <DocsIcon size={IconSize.Large} />
        {preferences?.cv?.fileName ?? `${user.username}.pdf`}
      </Typography>

      <CandidatePreferenceButton targetId={TargetId.OpportunityWelcomePage} />
    </div>
  );
};
