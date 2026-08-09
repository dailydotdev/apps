import type { MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
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
  AlertIcon,
  CopyIcon,
  CoreIcon,
  InviteIcon,
  LockIcon,
  OpenLinkIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Deal } from '../types';
import { DealState, DealType } from '../types';
import {
  dealTypeToCtaLabel,
  dealTypeToLabel,
  getDealCoverMedia,
  getDealPath,
  getDealSavingPhrase,
  getDealUnlockCtaLabel,
  hasDealEnded,
} from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { DealBrandLogo } from './DealBrandLogo';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCoresCost } from './DealCoresCost';
import { DealCaveatStrip } from './DealCaveatStrip';
import { DealCommunityProof } from './DealCommunityProof';
import { DealCopyLinkButton } from './DealCopyLinkButton';

interface DealListCardProps {
  deal: Deal;
  onClaim?: (deal: Deal) => void;
  onOpenDetail?: (deal: Deal) => void;
  isClaimedByMe?: boolean;
  isTrending?: boolean;
  now?: number;
  className?: string;
}

const typeToCtaIcon: Partial<Record<DealType, ReactElement>> = {
  [DealType.PromoCode]: <CopyIcon />,
  [DealType.Affiliate]: <OpenLinkIcon />,
  [DealType.Exclusive]: <LockIcon />,
};

const DealRowThumbnail = ({
  deal,
  isMuted,
}: {
  deal: Deal;
  isMuted?: boolean;
}): ReactElement => {
  const [hasCoverFailed, setHasCoverFailed] = useState(false);
  const cover = getDealCoverMedia(deal);

  if (!cover) {
    return (
      <div className="size-16 shrink-0 tablet:size-20">
        <DealBrandLogo brand={deal.brand} isMuted={isMuted} isThumbnail />
      </div>
    );
  }

  return (
    <div className="relative size-16 shrink-0 tablet:size-20">
      <DealCoverImage
        media={cover}
        brand={deal.brand}
        isMuted={isMuted}
        onFallback={() => setHasCoverFailed(true)}
        className="h-full"
      />
      {!hasCoverFailed && (
        <span className="absolute -bottom-1 -left-1 z-1 size-8">
          <DealBrandLogo brand={deal.brand} isMuted={isMuted} isThumbnail />
        </span>
      )}
    </div>
  );
};

/**
 * The primary directory layout. Three zones on one line: what it is, what it
 * says, what it is worth and how to take it. Everything a reader does not need
 * to decide "is this for me" in two seconds lives on the deal page instead.
 */
export const DealListCard = ({
  deal,
  onClaim,
  onOpenDetail,
  isClaimedByMe,
  isTrending,
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
        'flex gap-4 border-t border-border-subtlest-tertiary px-2 py-4 transition-colors first:border-t-0 hover:bg-surface-hover',
        isExpired && 'grayscale',
        isMuted && 'opacity-60',
        className,
      )}
    >
      <DealRowThumbnail deal={deal} isMuted={isMuted} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 tablet:flex-row tablet:items-start tablet:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2">
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
            >
              {dealTypeToLabel[deal.type]}
            </Typography>
            <DealBadge deal={deal} now={currentMs} isTrending={isTrending} />
          </div>

          <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
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

          {!isMuted && deal.caveats.length > 0 && (
            <div className="flex min-w-0 items-center gap-1.5 text-text-tertiary">
              <AlertIcon size={IconSize.XXSmall} className="shrink-0" />
              <DealCaveatStrip deal={deal} limit={1} className="min-w-0" />
            </div>
          )}

          <DealCommunityProof
            community={deal.community}
            isMuted={isMuted}
            now={currentMs}
            isCompact
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-3 tablet:min-w-52 tablet:flex-col tablet:items-end">
          <div className="flex flex-col items-start tablet:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <DealValueBadge value={deal.value} isMuted={isMuted} />
              {deal.unlock?.cores && (
                <DealCoresCost cores={deal.unlock.cores} />
              )}
            </div>
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

          <div className="flex items-center gap-2 tablet:justify-end">
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
                variant={
                  deal.unlock?.cores
                    ? ButtonVariant.Primary
                    : ButtonVariant.Secondary
                }
                size={ButtonSize.Small}
                icon={deal.unlock?.cores ? <CoreIcon /> : <InviteIcon />}
                onClick={() => openDetail?.(deal)}
              >
                {getDealUnlockCtaLabel(deal.unlock)}
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
            <DealCopyLinkButton deal={deal} />
          </div>
        </div>
      </div>
    </li>
  );
};
