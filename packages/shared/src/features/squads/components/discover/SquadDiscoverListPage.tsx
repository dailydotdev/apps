import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import InfiniteScrolling from '../../../../components/containers/InfiniteScrolling';
import { PlaceholderSquadListList } from '../../../../components/cards/squad/PlaceholderSquadList';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useViewSizeClient, ViewSize } from '../../../../hooks/useViewSize';
import { SquadDiscoverRow } from './SquadDiscoverRow';
import { PopularSquadsWidget } from './SquadDiscoverSections';
import { usePromotedSquad } from './usePromotedSquad';
import type { SquadSlot } from './common';
import {
  SquadDiscoverSection,
  isVerifiedSquad,
  withPromotedSlot,
} from './common';

const GroupLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
    className="col-span-full pb-1 pt-3 first:pt-0"
  >
    {children}
  </Typography>
);

const rows = (slots: SquadSlot[], section: SquadDiscoverSection): ReactNode[] =>
  slots.map(({ squad, ad }) => (
    <SquadDiscoverRow
      key={squad.id}
      squad={squad}
      ad={ad}
      section={section}
      description
      size="large"
    />
  ));

interface SquadDiscoverFrameProps {
  children: ReactNode;
  /** The campaign the widget column leads with, from laptop. */
  spotlight?: ReactNode;
  /** Squads already on screen, which the widgets leave out. */
  excludeIds?: (string | undefined)[];
}

// The squad page's frame for a directory tab: the main column as one
// bordered card and, from laptop, a column of widgets beside it. Below laptop
// the widgets follow the list.
export const SquadDiscoverFrame = ({
  children,
  spotlight,
  excludeIds,
}: SquadDiscoverFrameProps): ReactElement => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);

  return (
    <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
        {children}
      </div>
      {isLaptop && (
        <aside className="flex w-80 shrink-0 flex-col gap-4">
          {spotlight && (
            <section
              aria-label="Promoted"
              className="flex w-full flex-col rounded-16 border border-border-subtlest-tertiary px-4 py-2"
            >
              {spotlight}
            </section>
          )}
          <PopularSquadsWidget excludeIds={excludeIds} />
        </aside>
      )}
      {isLaptop === false && (
        <div className="px-4 pb-6 tablet:px-6">
          <PopularSquadsWidget excludeIds={excludeIds} />
        </div>
      )}
    </div>
  );
};

export const squadDiscoverGridClassName =
  'grid grid-cols-1 content-start gap-x-8 px-4 pb-4 pt-3 tablet:grid-cols-2 tablet:px-6 laptop:grid-cols-1 laptop:pt-5 laptopL:grid-cols-2';

interface SquadDiscoverListPageProps {
  /** Each page asks for its own campaigns. */
  slot: string;
  squads: Squad[];
  isLoading: boolean;
  /** Verified Company Squads lead a topic under their own label. */
  topic?: string;
  fetchNextPage: () => Promise<unknown>;
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
}

// A topic or the Featured tab: verified companies first on a topic, and two
// campaigns, one in the list and one leading the widget column.
export const SquadDiscoverListPage = ({
  slot,
  squads,
  isLoading,
  topic,
  fetchNextPage,
  canFetchMore,
  isFetchingNextPage,
}: SquadDiscoverListPageProps): ReactElement => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const listPromoted = usePromotedSquad({ slot: `${slot}_list` });
  const spotlight = usePromotedSquad({
    slot: `${slot}_spotlight`,
    excludeId: listPromoted.squad?.id,
  });
  const organic = squads.filter(
    ({ id }) => id !== listPromoted.squad?.id && id !== spotlight.squad?.id,
  );
  const verified = topic ? organic.filter(isVerifiedSquad) : [];
  const community = withPromotedSlot(
    topic ? organic.filter((squad) => !isVerifiedSquad(squad)) : organic,
    listPromoted,
  );
  const section = topic
    ? SquadDiscoverSection.Topic
    : SquadDiscoverSection.FeaturedTab;
  const spotlightRow = spotlight.ad && spotlight.squad && (
    <SquadDiscoverRow
      squad={spotlight.squad}
      ad={spotlight.ad}
      section={SquadDiscoverSection.Spotlight}
      description
      size={isLaptop ? 'medium' : 'large'}
    />
  );

  return (
    <SquadDiscoverFrame
      spotlight={spotlightRow}
      excludeIds={[listPromoted.squad?.id, spotlight.squad?.id]}
    >
      <InfiniteScrolling
        fetchNextPage={fetchNextPage}
        canFetchMore={canFetchMore}
        isFetchingNextPage={isFetchingNextPage}
      >
        <div className={squadDiscoverGridClassName}>
          {/* Below laptop there is no widget column, so its campaign opens
              the list instead. */}
          {isLaptop === false && spotlightRow}
          {verified.length > 0 && (
            <>
              <GroupLabel>Verified company Squads</GroupLabel>
              {rows(
                verified.map((squad) => ({ squad })),
                section,
              )}
              <GroupLabel>More in {topic}</GroupLabel>
            </>
          )}
          {rows(community, section)}
          {isLoading && <PlaceholderSquadListList />}
        </div>
      </InfiniteScrolling>
    </SquadDiscoverFrame>
  );
};
