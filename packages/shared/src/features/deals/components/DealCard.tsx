import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { Card, CardSpace } from '../../../components/cards/common/Card';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  CopyIcon,
  InviteIcon,
  LockIcon,
  OpenLinkIcon,
  ShareIcon,
  UpvoteIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Deal, DealLock } from '../types';
import { DealState, DealType } from '../types';
import {
  dealTypeToCtaLabel,
  dealTypeToLabel,
  formatCompactNumber,
  getDealCoverMedia,
  getDealPath,
  getDealSavingPhrase,
  hasDealEnded,
} from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { DealBrandLogo } from './DealBrandLogo';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCaveatStrip } from './DealCaveatStrip';
import { DealRedemptionNote } from './DealRedemptionNote';
import { DealCommunityProof } from './DealCommunityProof';
import { DealBoostMeter } from './DealBoostMeter';
import { DealInviteCount, DealInviteProgress } from './DealInviteProgress';

interface DealCardProps {
  deal: Deal;
  onClaim?: (deal: Deal) => void;
  onOpenDetail?: (deal: Deal) => void;
  onShare?: (deal: Deal) => void;
  onUpvote?: (deal: Deal) => void;
  isClaimedByMe?: boolean;
  isUpvoted?: boolean;
  now?: number;
  className?: string;
}

const typeToCtaIcon: Partial<Record<DealType, ReactElement>> = {
  [DealType.PromoCode]: <CopyIcon />,
  [DealType.Affiliate]: <OpenLinkIcon />,
  [DealType.Exclusive]: <LockIcon />,
};

const DealLockRow = ({ lock }: { lock: DealLock }): ReactElement => (
  <div className="flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2">
    <LockIcon size={IconSize.XSmall} secondary />
    <DealInviteProgress lock={lock} />
    <DealInviteCount lock={lock} />
  </div>
);

export const DealCard = ({
  deal,
  onClaim,
  onOpenDetail,
  onShare,
  onUpvote,
  isClaimedByMe,
  isUpvoted,
  now,
  className,
}: DealCardProps): ReactElement => {
  const currentMs = useNowTick(now);
  const hasEnded =
    deal.state === DealState.Expiring &&
    !!deal.expiresAt &&
    hasDealEnded(deal.expiresAt, currentMs);
  const isExpired = deal.state === DealState.Expired || hasEnded;
  const isSoldOut = deal.state === DealState.SoldOut;
  const isClaimed = isClaimedByMe ?? deal.state === DealState.Claimed;
  const isLocked = deal.state === DealState.Locked;
  const isMuted = isExpired || isSoldOut;
  const openDetail = onOpenDetail ?? onClaim;
  const upvotes = deal.community.upvotes + (isUpvoted ? 1 : 0);
  const cover = getDealCoverMedia(deal);
  const savingPhrase = getDealSavingPhrase(deal.value);
  const metadata = [dealTypeToLabel[deal.type], deal.categories[0]]
    .filter(Boolean)
    .join(' · ');

  const onTitleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!openDetail || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    openDetail(deal);
  };

  return (
    <Card
      className={classNames(
        cover ? 'min-h-[33rem]' : 'min-h-[29rem]',
        isExpired && 'grayscale',
        isMuted && 'opacity-60',
        className,
      )}
    >
      <div className="absolute inset-0 flex flex-col gap-3 p-4">
        {cover && (
          <DealCoverImage
            media={cover}
            brand={deal.brand}
            isMuted={isMuted}
            className="aspect-[3/1]"
          />
        )}
        <header className="flex items-start gap-3">
          <DealBrandLogo brand={deal.brand} isMuted={isMuted} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold
              truncate
            >
              {deal.brand.name}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="tabular-nums"
            >
              {metadata}
              {deal.pool && ` · ${deal.pool.left} of ${deal.pool.total} left`}
            </Typography>
          </div>
          {onUpvote && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              icon={<UpvoteIcon size={IconSize.XSmall} secondary={isUpvoted} />}
              onClick={() => onUpvote(deal)}
              pressed={!!isUpvoted}
              aria-label={`Upvote the ${deal.brand.name} deal, ${upvotes} upvotes`}
              className="tabular-nums"
            >
              {formatCompactNumber(upvotes)}
            </Button>
          )}
        </header>

        <DealBadge deal={deal} now={currentMs} />

        <div className="flex flex-wrap items-center gap-2">
          <DealValueBadge value={deal.value} isMuted={isMuted} />
          {savingPhrase && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="tabular-nums"
            >
              {savingPhrase}
            </Typography>
          )}
        </div>

        <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
          <Link href={getDealPath(deal)} passHref>
            <a
              href={getDealPath(deal)}
              className="line-clamp-2 hover:underline"
              onClick={onTitleClick}
            >
              {deal.title}
            </a>
          </Link>
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className={cover ? 'line-clamp-2' : 'line-clamp-3'}
        >
          {deal.description}
        </Typography>

        {deal.boost && <DealBoostMeter boost={deal.boost} compact />}
        {isLocked && deal.lock && <DealLockRow lock={deal.lock} />}

        <CardSpace />

        {!isMuted && <DealCaveatStrip deal={deal} />}

        <div className="flex items-center gap-2">
          {isSoldOut && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              disabled
              className="flex-1"
            >
              Sold out
            </Button>
          )}
          {isExpired && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => openDetail?.(deal)}
              className="flex-1"
            >
              See similar
            </Button>
          )}
          {isClaimed && !isMuted && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<VIcon secondary />}
              onClick={() => openDetail?.(deal)}
              className="flex-1"
            >
              In your coupons
            </Button>
          )}
          {isLocked && !isClaimed && (
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<InviteIcon />}
              onClick={() => openDetail?.(deal)}
              className="flex-1"
            >
              Invite to unlock
            </Button>
          )}
          {!isMuted && !isClaimed && !isLocked && (
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={typeToCtaIcon[deal.type]}
              onClick={() => (onClaim ?? openDetail)?.(deal)}
              className="flex-1"
            >
              {dealTypeToCtaLabel[deal.type]}
            </Button>
          )}
          {onShare && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<ShareIcon />}
              aria-label={`Share the ${deal.brand.name} deal`}
              onClick={() => onShare(deal)}
            />
          )}
        </div>

        {!isMuted && (
          <DealRedemptionNote deal={deal} className="line-clamp-2" />
        )}

        <DealCommunityProof
          community={deal.community}
          isMuted={isMuted}
          now={currentMs}
        />
      </div>
    </Card>
  );
};
