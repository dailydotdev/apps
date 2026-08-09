import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { AlertIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Deal } from '../types';
import { DealState } from '../types';
import {
  dealTypeToLabel,
  getDealAction,
  getDealCoverMedia,
  hasDealEnded,
} from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { useDealCardLink } from '../useDealCardLink';
import { DealBrandLogo, DealBrandTileSize } from './DealBrandLogo';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCoresCost } from './DealCoresCost';
import { DealActionButton } from './DealActionButton';
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
      <DealBrandLogo
        brand={deal.brand}
        isMuted={isMuted}
        size={DealBrandTileSize.Thumbnail}
      />
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
        <span className="absolute -bottom-1 -left-1 z-1 flex">
          <DealBrandLogo
            brand={deal.brand}
            isMuted={isMuted}
            size={DealBrandTileSize.Badge}
          />
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
  const isMuted = isExpired || isSoldOut;
  const openDetail = onOpenDetail ?? onClaim;
  const action = getDealAction({ isExpired, isSoldOut, isClaimed });
  const cardLink = useDealCardLink(deal, openDetail);

  return (
    <li
      className={classNames(
        'relative flex cursor-pointer gap-4 border-t border-border-subtlest-tertiary px-2 py-4 transition-colors first:border-t-0 hover:bg-surface-hover',
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
            <Link href={cardLink.href} passHref>
              <a
                href={cardLink.href}
                className="line-clamp-2 after:absolute after:inset-0 after:content-['']"
                onMouseDown={cardLink.onMouseDown}
                onClick={cardLink.onClick}
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
          <div className="flex flex-col items-start gap-1 tablet:items-end">
            <DealValueBadge value={deal.value} isMuted={isMuted} />
            {deal.unlock?.cores && <DealCoresCost cores={deal.unlock.cores} />}
          </div>

          <div className="relative z-1 flex items-center gap-2 tablet:justify-end">
            <DealCopyLinkButton deal={deal} />
            <DealActionButton
              action={action}
              onClick={() => openDetail?.(deal)}
            />
          </div>
        </div>
      </div>
    </li>
  );
};
