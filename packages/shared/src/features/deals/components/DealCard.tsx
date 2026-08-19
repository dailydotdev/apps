import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { Card, CardSpace } from '../../../components/cards/common/Card';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { AlertIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Deal } from '../types';
import { DealState } from '../types';
import { getDealAction, getDealCoverMedia, hasDealEnded } from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { useDealCardLink } from '../useDealCardLink';
import { DealBrandLogo } from './DealBrandLogo';
import { DealBrandCover } from './DealBrandCover';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCoresCost } from './DealCoresCost';
import { DealActionButton } from './DealActionButton';
import { DealCaveatStrip } from './DealCaveatStrip';
import { DealCopyLinkButton } from './DealCopyLinkButton';

interface DealCardProps {
  deal: Deal;
  onClaim?: (deal: Deal) => void;
  onOpenDetail?: (deal: Deal) => void;
  isClaimedByMe?: boolean;
  isTrending?: boolean;
  now?: number;
  className?: string;
}

/**
 * The browsing form, for rails only. It carries the six things a cover-led
 * card needs and nothing else: the rest of the offer lives on the deal page.
 * It sizes to its own content and leaves the row to equalise the height, so
 * the shared card's 27rem cap has to come off or a wide column clips it.
 */
export const DealCard = ({
  deal,
  onClaim,
  onOpenDetail,
  isClaimedByMe,
  isTrending,
  now,
  className,
}: DealCardProps): ReactElement => {
  const currentMs = useNowTick(now);
  const [hasCoverFailed, setHasCoverFailed] = useState(false);
  const hasEnded =
    deal.state === DealState.Expiring &&
    !!deal.expiresAt &&
    hasDealEnded(deal.expiresAt, currentMs);
  const isExpired = deal.state === DealState.Expired || hasEnded;
  const isSoldOut = deal.state === DealState.SoldOut;
  const isClaimed = isClaimedByMe ?? deal.state === DealState.Claimed;
  const isMuted = isExpired || isSoldOut;
  const openDetail = onOpenDetail ?? onClaim;
  const cover = getDealCoverMedia(deal);
  // A brand led cover already carries the mark, and a dead photo falls back to
  // the same one, so in both cases the identity line stops at the name.
  const isBrandLedCover = !cover || hasCoverFailed;
  const action = getDealAction({ isExpired, isSoldOut, isClaimed });
  const cardLink = useDealCardLink(deal, openDetail);

  return (
    <Card
      className={classNames(
        '!max-h-none cursor-pointer',
        isExpired && 'grayscale',
        isMuted && 'opacity-60',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        {cover ? (
          <DealCoverImage
            media={cover}
            brand={deal.brand}
            isMuted={isMuted}
            onFallback={() => setHasCoverFailed(true)}
            className="aspect-[3/1]"
          />
        ) : (
          <DealBrandCover
            brand={deal.brand}
            isMuted={isMuted}
            className="aspect-[3/1]"
          />
        )}

        <div className="flex flex-col gap-2">
          <header className="flex items-center gap-2">
            {!isBrandLedCover && (
              <DealBrandLogo brand={deal.brand} isMuted={isMuted} />
            )}
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              bold
              truncate
              className="min-w-0 flex-1"
            >
              {deal.brand.name}
            </Typography>
            <DealBadge deal={deal} now={currentMs} isTrending={isTrending} />
          </header>

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

          <div className="flex flex-col items-start gap-1">
            <DealValueBadge value={deal.value} isMuted={isMuted} />
            {deal.unlock?.cores && <DealCoresCost cores={deal.unlock.cores} />}
          </div>
        </div>

        <CardSpace />

        <div className="flex flex-col gap-2">
          {!isMuted && deal.caveats.length > 0 && (
            <div className="flex min-w-0 items-center gap-1.5 text-text-tertiary">
              <AlertIcon size={IconSize.XXSmall} className="shrink-0" />
              <DealCaveatStrip deal={deal} limit={1} className="min-w-0" />
            </div>
          )}

          <div className="relative z-1 flex items-center gap-2">
            <DealCopyLinkButton deal={deal} />
            <DealActionButton
              action={action}
              onClick={() => openDetail?.(deal)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
