import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type {
  ChannelConfiguration,
  PostHighlightFeed,
} from '../../graphql/highlights';
import {
  channelHighlightsFeedQueryOptions,
  highlightsPageQueryOptions,
} from '../../graphql/highlights';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { DigestCTA } from './DigestCTA';
import { HighlightItem } from './HighlightItem';
import { EnableHighlightsAlerts } from './EnableHighlightsAlerts';

const MAJOR_HEADLINES_LABEL = 'Headlines';
const SKELETON_COUNT = 5;
const HIGHLIGHTS_BASE_URL = '/highlights';

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

export const HighlightsPage = (): ReactElement => {
  const router = useRouter();
  const channel = getSingleQueryParam(router.query.channel);
  const expandedId = getSingleQueryParam(router.query.highlight);
  const { data, isFetching } = useQuery(highlightsPageQueryOptions());

  const channels = data?.channelConfigurations ?? [];
  const majorHeadlines = useMemo(
    () => data?.majorHeadlines?.edges?.map((edge) => edge.node) ?? [],
    [data],
  );
  const majorLoading = isFetching && !data;

  const activeTab =
    channels.find((c) => c.channel === channel)?.displayName ??
    MAJOR_HEADLINES_LABEL;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col pb-8 laptop:min-h-page laptop:border-x laptop:border-border-subtlest-tertiary">
      <header className="flex items-center px-3 py-4 laptop:px-4">
        <h1 className="feed-highlights-title-gradient font-bold typo-large-title">
          Happening Now
        </h1>
      </header>
      <EnableHighlightsAlerts />
      <TabContainer
        controlledActive={activeTab}
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
