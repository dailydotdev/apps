import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import { LoggedUser } from '../lib/user';
import { SharedFeedPage } from './utilities';
import {
  ANONYMOUS_FEED_QUERY,
  CUSTOM_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  PREVIEW_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import AlertContext from '../contexts/AlertContext';
import { useFeature, useFeaturesReadyContext } from './GrowthBookProvider';
import {
  algorithms,
  algorithmsList,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
  LayoutHeader,
  periods,
  SearchControlHeader,
  SearchControlHeaderProps,
} from './layout/common';
import { useFeedName } from '../hooks/feed/useFeedName';
import {
  useConditionalFeature,
  useFeedLayout,
  useScrollRestoration,
  useViewSize,
  ViewSize,
} from '../hooks';
import { feature } from '../lib/featureManagement';
import { isDevelopment } from '../lib/constants';
import { FeedContainerProps } from './feeds';
import { getFeedName } from '../lib/feed';
import CommentFeed from './CommentFeed';
import { COMMENT_FEED_QUERY } from '../graphql/comments';
import { ProfileEmptyScreen } from './profile/ProfileEmptyScreen';
import { Origin } from '../lib/analytics';
import { OnboardingFeedHeader } from './onboarding/OnboardingFeedHeader';
import { FeedExploreHeader } from './header';
import { Dropdown } from './fields/Dropdown';

const SearchEmptyScreen = dynamic(
  () =>
    import(/* webpackChunkName: "searchEmptyScreen" */ './SearchEmptyScreen'),
);

const FeedEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "feedEmptyScreen" */ './FeedEmptyScreen'),
);

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: Record<string, unknown>;
};

const propsByFeed: Record<SharedFeedPage, FeedQueryProps> = {
  'my-feed': {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
  },
  popular: {
    query: ANONYMOUS_FEED_QUERY,
  },
  search: {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
  },
  upvoted: {
    query: MOST_UPVOTED_FEED_QUERY,
  },
  discussed: {
    query: MOST_DISCUSSED_FEED_QUERY,
  },
  [SharedFeedPage.Custom]: {
    query: CUSTOM_FEED_QUERY,
  },
  [SharedFeedPage.CustomForm]: {
    query: PREVIEW_FEED_QUERY,
  },
};

export interface MainFeedLayoutProps
  extends Pick<FeedContainerProps, 'shortcuts'> {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren?: ReactNode;
  navChildren?: ReactNode;
  isFinder?: boolean;
}

enum ExploreTabs {
  Popular = 'Popular',
  ByDate = 'By date',
}

const getQueryBasedOnLogin = (
  tokenRefreshed: boolean,
  user: LoggedUser | null,
  query: string,
  queryIfLogged: string | null,
): string | null => {
  if (tokenRefreshed) {
    if (user && queryIfLogged) {
      return queryIfLogged;
    }
    return query;
  }
  return null;
};

const commentClassName = {
  container: 'rounded-none border-0 border-b tablet:border-x',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

export default function MainFeedLayout({
  feedName: feedNameProp,
  searchQuery,
  isSearchOn,
  children,
  searchChildren,
  shortcuts,
  navChildren,
  isFinder,
}: MainFeedLayoutProps): ReactElement {
  useScrollRestoration();
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { getFeatureValue } = useFeaturesReadyContext();
  const { alerts } = useContext(AlertContext);
  const router = useRouter();
  const [tab, setTab] = useState(ExploreTabs.Popular);
  const isSearchPage = !!router.pathname?.startsWith('/search');
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const feedVersion = useFeature(feature.feedVersion);
  const { isUpvoted, isPopular, isSortableFeed, isCustomFeed } = useFeedName({
    feedName,
  });
  const { value: seoExplorePage } = useConditionalFeature({
    feature: feature.seoExplorePage,
    shouldEvaluate: isPopular,
  });
  const shouldShowExploreHeader = seoExplorePage && isPopular;
  const {
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
    FeedPageLayoutComponent,
  } = useFeedLayout();
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(false);
  const [isPreviewFeedEnabled, setPreviewFeedEnabled] = useState(false);
  const shouldEnrollInForcedTagSelection =
    alerts?.filter && feedName === SharedFeedPage.MyFeed;
  const { value: showForcedTagSelectionFeature } = useConditionalFeature({
    feature: feature.forcedTagSelection,
    shouldEvaluate: shouldEnrollInForcedTagSelection,
  });
  const showForcedTagSelection =
    shouldEnrollInForcedTagSelection && showForcedTagSelectionFeature;
  let query: { query: string; variables?: Record<string, unknown> };

  if (feedName) {
    const dynamicPropsByFeed: Partial<
      Record<SharedFeedPage, Partial<FeedQueryProps>>
    > = {
      [SharedFeedPage.Custom]: {
        variables: {
          feedId: router.query?.slugOrId as string,
        },
      },
    };

    query = {
      query: getQueryBasedOnLogin(
        tokenRefreshed,
        user,
        propsByFeed[feedName].query,
        propsByFeed[feedName].queryIfLogged,
      ),
      variables: {
        ...propsByFeed[feedName].variables,
        ...dynamicPropsByFeed[feedName]?.variables,
        version: isDevelopment ? 1 : feedVersion,
      },
    };
  } else {
    query = { query: null };
  }

  const [selectedAlgo, setSelectedAlgo, loadedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const periodState = useState(0);
  const [selectedPeriod] = periodState;
  const searchProps: SearchControlHeaderProps = {
    algoState: [selectedAlgo, setSelectedAlgo],
    periodState,
    feedName,
  };
  const search = (
    <LayoutHeader className={isSearchPage && 'mt-16 laptop:mt-0'}>
      {navChildren}
      {isSearchOn && searchChildren ? searchChildren : undefined}
    </LayoutHeader>
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    const feedWithActions =
      isUpvoted || isPopular || isSortableFeed || isCustomFeed;
    // in list search by default we do not show any results but empty state
    // so returning false so feed does not do any requests
    if (isSearchOn && !searchQuery) {
      return null;
    }

    if (showForcedTagSelection) {
      return {
        feedName: OtherFeedPage.Preview,
        feedQueryKey: [RequestKey.FeedPreview, user?.id],
        query: PREVIEW_FEED_QUERY,
        showSearch: false,
        options: { refetchOnMount: true },
      };
    }

    if (isSearchOn && searchQuery) {
      const searchVersion = getFeatureValue(feature.searchVersion);
      return {
        feedName: SharedFeedPage.Search,
        feedQueryKey: generateQueryKey(
          SharedFeedPage.Search,
          user,
          searchQuery,
        ),
        query: SEARCH_POSTS_QUERY,
        variables: { query: searchQuery, version: searchVersion },
        emptyScreen: <SearchEmptyScreen />,
      };
    }

    if (!query.query) {
      return null;
    }

    const seoHeader = isLaptop ? (
      <FeedExploreHeader tab={tab} setTab={setTab} />
    ) : (
      <Dropdown
        className={{ container: 'mx-4 my-3 w-56' }}
        selectedIndex={selectedAlgo}
        options={algorithmsList}
        onChange={(_, index) => setSelectedAlgo(index)}
      />
    );

    const getVariables = () => {
      if (isUpvoted) {
        return { ...query.variables, period: periods[selectedPeriod].value };
      }

      if (seoExplorePage) {
        const laptopValue = tab === ExploreTabs.ByDate ? 1 : 0;
        const finalAlgo = isLaptop ? laptopValue : selectedAlgo;
        return {
          ...query.variables,
          ranking: algorithms[finalAlgo].value,
        };
      }

      if (isSortableFeed) {
        return {
          ...query.variables,
          ranking: algorithms[selectedAlgo].value,
        };
      }

      return query.variables;
    };

    const variables = getVariables();

    return {
      feedName,
      feedQueryKey: generateQueryKey(
        feedName,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: query.query,
      variables,
      emptyScreen: <FeedEmptyScreen />,
      header: shouldShowExploreHeader && isPopular && seoHeader,
      actionButtons: !shouldShowExploreHeader && feedWithActions && (
        <SearchControlHeader {...searchProps} />
      ),
      shortcuts,
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldUseListFeedLayout,
    isSearchOn,
    searchQuery,
    query.query,
    query.variables,
    isUpvoted,
    selectedPeriod,
  ]);

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  const disableTopPadding =
    isFinder || shouldUseListFeedLayout || shouldUseCommentFeedLayout;

  return (
    <FeedPageLayoutComponent
      className={classNames(
        'relative',
        disableTopPadding && '!pt-0',
        showForcedTagSelection && '!p-0',
      )}
    >
      {showForcedTagSelection && (
        <OnboardingFeedHeader
          isPreviewFeedVisible={isPreviewFeedVisible}
          setPreviewFeedVisible={setPreviewFeedVisible}
          isPreviewFeedEnabled={isPreviewFeedEnabled}
          setPreviewFeedEnabled={setPreviewFeedEnabled}
        />
      )}
      {isSearchOn && search}
      {shouldUseCommentFeedLayout ? (
        <CommentFeed
          isMainFeed
          feedQueryKey={generateQueryKey(RequestKey.CommentFeed, null)}
          query={COMMENT_FEED_QUERY}
          analyticsOrigin={Origin.CommentFeed}
          emptyScreen={
            <ProfileEmptyScreen
              title="Nobody has replied to any post yet"
              text="You could be the first you know?"
            />
          }
          commentClassName={commentClassName}
        />
      ) : (
        (showForcedTagSelection
          ? isPreviewFeedEnabled && isPreviewFeedVisible
          : feedProps) && (
          <Feed
            {...feedProps}
            className={classNames(
              shouldUseListFeedLayout && !isFinder && 'laptop:px-6',
              showForcedTagSelection && 'px-6 laptop:px-16',
            )}
          />
        )
      )}
      {children}
    </FeedPageLayoutComponent>
  );
}
