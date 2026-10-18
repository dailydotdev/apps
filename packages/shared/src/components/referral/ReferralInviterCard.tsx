import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { WithClassNameProps } from '../utilities';
import { referringUserQueryOptions } from '../../graphql/users';
import { getInviteReferral } from '../../lib/referral';
import { LogEvent, TargetType } from '../../lib/log';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';

export const ReferralInviterCard = ({
  className,
}: WithClassNameProps): ReactElement | null => {
  const { query } = useRouter();
  const referral = getInviteReferral(query);
  const { data: inviter } = useQuery({
    ...referringUserQueryOptions(referral?.userId ?? ''),
    enabled: !!referral,
  });
  const isVisible = !!referral && !!inviter;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReferralInviterCard,
      target_id: inviter?.id,
      extra: JSON.stringify({ campaign: referral?.campaign }),
    }),
    { condition: isVisible },
  );

  if (!isVisible) {
    return null;
  }

  return (
    <figure
      className={classNames(
        'flex w-full max-w-[22.5rem] items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 text-left backdrop-blur-sm',
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
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        className="min-w-0 flex-1"
        truncate
      >
        <strong>{inviter.name}</strong>
        <span className="text-text-secondary"> invited you</span>
      </Typography>
    </figure>
  );
};
