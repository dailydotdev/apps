import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { SquadDirectoryNavbarItem } from '../../../../components/squads/layout/SquadDirectoryNavbarItem';
import { ShellPage } from '../../../../components/shell/ShellPageContext';
import { ShellSquare } from '../../../../components/shell/ShellSquare';
import { Chips, ShellRow } from '../../../../components/shell/ShellRow';
import { pageHeaderClassName } from '../../../../components/layout/PageHeader';
import InfiniteScrolling, {
  checkFetchMore,
} from '../../../../components/containers/InfiniteScrolling';
import { AlertColor, AlertDot } from '../../../../components/AlertDot';
import { IconSize } from '../../../../components/Icon';
import { PlusIcon } from '../../../../components/icons/Plus';
import { FilterIcon } from '../../../../components/icons/Filter';
import { VolunteeringIcon } from '../../../../components/icons/Volunteering';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import type { LfgBoardFilters } from '../../types';
import { LfgKind } from '../../types';
import { lfgKindLabel, lfgKinds } from '../../constants';
import {
  lfgBoardFacetsQueryOptions,
  lfgBoardQueryOptions,
  lfgHelperQueryOptions,
  myLfgPostQueryOptions,
} from '../../queries';
import { getLocalUtcOffset, lfgNewPostUrl } from '../../lib/format';
import { useLfgModals } from '../../hooks/useLfgModals';
import { LfgFrame } from '../LfgFrame';
import { LfgRow } from '../LfgRow';
import { LfgYourPostCard } from '../LfgYourPostCard';
import type { LfgFilterValues } from './LfgFilters';
import {
  hasLfgFilters,
  LfgFiltersSheet,
  LfgReputationFilter,
  LfgTimeZoneFilter,
  LfgTopicsFilter,
  noLfgFilters,
} from './LfgFilters';
import {
  LfgFindYourPeopleWidget,
  LfgHelperWidget,
  LfgPastPostsWidget,
  LfgYourPostWidget,
} from './LfgBoardWidgets';

type KindTab = 'all' | LfgKind;

const kindTabs: KindTab[] = ['all', ...lfgKinds];

const kindName = (kind: KindTab): string =>
  kind === 'all' ? 'Everything' : lfgKindLabel[kind];

const parseKind = (value: unknown): KindTab =>
  lfgKinds.includes(value as LfgKind) ? (value as LfgKind) : 'all';

const BoardPlaceholder = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    {[0, 1, 2].map((index) => (
      <div key={index} className="flex gap-3">
        <div className="size-12 shrink-0 animate-pulse rounded-14 bg-surface-float" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-1/3 animate-pulse rounded-8 bg-surface-float" />
          <div className="h-5 w-2/3 animate-pulse rounded-8 bg-surface-float" />
          <div className="h-10 animate-pulse rounded-8 bg-surface-float" />
        </div>
      </div>
    ))}
  </div>
);

// The live board: one list, newest first, narrowed by the kind tabs and the
// global filters in the header.
export const LfgBoard = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { openReachOut, openHelper } = useLfgModals();
  const { feedSettings } = useFeedSettings();
  const [filters, setFilterValues] = useState<LfgFilterValues>(noLfgFilters);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const kind = parseKind(router.query.kind);
  const boardFilters: LfgBoardFilters = useMemo(
    () => ({ ...filters, kind: kind === 'all' ? undefined : kind }),
    [filters, kind],
  );
  const board = useInfiniteQuery(lfgBoardQueryOptions(user, boardFilters));
  const { data: facets } = useQuery(
    lfgBoardFacetsQueryOptions(user, boardFilters.kind),
  );
  const { data: myPost } = useQuery(myLfgPostQueryOptions(user));
  const { data: helper } = useQuery(lfgHelperQueryOptions(user));
  const localOffset = getLocalUtcOffset();
  const zones = useMemo(
    () => [
      ...new Set([
        localOffset,
        ...(facets?.timezones ?? []),
        ...filters.timezones,
      ]),
    ],
    [localOffset, facets?.timezones, filters.timezones],
  );
  const tags = useMemo(
    () => [...new Set([...(facets?.tags ?? []), ...filters.tags])],
    [facets?.tags, filters.tags],
  );
  const followedTags = feedSettings?.includeTags ?? [];
  // The board pages by offset, so a post published while the reader scrolls
  // pushes the last one onto the next page too.
  const posts = useMemo(() => {
    const seen = new Set<string>();

    return (board.data?.pages ?? [])
      .flatMap((page) => page.edges.map(({ node }) => node))
      .filter(({ id }) => !seen.has(id) && !!seen.add(id));
  }, [board.data]);
  const isFiltered = hasLfgFilters(filters);
  const isHelp = kind === LfgKind.Help;
  const isHelping = !!helper;

  useLogEventOnce(() => ({
    event_name: LogEvent.OpenLfgBoard,
    extra: JSON.stringify({ kind }),
  }));

  const setKind = (next: KindTab) => {
    if (next === kind) {
      return;
    }

    logEvent({
      event_name: LogEvent.FilterLfgBoard,
      extra: JSON.stringify({ filter: 'kind', value: next }),
    });
    router.replace(
      next === 'all' ? router.pathname : `${router.pathname}?kind=${next}`,
      undefined,
      { shallow: true, scroll: false },
    );
  };

  const setFilters = (patch: Partial<LfgFilterValues>) => {
    Object.entries(patch).forEach(([filter, value]) =>
      logEvent({
        event_name: LogEvent.FilterLfgBoard,
        extra: JSON.stringify({ filter, value }),
      }),
    );
    setFilterValues((current) => ({ ...current, ...patch }));
  };

  const clearFilters = () => {
    logEvent({
      event_name: LogEvent.FilterLfgBoard,
      extra: JSON.stringify({ filter: 'clear' }),
    });
    setFilterValues(noLfgFilters);
  };

  // Only what's narrowed carries over, so an alert already set keeps the
  // rest.
  const openHelping = () =>
    openHelper(Origin.LfgBoard, {
      ...(filters.tags.length > 0 && { tags: filters.tags }),
      ...(filters.timezones.length > 0 && { timezones: filters.timezones }),
      ...(filters.minReputation > 0 && {
        minReputation: filters.minReputation,
      }),
    });

  const newPostButton = (
    <Link href={lfgNewPostUrl} passHref>
      <Button
        tag="a"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        icon={<PlusIcon />}
      >
        New post
      </Button>
    </Link>
  );

  return (
    <>
      <ShellPage
        title="Looking for group"
        actions={
          <>
            {isHelp && (
              <ShellSquare aria-label="Open to helping" onClick={openHelping}>
                <VolunteeringIcon size={IconSize.Small} secondary={isHelping} />
              </ShellSquare>
            )}
            <ShellSquare
              aria-label="Filters"
              onClick={() => setSheetOpen(true)}
            >
              <FilterIcon size={IconSize.Small} />
              {isFiltered && (
                <AlertDot
                  className="right-1.5 top-1.5"
                  color={AlertColor.Cabbage}
                />
              )}
            </ShellSquare>
            <Link href={lfgNewPostUrl} passHref>
              <ShellSquare tag="a" aria-label="New post">
                <PlusIcon size={IconSize.Small} />
              </ShellSquare>
            </Link>
          </>
        }
        row={
          <ShellRow>
            <Chips
              items={kindTabs.map((tab) => ({
                key: tab,
                label: kindName(tab),
                active: kind === tab,
                onClick: () => setKind(tab),
              }))}
            />
          </ShellRow>
        }
      />

      <header
        className={classNames(
          pageHeaderClassName,
          'hidden shrink-0 gap-4 !py-0 tablet:flex',
        )}
      >
        <ul className="flex items-center gap-2">
          {kindTabs.map((tab) => (
            <SquadDirectoryNavbarItem
              key={tab}
              buttonSize={ButtonSize.Small}
              isActive={kind === tab}
              label={kindName(tab)}
              ariaLabel={`Show ${kindName(tab)}`}
              onClick={() => setKind(tab)}
            />
          ))}
        </ul>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 py-2">
          <div className="flex items-center gap-2">
            <LfgTimeZoneFilter
              zones={zones}
              localOffset={localOffset}
              value={filters.timezones}
              onChange={(timezones) => setFilters({ timezones })}
            />
            <LfgTopicsFilter
              tags={tags}
              followedTags={followedTags}
              value={filters.tags}
              onChange={(value) => setFilters({ tags: value })}
            />
            <LfgReputationFilter
              value={filters.minReputation}
              onChange={(minReputation) => setFilters({ minReputation })}
            />
            {isFiltered && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isHelp && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<VolunteeringIcon secondary={isHelping} />}
                onClick={openHelping}
              >
                Open to helping
              </Button>
            )}
            {newPostButton}
          </div>
        </div>
      </header>

      <LfgFrame
        side={
          <>
            <LfgFindYourPeopleWidget />
            <LfgYourPostWidget
              post={myPost}
              className={myPost ? 'hidden laptop:flex' : undefined}
            />
            <LfgPastPostsWidget />
            <LfgHelperWidget onOpen={() => openHelper(Origin.LfgBoard)} />
          </>
        }
      >
        <div className="flex flex-col gap-6 px-4 pb-6 pt-3 tablet:px-6 laptop:pt-5">
          {myPost && (
            <LfgYourPostCard
              post={myPost}
              className="laptop:hidden"
              label={
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Your post
                </Typography>
              }
            />
          )}
          {board.isPending && <BoardPlaceholder />}
          {posts.length > 0 && (
            <InfiniteScrolling
              fetchNextPage={board.fetchNextPage}
              canFetchMore={checkFetchMore(board)}
              isFetchingNextPage={board.isFetchingNextPage}
              placeholder={<BoardPlaceholder />}
            >
              <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
                {posts.map((post, index) => (
                  <LfgRow
                    key={post.id}
                    post={post}
                    viewerId={user?.id}
                    onOpen={() =>
                      logEvent({
                        event_name: LogEvent.ClickLfgPost,
                        target_type: TargetType.LfgPost,
                        target_id: post.id,
                        extra: JSON.stringify({
                          origin: Origin.LfgBoard,
                          kind: post.kind,
                          position: index,
                          filtered: isFiltered,
                        }),
                      })
                    }
                    onReachOut={() => openReachOut(post, Origin.LfgBoard)}
                  />
                ))}
              </div>
            </InfiniteScrolling>
          )}
          {board.isError && (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Couldn&apos;t load the board.
              </Typography>
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                onClick={() => board.refetch()}
              >
                Try again
              </Button>
            </div>
          )}
          {board.isSuccess && posts.length === 0 && isFiltered && (
            <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
              <Typography type={TypographyType.Body} bold>
                Nothing matches these filters
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="max-w-80"
              >
                {isHelp
                  ? 'Widen them, or get a heads-up when someone asks for help that fits.'
                  : 'Try more time zones or topics, or a lower reputation.'}
              </Typography>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
                {isHelp && (
                  <Button
                    type="button"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    icon={<VolunteeringIcon secondary={isHelping} />}
                    onClick={openHelping}
                  >
                    Open to helping
                  </Button>
                )}
              </div>
            </div>
          )}
          {board.isSuccess && posts.length === 0 && !isFiltered && (
            <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
              <Typography type={TypographyType.Body} bold>
                {kind === 'all'
                  ? 'Nothing here yet'
                  : `No ${lfgKindLabel[kind]} posts yet`}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="max-w-80"
              >
                {isHelp
                  ? 'Be the first to ask. People open to helping with your topics get a heads-up, so it reaches them even if nobody is browsing.'
                  : 'Be the first. Say who you are looking for, and pick who to talk to from the replies.'}
              </Typography>
              <Link href={lfgNewPostUrl} passHref>
                <Button
                  tag="a"
                  className="mt-3"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                >
                  New post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </LfgFrame>
      {isSheetOpen && (
        <LfgFiltersSheet
          filters={filters}
          zones={zones}
          localOffset={localOffset}
          tags={tags}
          followedTags={followedTags}
          onChange={setFilters}
          onClear={clearFilters}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
};
