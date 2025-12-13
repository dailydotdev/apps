import type { ReactElement } from 'react';
import React from 'react';
import type { OpportunityMatch } from '../types';
import {
  mapMatchToProfile,
  mapMatchToEngagement,
  mapMatchToScreeningQuestions,
} from '../utils';
import { MatchReviewHeader } from '../../../components/recruiter/MatchReviewHeader';
import { MatchProfile } from '../../../components/recruiter/MatchProfile';
import { MatchInsights } from '../../../components/recruiter/MatchInsights';
import { ScreeningQuestions } from '../../../components/recruiter/ScreeningQuestions';
import { EngagementProfile } from '../../../components/recruiter/EngagementProfile';

type MatchCardProps = {
  match: OpportunityMatch;
  currentMatch: number;
  totalMatches: number;
  onReject?: () => void;
  onApprove?: () => void;
  disabled?: boolean;
};

export const MatchCard = ({
  match,
  currentMatch,
  totalMatches,
  onReject,
  onApprove,
  disabled,
}: MatchCardProps): ReactElement => {
  const profile = mapMatchToProfile(match);
  const engagement = mapMatchToEngagement(match);
  const screeningQuestions = mapMatchToScreeningQuestions(match);

  return (
    <div className="flex max-w-full flex-shrink flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-invert">
      <MatchReviewHeader
        currentMatch={currentMatch}
        totalMatches={totalMatches}
        name={profile.name}
        onReject={onReject}
        onApprove={onApprove}
        disabled={disabled}
      />
      <div className="flex gap-8 p-6">
        <div className="flex flex-1 flex-col gap-6">
          <MatchProfile profile={profile} />
          <MatchInsights applicationRank={match.applicationRank} />
        </div>
        <div className="flex flex-1 flex-col gap-6">
          <ScreeningQuestions questions={screeningQuestions} />
        </div>
      </div>
      <EngagementProfile engagement={engagement} />
    </div>
  );
};
