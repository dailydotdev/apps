import type { ReactElement } from 'react';
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
import { DealBrandLogo } from './DealBrandLogo';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCaveats } from './DealCaveats';
import { DealRedemptionNote } from './DealRedemptionNote';
import { DealCommunityProof } from './DealCommunityProof';
import { DealCard } from './DealCard';
import type { Deal } from '../types';
import { DealState } from '../types';
import {
  dealTypeToCtaLabel,
  dealTypeToLabel,
  DEAL_AFFILIATE_DISCLOSURE,
  DEAL_NO_COMMISSION_DISCLOSURE,
  getDealCoverMedia,
  getDealSavingPhrase,
} from '../dealsFormat';
import { MOCK_NOW_MS } from '../mockDeals';

interface DealShareLandingProps {
  deal: Deal;
  sharerName?: string;
  sharerAvatarUrl?: string;
  similarDeals?: Deal[];
  hasEnded?: boolean;
  onJoin?: () => void;
  onClaim?: (deal: Deal) => void;
  onSelectDeal?: (deal: Deal) => void;
  isSignedIn?: boolean;
  isClaimedByMe?: boolean;
  now?: number;
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

export const DealShareLanding = ({
  deal,
  sharerName,
  sharerAvatarUrl,
  similarDeals,
  hasEnded,
  onJoin,
  onClaim,
  onSelectDeal,
  isSignedIn = false,
  isClaimedByMe = false,
  now = MOCK_NOW_MS,
  className,
}: DealShareLandingProps): ReactElement => {
  const isExpired = hasEnded ?? deal.state === DealState.Expired;
  const liveSimilarDeals = (similarDeals ?? []).slice(0, 2);
  const cover = getDealCoverMedia(deal);
  const savingPhrase = getDealSavingPhrase(deal.value);
  const metadata = [dealTypeToLabel[deal.type], deal.categories[0]]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={classNames(
        'mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 tablet:px-8',
        className,
      )}
    >
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

      <section className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-6">
        <div className="flex items-center gap-3">
          <DealBrandLogo brand={deal.brand} isMuted={isExpired} />
          <div className="flex flex-1 flex-col gap-1">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              bold
            >
              {deal.brand.name}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {metadata}
            </Typography>
          </div>
          <DealBadge deal={deal} now={now} />
        </div>

        {cover && (
          <DealCoverImage
            media={cover}
            brand={deal.brand}
            isMuted={isExpired}
            isEager
            showCaption
            className="aspect-[3/1]"
          />
        )}

        <Typography tag={TypographyTag.H1} type={TypographyType.Title1} bold>
          {deal.title}
        </Typography>

        <div className="flex flex-wrap items-center gap-2">
          <DealValueBadge value={deal.value} isMuted={isExpired} />
          {savingPhrase && !isExpired && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="tabular-nums"
            >
              {savingPhrase}
            </Typography>
          )}
          {isExpired && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Quaternary}
              bold
            >
              This deal ended
            </Typography>
          )}
        </div>

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
        >
          {isExpired
            ? 'This one closed before you got here. Deals like it come back most months, and the live ones below are open right now.'
            : deal.description}
        </Typography>

        <DealCommunityProof
          community={deal.community}
          isMuted={isExpired}
          now={now}
        />

        {!isExpired && (
          <DealCaveats
            deal={deal}
            className="border-t border-border-subtlest-tertiary pt-4"
          />
        )}

        {!isExpired &&
          (isSignedIn ? (
            <Button
              tag="a"
              href={deal.partnerUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={() => onClaim?.(deal)}
              className="w-full tablet:w-fit"
            >
              {dealTypeToCtaLabel[deal.type]}
            </Button>
          ) : (
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              disabled={isClaimedByMe}
              onClick={() => onJoin?.()}
              className="w-full tablet:w-fit"
            >
              Claim this deal
            </Button>
          ))}

        {!isExpired && <DealRedemptionNote deal={deal} />}

        {isSignedIn && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.StatusSuccess}
            aria-live="polite"
          >
            {isClaimedByMe && 'Saved to My coupons.'}
          </Typography>
        )}

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {deal.isCommissioned
            ? DEAL_AFFILIATE_DISCLOSURE
            : DEAL_NO_COMMISSION_DISCLOSURE}
        </Typography>
      </section>

      {isExpired && liveSimilarDeals.length > 0 && (
        <section className="flex flex-col gap-4">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            Live right now instead
          </Typography>
          <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
            {liveSimilarDeals.map((similar) => (
              <DealCard
                key={similar.id}
                deal={similar}
                onOpenDetail={onSelectDeal}
                onClaim={isSignedIn ? onClaim : () => onJoin?.()}
                now={now}
              />
            ))}
          </div>
        </section>
      )}

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
};
