import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol, FlexRow } from '../utilities';
import { LinkIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

export interface MatchProfileDetails {
  name: string;
  profileImage: string;
  profileLink: string;
  seniority: string;
  location: string;
  openToWork: boolean;
  company: {
    name: string;
    favicon?: string;
  };
  yearsOfExperience?: string;
  skills?: string[];
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
          <Button
            variant={ButtonVariant.Option}
            size={ButtonSize.XSmall}
            icon={<LinkIcon />}
            tag="a"
            href={profile.profileLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Show Profile
          </Button>
        </FlexRow>
      </FlexRow>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <ProfileDetailRow label="Seniority" value={profile.seniority} />
        <ProfileDetailRow label="Location" value={profile.location} />
        <ProfileDetailRow
          label="Open to work"
          value={
            <span
              className={
                profile.openToWork
                  ? 'text-action-upvote-default'
                  : 'text-text-tertiary'
              }
            >
              {profile.openToWork ? 'Yes' : 'No'}
            </span>
          }
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
        {profile.yearsOfExperience && (
          <ProfileDetailRow
            label="Experience"
            value={profile.yearsOfExperience}
          />
        )}
      </div>
    </FlexCol>
  );
};
