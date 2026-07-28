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
  postHighlightsFeedQueryOptions,
} from '../../graphql/highlights';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { DigestCTA } from './DigestCTA';
import { HighlightItem } from './HighlightItem';
import { HighlightShareButton } from './HighlightShareButton';
import { useSharingVisibility } from '../../hooks/useSharingVisibility';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureShareHappeningNow } from '../../lib/featureManagement';
import { webappUrl } from '../../lib/constants';
import { ButtonSize } from '../buttons/Button';
import { ReferralCampaignKey } from '../../lib/referral';

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
  showShare?: boolean;
}

const HighlightFeedList = ({
  highlights,
  loading,
  expandedId,
  showShare,
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
          showShare={showShare}
        />
      ))}
    </div>
  );
};

const MajorHeadlinesTab = ({
  highlights,
  loading,
  expandedId,
  showShare,
}: {
  highlights: PostHighlightFeed[];
  loading: boolean;
  expandedId?: string;
  showShare?: boolean;
}): ReactElement => (
  <HighlightFeedList
    highlights={highlights}
    loading={loading}
    expandedId={expandedId}
    showShare={showShare}
  />
);

const ChannelTab = ({
  channel,
  expandedId,
  showShare,
}: {
  channel: ChannelConfiguration;
  expandedId?: string;
  showShare?: boolean;
}): ReactElement => {
  const { data, isFetching } = useChannelHighlights(channel.channel);
  const highlights = data?.postHighlights ?? [];
  const loading = isFetching && !data;

  return (
    <>
      {channel.digest && (
        <DigestCTA
          digest={channel.digest}
          displayName={channel.displayName}
          shareLink={
            showShare ? `${webappUrl}highlights/${channel.channel}` : undefined
          }
        />
      )}
      <HighlightFeedList
        highlights={highlights}
        loading={loading}
        expandedId={expandedId}
        showShare={showShare}
      />
    </>
  );
};

const AllHighlightsTab = ({
  active,
  expandedId,
  showShare,
}: {
  active: boolean;
  expandedId?: string;
  showShare?: boolean;
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
      showShare={showShare}
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
  const activeTab = isAllTab
    ? ALL_HIGHLIGHTS_LABEL
    : channelLabel ?? MAJOR_HEADLINES_LABEL;

  // One flag evaluation for the whole surface: the per-topic and per-item
  // controls receive the resolved boolean as a prop so nothing re-evaluates
  // GrowthBook once per highlight row.
  const { isEnabled: isSharingVisible } = useSharingVisibility();
  const { value: isShareHappeningNowEnabled } = useConditionalFeature({
    feature: featureShareHappeningNow,
    shouldEvaluate: isSharingVisible,
  });
  const showShare = isSharingVisible && isShareHappeningNowEnabled;

  const activePath = (() => {
    if (isAllTab) {
      return ALL_HIGHLIGHTS_URL;
    }

    return channel ? `${HIGHLIGHTS_BASE_URL}/${channel}` : HIGHLIGHTS_BASE_URL;
  })();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col pb-8 laptop:min-h-page laptop:border-x laptop:border-border-subtlest-tertiary">
      <header className="flex items-center px-3 py-4 laptop:px-4">
        <h1 className="feed-highlights-title-gradient font-bold typo-large-title">
          Happening Now
        </h1>
        {showShare && (
          <HighlightShareButton
            link={`${webappUrl}${activePath.slice(1)}`}
            text="See what's happening now in tech on daily.dev"
            label="Share Happening Now"
            level="page"
            targetId={activeTab}
            cid={ReferralCampaignKey.Generic}
            buttonSize={ButtonSize.Small}
            className="ml-auto shrink-0"
          />
        )}
      </header>
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
              showShare={showShare}
            />
          </Tab>,
          <Tab key="all" label={ALL_HIGHLIGHTS_LABEL} url={ALL_HIGHLIGHTS_URL}>
            <AllHighlightsTab
              active={isAllTab}
              expandedId={expandedId}
              showShare={showShare}
            />
          </Tab>,
          ...channels.map((ch) => (
            <Tab
              key={ch.channel}
              label={ch.displayName}
              url={`${HIGHLIGHTS_BASE_URL}/${ch.channel}`}
            >
              <ChannelTab
                channel={ch}
                expandedId={expandedId}
                showShare={showShare}
              />
            </Tab>
          )),
        ]}
      </TabContainer>
    </main>
  );
};
