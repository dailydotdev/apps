import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { InviteLinkInput } from '../../../components/referral/InviteLinkInput';
import { LockIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DealBrandLogo } from './DealBrandLogo';
import { DealValueBadge } from './DealValueBadge';
import { DealInviteCount, DealInviteProgress } from './DealInviteProgress';
import type { Deal } from '../types';
import { getDealInvitesLeft } from '../dealsFormat';

interface DealInviteUnlockProps {
  deal: Deal;
  inviteLink: string;
  onInvite?: () => void;
  className?: string;
}

const inviteAvatars = [
  'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
];

export const DealInviteUnlock = ({
  deal,
  inviteLink,
  onInvite,
  className,
}: DealInviteUnlockProps): ReactElement => {
  const invites = deal.unlock?.invites;

  if (!invites) {
    throw new Error('DealInviteUnlock needs a deal with an invite unlock');
  }

  const remaining = getDealInvitesLeft(invites);
  const isUnlocked = remaining === 0;
  const friends = remaining === 1 ? 'friend' : 'friends';

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <DealBrandLogo brand={deal.brand} />
        <div className="flex flex-1 flex-col gap-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {deal.brand.name}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            bold
          >
            {deal.title}
          </Typography>
        </div>
        <DealValueBadge value={deal.value} />
      </div>

      <div className="flex items-center gap-3">
        <DealInviteProgress
          invites={invites}
          avatarUrls={inviteAvatars}
          isLarge
        />
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          bold
          className="flex-1"
        >
          {isUnlocked
            ? `Unlocked. ${deal.value.label} on ${deal.brand.name} is yours, and both invites got it too.`
            : `Invite ${remaining} ${friends} to unlock ${deal.value.label} on ${deal.brand.name}. They get it too.`}
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        {isUnlocked ? (
          <VIcon size={IconSize.XSmall} secondary />
        ) : (
          <LockIcon size={IconSize.XSmall} secondary />
        )}
        <DealInviteCount invites={invites} />
      </div>

      <InviteLinkInput
        link={inviteLink}
        onCopy={onInvite}
        text={{ initial: 'Copy invite', copied: 'Copied' }}
        logProps={{
          event_name: 'copy deal invite link',
          extra: JSON.stringify({ deal: deal.slug }),
        }}
      />

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        How it works: both sides get the reward. Each invite counts the moment
        your friend finishes signup, and the unlock lands for all of you at
        once.
      </Typography>
    </div>
  );
};
