import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { SquadRow } from '../kit';
import { PackRow } from '../packs';
import { packForTopic, spotlightFor, starterPacks, topSquads } from '../data';

// Version 2 of an inner page, on the production squad page's own frame
// (SquadPageLayout): the same centred width, the main column as one
// bordered card and a 320px column of SquadWidgets beside it from laptop.
// Below laptop there is no second tab: the page is the list alone (the
// topic's pack still opens it), the way the squad page reads without an
// About tab. No title bar: the selected tab above already names the page.

/** The other starter packs: the topic's own one already opens the list. */
const PacksWidget = ({ chip }: { chip: string }): ReactElement => {
  const topicPack = packForTopic(chip);
  const packs = starterPacks.filter((pack) => pack !== topicPack).slice(0, 3);
  return (
    <SquadWidget title="Starter packs">
      <ul className="mt-1 flex flex-col">
        {packs.map((pack) => (
          <PackRow key={pack.id} pack={pack} />
        ))}
      </ul>
    </SquadWidget>
  );
};

/** The same list as Discover's Trending this week, no new metric. */
const TrendingWidget = (): ReactElement => (
  <SquadWidget title="Trending this week">
    <div className="mt-2 flex flex-col">
      {topSquads.slice(0, 5).map((squad) => (
        <SquadRow key={squad.id} squad={squad} />
      ))}
    </div>
  </SquadWidget>
);

/** The right column's widgets, in production's SquadWidget frame. */
const DiscoverWidgets = ({ chip }: { chip: string }): ReactElement => (
  <>
    {/* SquadWidget's frame without its heading: the row's own meta line
        already says Promoted. */}
    <section
      aria-label="Promoted"
      className="flex w-full flex-col rounded-16 border border-border-subtlest-tertiary px-4 py-2"
    >
      <SquadRow squad={spotlightFor(chip)} promoted description />
    </section>
    <PacksWidget chip={chip} />
    <TrendingWidget />
  </>
);

/**
 * Production's paging for a topic (useSources, first: 100): pages of 100
 * under InfiniteScrolling, the next page fetched silently at the bottom.
 * Every topic in the real directory fits in its first page.
 */
export const TOPIC_PAGE_SIZE = 100;

const noNextPage = (): Promise<void> => Promise.resolve();

export const ProfileInnerPage = ({
  chip,
  children,
  canFetchMore = false,
}: {
  chip: string;
  children: ReactNode;
  canFetchMore?: boolean;
}): ReactElement => (
  <div className="sd-in mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
      {/* One column beside the widgets at laptop width, two from laptopL,
          where the card is wide enough. */}
      <InfiniteScrolling
        canFetchMore={canFetchMore}
        isFetchingNextPage={false}
        fetchNextPage={noNextPage}
      >
        <div className="grid grid-cols-1 content-start gap-x-8 px-4 pb-4 pt-3 tablet:grid-cols-2 tablet:px-6 laptop:grid-cols-1 laptop:pt-5 laptopL:grid-cols-2">
          {children}
        </div>
      </InfiniteScrolling>
    </div>
    <aside className="hidden w-80 shrink-0 flex-col gap-4 laptop:flex">
      <DiscoverWidgets chip={chip} />
    </aside>
    {/* Below laptop the column moves to the end of the page. Promoted
        stays out: the list already opens with that campaign. */}
    <div className="grid grid-cols-1 gap-4 px-4 pb-6 tablet:grid-cols-2 tablet:px-6 laptop:hidden">
      <PacksWidget chip={chip} />
      <TrendingWidget />
    </div>
  </div>
);
