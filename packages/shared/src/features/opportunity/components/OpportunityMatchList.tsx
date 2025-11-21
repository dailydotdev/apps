import React from 'react';
import type { ReactElement } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SourceAvatar } from '../../../components/profile/source';
import { ProfileImageSize } from '../../../components/ProfilePicture';
import Link from '../../../components/utilities/Link';
import { opportunityUrl } from '../../../lib/constants';
import type { OpportunityMatch } from '../types';
import { OpportunityMatchStatus } from '../types';
import { getPlusMemberDateFormat } from '../../../lib/dateFormat';

interface OpportunityMatchListProps {
  matches: OpportunityMatch[];
  title: string;
}

const matchStatusLabels: Record<OpportunityMatchStatus, string> = {
  [OpportunityMatchStatus.Pending]: 'New match',
  [OpportunityMatchStatus.CandidateAccepted]: 'Waiting for recruiter to answer',
  [OpportunityMatchStatus.CandidateRejected]: 'You declined',
  [OpportunityMatchStatus.CandidateTimeOut]: 'Expired',
  [OpportunityMatchStatus.RecruiterAccepted]: 'Matched!',
  [OpportunityMatchStatus.RecruiterRejected]: 'Recruiter declined',
};

const matchStatusColors: Record<OpportunityMatchStatus, string> = {
  [OpportunityMatchStatus.Pending]: 'bg-action-upvote-float',
  [OpportunityMatchStatus.CandidateAccepted]: 'bg-action-upvote-float',
  [OpportunityMatchStatus.CandidateRejected]:
    'bg-surface-float text-text-tertiary',
  [OpportunityMatchStatus.CandidateTimeOut]:
    'bg-surface-float text-text-tertiary',
  [OpportunityMatchStatus.RecruiterAccepted]:
    'bg-surface-float text-text-tertiary',
  [OpportunityMatchStatus.RecruiterRejected]:
    'bg-surface-float text-text-tertiary',
};

export const OpportunityMatchList = ({
  matches,
  title,
}: OpportunityMatchListProps): ReactElement => {
  if (matches.length === 0) {
    return null;
  }

  return (
    <FlexCol className="gap-4">
      <Typography type={TypographyType.Title3} bold>
        {title}
      </Typography>
      <FlexCol className="gap-3">
        {matches.map((match) => {
          const { opportunity } = match;
          if (!opportunity) {
            return null;
          }

          return (
            <Link
              key={match.opportunityId}
              href={`${opportunityUrl}/${opportunity.id}`}
              passHref
            >
              <a className="flex items-center gap-3 p-4">
                <SourceAvatar
                  source={{
                    image: opportunity.organization.image,
                    handle: opportunity.organization.name,
                  }}
                  size={ProfileImageSize.Large}
                />
                <FlexCol className="min-w-0 flex-1 gap-1">
                  <Typography
                    type={TypographyType.Body}
                    bold
                    truncate
                    color={TypographyColor.Primary}
                  >
                    {opportunity.title}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {opportunity.organization.name} •{' '}
                    {getPlusMemberDateFormat(match.createdAt)}
                  </Typography>
                  <span
                    className={`mr-auto whitespace-nowrap rounded-8 px-2 py-0.5 text-xs ${
                      matchStatusColors[match.status]
                    }`}
                  >
                    {matchStatusLabels[match.status]}
                  </span>
                </FlexCol>
              </a>
            </Link>
          );
        })}
      </FlexCol>
    </FlexCol>
  );
};
