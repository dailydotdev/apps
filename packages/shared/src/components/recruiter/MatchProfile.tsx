import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol, FlexRow } from '../utilities';
import { LinkIcon, ReputationIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { largeNumberFormat } from '../../lib';
import { getLastActivityDateFormat } from '../../lib/dateFormat';
import { anchorDefaultRel } from '../../lib/strings';
import { getExperienceLevelLabel } from '../../lib/user';

export interface MatchProfileDetails {
  name: string;
  profileImage: string;
  profileLink: string;
  cvUrl?: string;
  reputation?: number;
  seniority: string;
  location: string;
  openToWork: boolean;
  company: {
    name: string;
    favicon?: string;
  };
  skills?: string[];
  lastActivity?: Date | string | number;
}

export interface MatchProfileProps {
  profile: MatchProfileDetails;
}

const ProfileDetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
    <Typography type={TypographyType.Footnote} bold>
      {value}
    </Typography>
  </>
);

export const MatchProfile = ({ profile }: MatchProfileProps): ReactElement => {
  return (
    <FlexCol className="gap-4">
      <FlexRow className="items-center gap-4">
        <FlexRow className="flex-1 justify-between gap-1">
          <Typography type={TypographyType.Body}>Profile details</Typography>
          {profile.cvUrl && (
            <Button
              variant={ButtonVariant.Option}
              size={ButtonSize.XSmall}
              icon={<LinkIcon />}
              tag="a"
              href={profile.cvUrl}
              target="_blank"
              rel={anchorDefaultRel}
            >
              Show CV
            </Button>
          )}
        </FlexRow>
      </FlexRow>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <ProfileDetailRow
          label="Reputation"
          value={
            <FlexRow className="items-center gap-1">
              <ReputationIcon
                className="text-accent-onion-default"
                size={IconSize.XSmall}
              />
              <span>{largeNumberFormat(profile.reputation)}</span>
            </FlexRow>
          }
        />
        <ProfileDetailRow
          label="Seniority"
          value={getExperienceLevelLabel(profile.seniority) ?? 'Not specified'}
        />
        <ProfileDetailRow
          label="Company"
          value={
            <FlexRow className="items-center gap-2">
              {profile.company.favicon && (
                <img
                  src={profile.company.favicon}
                  alt={profile.company.name}
                  className="size-4 rounded-2"
                />
              )}
              <span>{profile.company.name}</span>
            </FlexRow>
          }
        />
        <ProfileDetailRow label="Location" value={profile.location} />
        <ProfileDetailRow
          label="Job status"
          value={
            profile.openToWork ? 'Open to new roles' : 'Not looking right now'
          }
        />
        {profile.lastActivity && (
          <ProfileDetailRow
            label="Last activity"
            value={getLastActivityDateFormat(profile.lastActivity)}
          />
        )}
      </div>
    </FlexCol>
  );
};
