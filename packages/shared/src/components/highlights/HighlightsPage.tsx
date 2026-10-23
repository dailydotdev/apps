import type { ReactElement } from 'react';
import React, { useEffect, useId, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import type {
  ChannelConfiguration,
  PostHighlightFeed,
} from '../../graphql/highlights';
import {
  channelHighlightsFeedQueryOptions,
  highlightsPageQueryOptions,
  postHighlightsFeedQueryOptions,
} from '../../graphql/highlights';
import { Origin } from '../../lib/log';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { useIsPhone } from '../../hooks/useViewSize';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { pageHeaderClassName } from '../layout/PageHeader';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';
import { ButtonSize } from '../buttons/Button';
import { CopyHighlightsLink } from './CopyHighlightsLink';
import { DigestCTA } from './DigestCTA';
import { HighlightItem } from './HighlightItem';

const MAJOR_HEADLINES_LABEL = 'Headlines';
const ALL_HIGHLIGHTS_LABEL = 'All';
const SKELETON_COUNT = 5;
const HIGHLIGHTS_BASE_URL = '/highlights';
const ALL_HIGHLIGHTS_URL = `${HIGHLIGHTS_BASE_URL}/all`;

const HighlightSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-1 px-4 py-3">
    <div className="h-4 w-3/4 animate-pulse rounded-8 bg-surface-float" />
    <div className="h-3 w-20 animate-pulse rounded-8 bg-surface-float" />
  </div>
);

const getSingleQueryParam = (
  param: string | string[] | undefined,
): string | undefined => {
  if (!param) {
    return undefined;
  }

  return Array.isArray(param) ? param[0] : param;
};

const useChannelHighlights = (channel: string | undefined) =>
  useQuery({
    ...channelHighlightsFeedQueryOptions(channel ?? ''),
    enabled: !!channel,
  });

interface HighlightFeedListProps {
  highlights: PostHighlightFeed[];
  loading: boolean;
  expandedId?: string;
}

const HighlightFeedList = ({
  highlights,
  loading,
  expandedId,
}: HighlightFeedListProps): ReactElement => {
  if (loading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <HighlightSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-text-tertiary typo-body">
        No highlights yet
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {highlights.map((highlight) => (
        <HighlightItem
          key={highlight.id}
          highlight={highlight}
          defaultExpanded={highlight.id === expandedId}
        />
      ))}
    </div>
  );
};

const MajorHeadlinesTab = ({
  highlights,
  loading,
  expandedId,
}: {
  highlights: PostHighlightFeed[];
  loading: boolean;
  expandedId?: string;
}): ReactElement => (
  <HighlightFeedList
    highlights={highlights}
    loading={loading}
    expandedId={expandedId}
  />
);

const ChannelTab = ({
  channel,
  expandedId,
}: {
  channel: ChannelConfiguration;
  expandedId?: string;
}): ReactElement => {
  const { data, isFetching } = useChannelHighlights(channel.channel);
  const highlights = data?.postHighlights ?? [];
  const loading = isFetching && !data;

  return (
    <>
      {channel.digest && (
        <DigestCTA digest={channel.digest} displayName={channel.displayName} />
      )}
      <HighlightFeedList
        highlights={highlights}
        loading={loading}
        expandedId={expandedId}
      />
    </>
  );
};

const AllHighlightsTab = ({
  active,
  expandedId,
}: {
  active: boolean;
  expandedId?: string;
}): ReactElement => {
  const { data, isFetching } = useQuery({
    ...postHighlightsFeedQueryOptions(),
    enabled: active,
  });
  const highlights = useMemo(
    () => data?.postHighlightsFeed?.edges?.map((edge) => edge.node) ?? [],
    [data],
  );

  return (
    <HighlightFeedList
      highlights={highlights}
      loading={isFetching && !data}
      expandedId={expandedId}
    />
  );
};

export const HighlightsPage = (): ReactElement => {
  const router = useRouter();
  const channel = getSingleQueryParam(router.query.channel);
  const expandedId = getSingleQueryParam(router.query.highlight);
  const isAllTab = router.pathname === ALL_HIGHLIGHTS_URL;
  const { data, isFetching } = useQuery(highlightsPageQueryOptions());

  const channels = data?.channelConfigurations ?? [];
  const majorHeadlines = useMemo(
    () => data?.majorHeadlines?.edges?.map((edge) => edge.node) ?? [],
    [data],
  );
  const majorLoading = isFetching && !data;

  const channelLabel = channels.find((c) => c.channel === channel)?.displayName;
  const isPhone = useIsPhone();
  const isLaptopLayout = useLaptopLayout();
  const activeTab = isAllTab
    ? ALL_HIGHLIGHTS_LABEL
    : channelLabel ?? MAJOR_HEADLINES_LABEL;

  const tabs = [
    { label: MAJOR_HEADLINES_LABEL, url: HIGHLIGHTS_BASE_URL },
    { label: ALL_HIGHLIGHTS_LABEL, url: ALL_HIGHLIGHTS_URL },
    ...channels.map((ch) => ({
      label: ch.displayName,
      url: `${HIGHLIGHTS_BASE_URL}/${ch.channel}`,
    })),
  ];

  const navId = useId();
  const activeIndex = tabs.findIndex(({ label }) => label === activeTab);
  const tabId = (index: number) => `highlights-tab-${index}-${navId}`;

  // The pill row overflows on laptop; keep the active channel in view, as the
  // tablet TabContainer does with `autoScrollActive`.
  useEffect(() => {
    if (!isLaptopLayout || activeIndex < 0) {
      return;
    }

    document
      .getElementById(tabId(activeIndex))
      ?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    // The ids only change with the tab set, which the index already follows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLaptopLayout, activeIndex]);

  return (
    <>
      {/* Laptop: the floating card already frames the page, so the channel
          tabs move into the standard page-header strip (the pill navbar the
          Explore and Squads directory headers use) and the list drops its
          own side borders and gradient title. */}
      {isLaptopLayout && (
        <header
          className={classNames(
            pageHeaderClassName,
            'sticky top-[var(--sticky-header-offset)] z-2 gap-4 bg-background-default !py-0',
          )}
        >
          <h1 className="sr-only">Happening Now</h1>
          <SquadDirectoryNavbar
            aria-label="Highlights channels"
            className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
          >
            {tabs.map(({ label, url }, index) => (
              <SquadDirectoryNavbarItem
                key={url}
                elementProps={{ id: tabId(index) }}
                buttonSize={ButtonSize.Small}
                isActive={activeTab === label}
                label={label}
                path={url}
                ariaLabel={`Show ${label} highlights`}
              />
            ))}
          </SquadDirectoryNavbar>
          {/* `ml-6` clears the navbar's overflow arrow, which is positioned
              just past the end of the pill list. */}
          <CopyHighlightsLink
            className="ml-6 shrink-0"
            origin={Origin.HappeningNow}
          />
        </header>
      )}
      <main
        className={classNames(
          'mx-auto flex w-full max-w-2xl flex-col pb-8',
          isLaptopLayout ? 'pt-3' : 'pt-1 tablet:pt-0',
        )}
      >
        {!isLaptopLayout && (
          <header className="hidden items-center px-3 py-4 tablet:flex">
            <h1 className="feed-highlights-title-gradient font-bold typo-large-title">
              Happening Now
            </h1>
            <CopyHighlightsLink
              className="ml-auto"
              origin={Origin.HappeningNow}
            />
          </header>
        )}
        <TabContainer
          controlledActive={activeTab}
          showHeader={!isPhone && !isLaptopLayout}
          showBorder={false}
          shallow
          swipeable
          tabListProps={{ autoScrollActive: true, dragScroll: true }}
          tabTag="a"
          className={{
            header:
              'no-scrollbar sticky top-0 z-2 overflow-x-auto bg-background-default',
          }}
        >
          {[
            <Tab
              key="major"
              label={MAJOR_HEADLINES_LABEL}
              url={HIGHLIGHTS_BASE_URL}
            >
              <MajorHeadlinesTab
                highlights={majorHeadlines}
                loading={majorLoading}
                expandedId={expandedId}
              />
            </Tab>,
            <Tab
              key="all"
              label={ALL_HIGHLIGHTS_LABEL}
              url={ALL_HIGHLIGHTS_URL}
            >
              <AllHighlightsTab active={isAllTab} expandedId={expandedId} />
            </Tab>,
            ...channels.map((ch) => (
              <Tab
                key={ch.channel}
                label={ch.displayName}
                url={`${HIGHLIGHTS_BASE_URL}/${ch.channel}`}
              >
                <ChannelTab channel={ch} expandedId={expandedId} />
              </Tab>
            )),
          ]}
        </TabContainer>
      </main>
    </>
  );
};
