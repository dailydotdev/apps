import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { PageWidgets } from '../../utilities';
import AuthContext from '../../../contexts/AuthContext';
import FurtherReading from '../../widgets/FurtherReading';
import type { Post } from '../../../graphql/posts';
import type { SourceTooltip } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { Origin } from '../../../lib/log';
import EntityCardSkeleton from '../../cards/entity/EntityCardSkeleton';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ARBITRAGE_SLOT } from './slots';

const SourceEntityCard = dynamic(
  /* webpackChunkName: "sourceEntityCard" */ () =>
    import('../../cards/entity/SourceEntityCard'),
  { loading: () => <EntityCardSkeleton /> },
);

const SquadEntityCard = dynamic(
  /* webpackChunkName: "squadEntityCard" */ () =>
    import('../../cards/entity/SquadEntityCard'),
  { loading: () => <EntityCardSkeleton /> },
);

export interface ArbitragePostWidgetsProps {
  post: Post;
  className?: string;
}

/**
 * Widget column for the ad template. Mirrors PostWidgets minus PostSignupWidget
 * and the share bars: this template optimises for impressions, not signups or
 * shares, so that vertical space goes to slots 10-12 instead.
 */
export function ArbitragePostWidgets({
  post,
  className,
}: ArbitragePostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { source } = post;
  const cardClasses = 'w-full bg-transparent';

  let sourceCard = null;
  if (source?.type === SourceType.Squad) {
    sourceCard = (
      <SquadEntityCard
        className={{ container: cardClasses }}
        handle={source.handle}
        origin={Origin.ArticlePage}
      />
    );
  } else if (source) {
    sourceCard = (
      <SourceEntityCard
        className={{ container: cardClasses }}
        source={source as SourceTooltip}
      />
    );
  }

  return (
    <PageWidgets className={className}>
      {sourceCard}
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.railMpu1}
        format={ArbitrageAdFormat.Rectangle}
        reach="70%"
      />
      {tokenRefreshed && <FurtherReading currentPost={post} hideToc />}
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.railMpu2}
        format={ArbitrageAdFormat.Rectangle}
        reach="45%"
      />
      {/* Sticky unit must be the column's last child: a sticky element slides
          down over any siblings that follow it once the page scrolls. Last in
          the column it sticks for the whole article read with nothing below
          to cover. */}
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.railStickyMpu}
        format={ArbitrageAdFormat.HalfPage}
        reach="100%"
        className="laptop:sticky laptop:top-20"
      />
    </PageWidgets>
  );
}
