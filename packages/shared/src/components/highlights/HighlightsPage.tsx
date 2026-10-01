import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
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
import { useViewSize, ViewSize } from '../../hooks';
import { MenuLabel } from '../shell/ShellRow';
import { HappeningNowSheet } from '../shell/HomeSegments';
import { CopyHighlightsLink } from './CopyHighlightsLink';
import { DigestCTA } from './DigestCTA';
import { HighlightItem } from './HighlightItem';
import { MobileAppFooterAnchor } from '../../features/getApp/components/MobileAppFooterAnchor';
import { MobileAppFooterAnchorPlace } from '../../features/getApp/mobileAppFooter';

const MAJOR_HEADLINES_LABEL = 'Headlines';
const ALL_HIGHLIGHTS_LABEL = 'All';
const SKELETON_COUNT = 5;
const headlinesBeforeAppFooter = 5;
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
      {highlights.map((highlight, index) => (
        <Fragment key={highlight.id}>
          <HighlightItem
            highlight={highlight}
            defaultExpanded={highlight.id === expandedId}
          />
          {index === headlinesBeforeAppFooter - 1 && (
            <MobileAppFooterAnchor at={MobileAppFooterAnchorPlace.Headlines} />
          )}
        </Fragment>
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
  const isPhone = useViewSize(ViewSize.MobileL);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const activeTab = isAllTab
    ? ALL_HIGHLIGHTS_LABEL
    : channelLabel ?? MAJOR_HEADLINES_LABEL;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col pb-8 laptop:min-h-page laptop:border-x laptop:border-border-subtlest-tertiary">
      <header className="hidden items-center px-3 py-4 tablet:flex laptop:px-4">
        <h1 className="feed-highlights-title-gradient font-bold typo-large-title">
          Happening Now
        </h1>
        <CopyHighlightsLink className="ml-auto" origin={Origin.HappeningNow} />
      </header>
      {isPhone && (
        <div className="flex items-center justify-between px-3 py-1">
          <MenuLabel
            label={activeTab}
            onClick={() => setIsChannelsOpen(true)}
          />
          <CopyHighlightsLink origin={Origin.HappeningNow} />
          <HappeningNowSheet
            isOpen={isChannelsOpen}
            onClose={() => setIsChannelsOpen(false)}
          />
        </div>
      )}
      <TabContainer
        controlledActive={activeTab}
        showHeader={!isPhone}
        showBorder={false}
        shallow
        swipeable
        tabListProps={{ autoScrollActive: true, dragScroll: true }}
        tabTag="a"
        className={{
          header:
            'no-scrollbar sticky top-[var(--mobile-app-header-offset,0px)] z-2 overflow-x-auto bg-background-default transition-[top] duration-200 ease-out',
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
          <Tab key="all" label={ALL_HIGHLIGHTS_LABEL} url={ALL_HIGHLIGHTS_URL}>
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
  );
};
