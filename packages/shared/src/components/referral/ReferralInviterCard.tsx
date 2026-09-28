import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { WithClassNameProps } from '../utilities';
import { getBasicUserInfo } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { getFirstQueryParam } from '../../lib/func';
import { REFERRAL_FRIEND_REWARD } from '../../lib/referral';
import { useReferralLadderFeature } from '../../hooks/referral/useReferralLadder';

const REFERRAL_INVITE_MESSAGE = `I want to give you ${REFERRAL_FRIEND_REWARD} for free. Sign up and it’s yours.`;

export const ReferralInviterCard = ({
  className,
}: WithClassNameProps): ReactElement | null => {
  const { query } = useRouter();
  const userId = getFirstQueryParam(query.userid);
  const { isEnabled } = useReferralLadderFeature(!!userId);
  const { data: inviter } = useQuery({
    queryKey: [generateQueryKey(RequestKey.ReferringUser), userId],
    queryFn: () => (userId ? getBasicUserInfo(userId) : null),
    enabled: !!userId && isEnabled,
  });

  if (!isEnabled || !inviter) {
    return null;
  }

  return (
    <figure
      className={classNames(
        'flex w-full max-w-[22.5rem] items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 text-left backdrop-blur-sm',
        className,
      )}
    >
      <ProfilePicture
        user={inviter}
        size={ProfileImageSize.Large}
        nativeLazyLoading
        eager
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography type={TypographyType.Callout} truncate>
          <strong>{inviter.name}</strong>
          <span className="text-text-secondary"> invited you</span>
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          “{REFERRAL_INVITE_MESSAGE}”
        </Typography>
      </div>
    </figure>
  );
};
