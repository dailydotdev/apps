import type { PropsWithChildren, ReactElement } from 'react';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { PageWidgets } from '../../utilities';
import type { SearchSuggestion } from '../../../graphql/search';
import { SearchProviderEnum } from '../../../graphql/search';
import { useSearchResultsLayout } from '../../../hooks/search/useSearchResultsLayout';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { webappUrl } from '../../../lib/constants';
import { SearchResultsTags } from './SearchResultsTags';
import { SearchResultsSources } from './SearchResultsSources';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import SettingsContext from '../../../contexts/SettingsContext';
import { gapClass } from '../../feeds/FeedContainer';
import { useFeedLayout } from '../../../hooks';
import { SearchResultsUsers } from './SearchResultsUsers';
import SearchFilterTimeButton from '../SearchFilterTimeButton';
import SearchFilterPostTypeButton from '../SearchFilterPostTypeButton';

type SearchResultsLayoutProps = PropsWithChildren;
const SEARCH_VERSION_THRESHOLD = 3;

export const SearchResultsLayout = (
  props: SearchResultsLayoutProps,
): ReactElement => {
  const { children } = props;
  const { isListMode } = useFeedLayout();
  const { spaciness } = useContext(SettingsContext);
  const { isSearchPageLaptop } = useSearchResultsLayout();

  const {
    query: { q: query },
    push,
  } = useRouter();
  const { logEvent } = useLogContext();

  const { isLoading: isTagsLoading, suggestions: suggestedTags } =
    useSearchProviderSuggestions({
      query: `${query}`,
      provider: SearchProviderEnum.Tags,
      limit: 10,
    });
  const tags = suggestedTags?.hits?.map(({ id }) => id) ?? [];

  const { isLoading: isSourcesLoading, suggestions: suggestedSources } =
    useSearchProviderSuggestions({
      query: `${query}`,
      provider: SearchProviderEnum.Sources,
      limit: 10,
    });
  const sources = suggestedSources?.hits ?? [];

  const { isLoading: isUsersLoading, suggestions: suggestedUsers } =
    useSearchProviderSuggestions({
      query: `${query}`,
      provider: SearchProviderEnum.Users,
      limit: 10,
      includeContentPreference: true,
    });

  const users = suggestedUsers?.hits ?? [];

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
                space: spaciness,
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
                extra: JSON.stringify({
                  origin: Origin.SearchPage,
                  provider: SearchProviderEnum.Sources,
                }),
              });
            }}
          />
          <SearchResultsUsers isLoading={isUsersLoading} items={users} />
        </PageWidgets>
      </div>
    </section>
  );
};

export default SearchResultsLayout;
