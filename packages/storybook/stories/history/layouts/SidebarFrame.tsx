import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { NoResults, SearchBox } from '../kit';
import type { FilterState } from '../controls';
import { KindChips, RangeChips } from '../controls';
import { Timeline } from '../timeline';

// Production's squads discover frame (SquadDiscoverFrame, #6843) for
// history: the list as one bordered card and a column of widgets beside it,
// the same widths and gaps as /squads/discover/<topic>.

export const SidebarFrame = ({
  aside,
  children,
}: {
  /** The widget column; without it the card is the whole frame. */
  aside?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
      {children}
    </div>
    {aside && (
      <aside className="flex w-80 shrink-0 flex-col gap-4">{aside}</aside>
    )}
  </div>
);

/** Search, the chips and the list, as the main card holds them. */
export const ListCard = ({
  state,
  videosFirst = false,
}: {
  state: FilterState;
  /** Lead each day with its videos as a row of big cards. */
  videosFirst?: boolean;
}): ReactElement => (
  <>
    <div className="flex flex-col gap-3 px-6 pt-5">
      <SearchBox
        value={state.filters.query}
        onChange={(query) => state.set({ query })}
      />
      <div className="flex flex-wrap items-center gap-2">
        <RangeChips state={state} ranges={['all', 'today', 'week']} />
        <span className="mx-1 h-5 w-px bg-border-subtlest-tertiary" />
        <KindChips
          state={state}
          kinds={['article', 'video', 'bookmarked', 'upvoted']}
        />
      </div>
    </div>
    <div className="flex flex-col px-6 pb-10 pt-6">
      <Timeline
        items={state.results}
        query={state.filters.query}
        videosFirst={videosFirst}
      />
      {!state.results.length && <NoResults onReset={state.reset} />}
    </div>
  </>
);
