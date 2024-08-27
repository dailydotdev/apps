import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { IconSize } from '../Icon';
import { TruncateText, truncateTextClassNames } from '../utilities';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Company } from '../../lib/userCompany';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export type UserMetadataProps = Pick<
  PublicProfile,
  'name' | 'username' | 'createdAt'
> &
  Partial<Pick<PublicProfile, 'reputation'>> & {
    className?: string;
    company?: Pick<Company, 'name' | 'image'>;
  };

export function UserMetadata({
  name,
  username,
  createdAt,
  reputation,
  className,
  company,
}: UserMetadataProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col text-text-quaternary typo-caption2',
        className,
      )}
    >
      <div className="flex items-center">
        <h2
          className={classNames(
            truncateTextClassNames,
            'font-bold text-text-primary typo-title3',
          )}
        >
          {name}
        </h2>
        {reputation && (
          <ReputationUserBadge
            className="ml-0.5 !typo-footnote"
            user={{ reputation }}
            iconProps={{ size: IconSize.XSmall }}
            disableTooltip
          />
        )}
      </div>
      <div className="flex items-center">
        <TruncateText className="text-text-secondary typo-footnote">
          @{username}
        </TruncateText>
        <Separator />
        <JoinedDate
          className="text-text-quaternary typo-caption2"
          date={new Date(createdAt)}
        />
      </div>
      {!!company && (
        <div className="mt-4 flex items-center gap-1">
          <ProfilePicture
            className="border border-border-subtlest-secondary"
            size={ProfileImageSize.Size16}
            user={{
              image: company.image,
              id: company.name,
            }}
            rounded="full"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {company.name}
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            Verified
          </Typography>
        </div>
      )}
    </div>
  );
}
