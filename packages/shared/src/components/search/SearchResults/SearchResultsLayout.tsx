import React, { PropsWithChildren, ReactElement } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { PageWidgets } from '../../utilities';
import { StraightArrowIcon } from '../../icons';
import {
  providerToIconMap,
  providerToLabelTextMap,
  SearchProviderButton,
} from '../SearchPanel';
import { SearchProviderEnum, SearchSuggestion } from '../../../graphql/search';
import { useSearchResultsLayout } from '../../../hooks/search/useSearchResultsLayout';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { webappUrl } from '../../../lib/constants';
import { SearchResultsTags } from './SearchResultsTags';
import { SearchResultsSources } from './SearchResultsSources';
import { useFeedLayout } from '../../../hooks';
import { useSearchProviderSuggestions } from '../../../hooks/search';

type SearchResultsLayoutProps = PropsWithChildren;

const AICta = {
  Icon: providerToIconMap[SearchProviderEnum.Chat],
  Label: providerToLabelTextMap[SearchProviderEnum.Chat],
};

export const SearchResultsLayout = (
  props: SearchResultsLayoutProps,
): ReactElement => {
  const { children } = props;

  const { isListMode } = useFeedLayout();
  const { isSearchResultsUpgrade } = useSearchResultsLayout();
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
  const tags = suggestedTags?.hits?.map(({ title }) => title) ?? [];

  const { isLoading: isSourcesLoading, suggestions: suggestedSources } =
    useSearchProviderSuggestions({
      query: `${query}`,
      provider: SearchProviderEnum.Sources,
      limit: 10,
    });
  const sources = suggestedSources?.hits ?? [];

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
          <div
            role="list"
            className={classNames(
              'mt-2.5',
              isListMode
                ? 'flex flex-col [&>article]:rounded-none'
                : 'grid w-96 grid-cols-1 gap-8 px-4 laptopL:w-auto laptopL:grid-cols-2',
            )}
          >
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
        </PageWidgets>
      </div>
    </section>
  );
};

export default SearchResultsLayout;
