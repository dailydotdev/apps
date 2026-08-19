import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import HorizontalScroll from '../../../components/HorizontalScroll/HorizontalScroll';
import {
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Pill, PillSize } from '../../../components/Pill';
import type { Deal } from '../types';
import { DealCard } from './DealCard';

interface DealsRailProps {
  title: string;
  deals: Deal[];
  label?: string;
  onDealClick?: (deal: Deal) => void;
  onClaim?: (deal: Deal) => void;
  claimedDealIds?: Set<string>;
  trendingDealIds?: Set<string>;
  now?: number;
  className?: string;
}

export const DealsRail = ({
  title,
  deals,
  label,
  onDealClick,
  onClaim,
  claimedDealIds,
  trendingDealIds,
  now,
  className,
}: DealsRailProps): ReactElement | null => {
  if (!deals.length) {
    return null;
  }

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <HorizontalScroll
        className={{ scroll: 'gap-6 py-1' }}
        scrollProps={{
          title: {
            copy: title,
            tag: TypographyTag.H2,
            type: TypographyType.Title3,
            icon: label && (
              <Pill
                label={label}
                size={PillSize.Small}
                alignment="self-center"
                className="order-last ml-2 bg-surface-float text-text-tertiary"
              />
            ),
          },
        }}
      >
        {deals.map((deal) => (
          <div key={deal.id} className="flex w-80">
            <DealCard
              deal={deal}
              onClaim={onClaim}
              onOpenDetail={onDealClick}
              isClaimedByMe={claimedDealIds?.has(deal.id)}
              isTrending={trendingDealIds?.has(deal.id)}
              now={now}
              className="w-full"
            />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
};
