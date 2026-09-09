import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { PageWidgets } from '../../utilities';
import type { SearchSuggestion } from '../../../graphql/search';
import { SearchProviderEnum } from '../../../graphql/search';
import { useSearchResultsLayout } from '../../../hooks/search/useSearchResultsLayout';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { webappUrl } from '../../../lib/constants';
import { searchRecommendationLogExtra } from '../../../lib/searchLog';
import { SearchResultsTags } from './SearchResultsTags';
import { SearchResultsSources } from './SearchResultsSources';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { gapClass } from '../../feeds/FeedContainer';
import { useFeedLayout } from '../../../hooks';
import { SearchResultsUsers } from './SearchResultsUsers';
import SearchFilterTimeButton from '../SearchFilterTimeButton';
import SearchFilterPostTypeButton from '../SearchFilterPostTypeButton';
import { AskSearchBanner } from '../../marketing/banners/AskSearchBanner';

type SearchResultsLayoutProps = PropsWithChildren;

export const SearchResultsLayout = (
  props: SearchResultsLayoutProps,
): ReactElement => {
  const { children } = props;
  const { isListMode } = useFeedLayout();
  const { isSearchPageLaptop } = useSearchResultsLayout();

  const {
    query: { q },
    push,
  } = useRouter();
  const { logEvent } = useLogContext();
  const query = typeof q === 'string' ? q : '';

  const {
    isLoading: isTagsLoading,
    suggestions: suggestedTags,
    searchId: tagsSearchId,
    searchVersion: tagsSearchVersion,
  } = useSearchProviderSuggestions({
    query,
    provider: SearchProviderEnum.Tags,
    limit: 10,
    enabled: isSearchPageLaptop,
  });
  const tags = suggestedTags?.hits.flatMap(({ id }) => (id ? [id] : [])) ?? [];

  const {
    isLoading: isSourcesLoading,
    suggestions: suggestedSources,
    searchId: sourcesSearchId,
    searchVersion: sourcesSearchVersion,
  } = useSearchProviderSuggestions({
    query,
    provider: SearchProviderEnum.Sources,
    limit: 10,
    enabled: isSearchPageLaptop,
  });
  const sources = suggestedSources?.hits ?? [];

  const {
    isLoading: isUsersLoading,
    suggestions: suggestedUsers,
    searchId: usersSearchId,
    searchVersion: usersSearchVersion,
  } = useSearchProviderSuggestions({
    query,
    provider: SearchProviderEnum.Users,
    limit: 10,
    includeContentPreference: true,
    enabled: isSearchPageLaptop,
  });

  const users = suggestedUsers?.hits ?? [];

  const onTagClick = (suggestion: SearchSuggestion, position: number) => {
    const tag = suggestion.id || suggestion.title.toLowerCase();

    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: tag,
      feed_item_title: tag,
      extra: JSON.stringify(
        searchRecommendationLogExtra({
          origin: Origin.SearchPage,
          provider: SearchProviderEnum.Tags,
          position,
          searchId: tagsSearchId,
          searchVersion: tagsSearchVersion,
        }),
      ),
    });

    push(`${webappUrl}tags/${tag}`);
  };

  if (!isSearchPageLaptop) {
    return <>{children}</>;
  }

  return (
    <section className="mx-auto w-full laptopL:max-w-screen-laptop">
      <div className="flex flex-row border-border-subtlest-tertiary laptop:-mx-8 laptop:pb-0 laptopL:mx-auto laptopL:border-x">
        <div className="flex-1 border-r border-border-subtlest-tertiary">
          <div className="flex items-center justify-between">
            <h2 className="px-4 py-4 font-bold text-text-primary typo-body">
              Related posts
            </h2>
            <div className="mx-4 flex gap-2">
              <SearchFilterTimeButton />
              <SearchFilterPostTypeButton />
            </div>
          </div>

          <div
            role="list"
            className={classNames(
              'mt-2.5',
              gapClass({
                isList: true,
                isFeedLayoutList: false,
              }),
              isListMode
                ? `flex flex-col`
                : `grid w-96 grid-cols-1 px-4 laptopL:w-auto laptopL:grid-cols-2`,
            )}
          >
            {children}
          </div>
        </div>
        <PageWidgets className="py-5">
          <AskSearchBanner />
          <SearchResultsTags
            isLoading={isTagsLoading}
            items={tags}
            onTagClick={onTagClick}
          />

          <SearchResultsSources
            isLoading={isSourcesLoading}
            items={sources}
            onSourceClick={(source) => {
              logEvent({
                event_name: LogEvent.Click,
                target_type: TargetType.SearchRecommendation,
                target_id: source.id,
                feed_item_title: source.name,
                extra: JSON.stringify(
                  searchRecommendationLogExtra({
                    origin: Origin.SearchPage,
                    provider: SearchProviderEnum.Sources,
                    position: sources.findIndex((hit) => hit.id === source.id),
                    searchId: sourcesSearchId,
                    searchVersion: sourcesSearchVersion,
                  }),
                ),
              });
            }}
          />
          <SearchResultsUsers
            isLoading={isUsersLoading}
            items={users}
            searchId={usersSearchId}
            searchVersion={usersSearchVersion}
          />
        </PageWidgets>
      </div>
    </section>
  );
};

export default SearchResultsLayout;
