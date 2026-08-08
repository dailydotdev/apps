import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
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
  VIcon,
} from '../../../components/icons';
import type { Deal } from '../types';
import { DealState, DealType } from '../types';
import {
  dealTypeToCtaLabel,
  dealTypeToLabel,
  getDealPath,
  getDealSavingPhrase,
  hasDealEnded,
} from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { DealBrandLogo } from './DealBrandLogo';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCaveatStrip } from './DealCaveatStrip';
import { DealRedemptionNote } from './DealRedemptionNote';
import { DealCommunityProof } from './DealCommunityProof';

interface DealListCardProps {
  deal: Deal;
  onClaim?: (deal: Deal) => void;
  onOpenDetail?: (deal: Deal) => void;
  onShare?: (deal: Deal) => void;
  isClaimedByMe?: boolean;
  now?: number;
  className?: string;
}

const typeToCtaIcon: Partial<Record<DealType, ReactElement>> = {
  [DealType.PromoCode]: <CopyIcon />,
  [DealType.Affiliate]: <OpenLinkIcon />,
  [DealType.Exclusive]: <LockIcon />,
};

/**
 * The exhaustive listing form. It fits more offers per viewport than the grid
 * card and reads as a directory rather than a shop, so height and scroll
 * constraints stay on the grid variant.
 */
export const DealListCard = ({
  deal,
  onClaim,
  onOpenDetail,
  onShare,
  isClaimedByMe,
  now,
  className,
}: DealListCardProps): ReactElement => {
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
  const savingPhrase = getDealSavingPhrase(deal.value);
  const metadata = [
    deal.brand.name,
    dealTypeToLabel[deal.type],
    deal.categories[0],
  ]
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
    <li
      className={classNames(
        'flex flex-wrap items-start gap-x-3 gap-y-3 rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover',
        isExpired && 'grayscale',
        isMuted && 'opacity-60',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-60 items-start gap-3">
        <DealBrandLogo brand={deal.brand} isMuted={isMuted} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <DealBadge deal={deal} now={currentMs} />
          <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
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
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {metadata}
            {deal.pool && ` · ${deal.pool.left} of ${deal.pool.total} left`}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="line-clamp-2"
          >
            {deal.description}
          </Typography>
          {!isMuted && <DealCaveatStrip deal={deal} />}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-0.5 tablet:items-end">
        <DealValueBadge value={deal.value} isMuted={isMuted} />
        {savingPhrase && (
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {savingPhrase}
          </Typography>
        )}
      </div>

      <div className="flex basis-full flex-wrap items-center gap-x-3 gap-y-2">
        {isSoldOut && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            disabled
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
        {!isMuted && (
          <DealRedemptionNote
            deal={deal}
            className="w-full min-w-0 tablet:w-auto tablet:flex-1"
          />
        )}
      </div>

      <DealCommunityProof
        community={deal.community}
        isMuted={isMuted}
        now={currentMs}
        className="basis-full"
      />
    </li>
  );
};
