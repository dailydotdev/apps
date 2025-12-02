import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { DateFormat, FlexCol } from '../../../components/utilities';
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

const AlertIcon = (
  <span className="flex size-2 rounded-full bg-action-upvote-default" />
);
const matchStatusAlert: Record<OpportunityMatchStatus, ReactElement | null> = {
  [OpportunityMatchStatus.Pending]: AlertIcon,
  [OpportunityMatchStatus.CandidateAccepted]: AlertIcon,
  [OpportunityMatchStatus.CandidateRejected]: null,
  [OpportunityMatchStatus.CandidateTimeOut]: null,
  [OpportunityMatchStatus.RecruiterAccepted]: null,
  [OpportunityMatchStatus.RecruiterRejected]: null,
};

export const OpportunityMatchList = ({
  matches,
  title,
}: OpportunityMatchListProps): ReactElement => {
  if (matches.length === 0) {
    return null;
  }

  return (
    <FlexCol className="gap-2 rounded-16 border-border-subtlest-secondary laptop:border laptop:px-4 laptop:py-6">
      <Typography
        type={TypographyType.Subhead}
        bold
        color={TypographyColor.Quaternary}
      >
        {title}
      </Typography>
      <FlexCol className="gap-4">
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
              <a className="flex items-center gap-3 p-2">
                {!!opportunity.organization && (
                  <SourceAvatar
                    source={{
                      image: opportunity.organization.image,
                      handle: opportunity.organization.name,
                    }}
                    size={ProfileImageSize.Large}
                  />
                )}
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
                    {opportunity.organization?.name || 'N/A'} •{' '}
                    <DateFormat date={match.createdAt} />
                  </Typography>
                  <div
                    className={classNames(
                      'mr-auto flex items-center gap-2 whitespace-nowrap rounded-8 px-2 py-0.5 text-xs',
                      matchStatusColors[match.status],
                    )}
                  >
                    {matchStatusAlert[match.status]}
                    {matchStatusLabels[match.status]}
                  </div>
                </FlexCol>
              </a>
            </Link>
          );
        })}
      </FlexCol>
    </FlexCol>
  );
};
