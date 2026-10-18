import React from 'react';
import type { ReactElement } from 'react';

import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks';
import { PlusUser } from '../PlusUser';
import { OpenLinkIcon } from '../icons';
import Link from '../utilities/Link';
import type { WithClassNameProps } from '../utilities';
import { webappUrl } from '../../lib/constants';
import { IconSize } from '../Icon';
import { ReferralLadderGiftButton } from '../referral/ReferralLadderGiftButton';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';

type Props = WithClassNameProps & {
  shouldOpenProfile?: boolean;
  showOpenLinkIcon?: boolean;
  profileImageSize?: ProfileImageSize;
  // v2 sidebar dropdown tightens the name/handle gap; defaults to the v1 value.
  compact?: boolean;
  showReferralLadderGift?: boolean;
};

export const ProfileMenuHeader = ({
  className,
  shouldOpenProfile = false,
  showOpenLinkIcon = shouldOpenProfile,
  profileImageSize = ProfileImageSize.Large,
  compact = false,
  showReferralLadderGift = false,
}: Props): ReactElement | null => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { isEligible: isReferralLadderEligible, nextStep } = useReferralLadder({
    enabled: showReferralLadderGift,
  });

  if (!user) {
    return null;
  }

  return (
    <div className={classNames('relative flex items-center gap-2', className)}>
      {shouldOpenProfile && (
        <Link href={`${webappUrl}${user.username}`} passHref>
          <a aria-label="Open profile" className="absolute inset-0" />
        </Link>
      )}
      <ProfilePicture
        user={user}
        nativeLazyLoading
        eager
        size={profileImageSize}
        className="!rounded-10 border-background-default"
      />

      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col',
          compact ? 'gap-0.5' : 'gap-1',
        )}
      >
        <div className="flex items-center gap-1">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Primary}
            bold
            truncate
            className="min-w-0"
          >
            {user.name}
          </Typography>
          {isPlus && <PlusUser withText={false} />}
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
          translate="no"
        >
          @{user.username}
        </Typography>
      </div>

      {isReferralLadderEligible && nextStep && (
        <span className="relative">
          <ReferralLadderGiftButton nextStep={nextStep} />
        </span>
      )}

      {showOpenLinkIcon && (
        <OpenLinkIcon className="text-text-quaternary" size={IconSize.Size16} />
      )}
    </div>
  );
};
