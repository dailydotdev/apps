import React, {
  PropsWithChildren,
  ReactElement,
  useContext,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { PageWidgets, SharedFeedPage } from '../../utilities';
import { StraightArrowIcon } from '../../icons';
import {
  providerToIconMap,
  providerToLabelTextMap,
  SearchProviderButton,
} from '../SearchPanel';
import { SearchProviderEnum, SearchSuggestion } from '../../../graphql/search';
import { useSearchResultsLayout } from '../../../hooks/search/useSearchResultsLayout';
import { ActiveFeedContext } from '../../../contexts';
import { FeedItemType } from '../../cards/common';
import { FeedItem, PostItem } from '../../../hooks/useFeed';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { webappUrl } from '../../../lib/constants';
import { SearchResultsTags } from './SearchResultsTags';
import { SearchResultsSources } from './SearchResultsSources';

type SearchResultsLayoutProps = PropsWithChildren;

const AICta = {
  Icon: providerToIconMap[SearchProviderEnum.Chat],
  Label: providerToLabelTextMap[SearchProviderEnum.Chat],
};

function isItemPost(item: FeedItem): item is PostItem {
  return 'post' in item && item.type === FeedItemType.Post;
}

export const SearchResultsLayout = (
  props: SearchResultsLayoutProps,
): ReactElement => {
  const { children } = props;

  const { isSearchResultsUpgrade } = useSearchResultsLayout({
    feedName: SharedFeedPage.Search,
  });
  const { items = [] } = useContext(ActiveFeedContext);
  const {
    query: { q: query },
    push,
  } = useRouter();
  const { logEvent } = useLogContext();

  const postItems = items.filter(isItemPost);

  const tags = useMemo(
    () => [...new Set(postItems.flatMap((item) => item.post.tags))],
    [postItems],
  );

  const sources = useMemo(() => {
    const ids = new Set<string>();
    return postItems
      .map((item) => item.post.source)
      .filter((source) => {
        if (ids.has(source.id)) {
          return false;
        }
        ids.add(source.id);
        return true;
      });
  }, [postItems]);

  const onTagClick = (suggestion: SearchSuggestion) => {
    const tag = suggestion.id || suggestion.title.toLowerCase();

    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: tag,
      feed_item_title: tag,
      extra: JSON.stringify({
        origin: Origin.SearchPage,
        provider: SearchProviderEnum.Tags,
      }),
    });

    push(`${webappUrl}tags/${tag}`);
  };

  if (!isSearchResultsUpgrade) {
    return <>{children}</>;
  }

  return (
    <section className="mx-auto w-full laptopL:max-w-screen-laptop">
      <div className="flex flex-row border-border-subtlest-tertiary laptop:-mx-16 laptop:pb-0 laptopL:mx-auto laptopL:border-x">
        <div className="flex-1 border-r border-border-subtlest-tertiary">
          <h2 className="px-4 py-4 font-bold text-text-primary typo-body">
            Related posts
          </h2>
          <div role="list" className="[&>article]:rounded-none">
            {children}
          </div>
        </div>
        <PageWidgets className="py-5">
          <SearchProviderButton
            className="h-auto gap-2 text-left laptop:px-4 laptop:py-3.5"
            provider={SearchProviderEnum.Chat}
            query={`${query}`}
            onClick={() => {
              logEvent({
                event_name: LogEvent.SwitchSearch,
                extra: JSON.stringify({
                  from: SearchProviderEnum.Posts,
                  to: SearchProviderEnum.Chat,
                  query: `${query}`,
                }),
              });
            }}
          >
            <span className="inline-block flex-1">{AICta.Label}</span>
            <StraightArrowIcon className="-rotate-90" />
          </SearchProviderButton>

          <SearchResultsTags
            isLoading={!items.length}
            items={tags}
            onTagClick={onTagClick}
          />

          <SearchResultsSources
            isLoading={!items.length}
            items={sources}
            onSourceClick={(source) => {
              logEvent({
                event_name: LogEvent.Click,
                target_type: TargetType.SearchRecommendation,
                target_id: source.id,
                feed_item_title: source.name,
                extra: JSON.stringify({
                  origin: Origin.SearchPage,
                  provider: SearchProviderEnum.Sources,
                }),
              });
            }}
          />
        </PageWidgets>
      </div>
    </section>
  );
};

export default SearchResultsLayout;
