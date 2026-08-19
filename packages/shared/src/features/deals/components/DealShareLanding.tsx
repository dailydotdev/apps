import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { fallbackImages } from '../../../lib/config';
import { DealContent, DealContentPresentation } from './DealContent';
import type { Deal } from '../types';
import { DealState } from '../types';
import type { DealComment } from '../mockCommunity';
import { MOCK_NOW_MS } from '../mockDeals';

interface DealShareLandingProps {
  deal: Deal;
  sharerName?: string;
  sharerAvatarUrl?: string;
  comments?: DealComment[];
  similarDeals?: Deal[];
  hasEnded?: boolean;
  onJoin?: () => void;
  onClaim?: (deal: Deal) => void;
  onCodeFeedback?: (worked: boolean) => void;
  isSignedIn?: boolean;
  isClaimedByMe?: boolean;
  now?: number;
  shareBar?: ReactNode;
  className?: string;
}

const directoryDealCount = 240;
const memberCount = '742,000';

const socialProofAvatars = [
  {
    id: 'proof-1',
    url: 'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  },
  {
    id: 'proof-2',
    url: 'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
  },
  {
    id: 'proof-3',
    url: 'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  },
  {
    id: 'proof-4',
    url: 'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
  },
];

const JoinWall = ({ onJoin }: { onJoin?: () => void }): ReactElement => (
  <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
    <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
      Join daily.dev to claim. Free forever.
    </Typography>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
    >
      One account unlocks every deal in the directory, plus the dev feed the
      rest of us read every morning. No card, no trial.
    </Typography>
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      onClick={onJoin}
      className="w-full tablet:w-fit"
    >
      Join daily.dev to claim
    </Button>
    <div className="flex items-center gap-2">
      <span className="flex -space-x-2">
        {socialProofAvatars.map((avatar) => (
          <img
            key={avatar.id}
            src={avatar.url}
            alt=""
            aria-hidden
            loading="lazy"
            className="size-6 rounded-full border border-background-default object-cover"
          />
        ))}
      </span>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        {memberCount} devs already in
      </Typography>
    </div>
  </div>
);

/**
 * The page presentation of a deal, plus the framing a shared `?ref=` link
 * carries: who sent it, and the wall a visitor without an account has to pass.
 * The deal body itself is `DealContent`, the same component the modal renders.
 */
export const DealShareLanding = ({
  deal,
  sharerName,
  sharerAvatarUrl,
  comments,
  similarDeals,
  hasEnded,
  onJoin,
  onClaim,
  onCodeFeedback,
  isSignedIn = false,
  isClaimedByMe = false,
  now = MOCK_NOW_MS,
  shareBar,
  className,
}: DealShareLandingProps): ReactElement => (
  <div className={classNames('flex w-full flex-col gap-8', className)}>
    {sharerName && (
      <header className="flex items-center gap-3">
        <img
          src={sharerAvatarUrl ?? fallbackImages.avatar}
          alt=""
          aria-hidden
          className="size-10 rounded-full object-cover"
        />
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          <strong className="text-text-primary">{sharerName}</strong> shared
          this deal with you
        </Typography>
      </header>
    )}

    <DealContent
      deal={deal}
      presentation={DealContentPresentation.Page}
      now={now}
      comments={comments}
      similarDeals={similarDeals}
      hasEnded={hasEnded ?? deal.state === DealState.Expired}
      isSignedIn={isSignedIn}
      isClaimedByMe={isClaimedByMe}
      onClaim={onClaim}
      onJoin={onJoin}
      onCodeFeedback={onCodeFeedback}
      shareBar={shareBar}
    />

    {!isSignedIn && <JoinWall onJoin={onJoin} />}

    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
      className="tabular-nums"
    >
      This is one of {directoryDealCount} deals for devs on daily.dev.
    </Typography>
  </div>
);
