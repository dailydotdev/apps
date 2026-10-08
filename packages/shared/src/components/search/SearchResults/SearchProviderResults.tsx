import type { ReactElement } from 'react';
import React from 'react';
import type { SearchSuggestion } from '../../../graphql/search';
import {
  SearchProviderEnum,
  searchPageResultsLimit,
} from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search/useSearchProviderSuggestions';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { searchRecommendationLogExtra } from '../../../lib/searchLog';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import SearchEmptyScreen from '../../SearchEmptyScreen';
import { TagDirectoryListItem } from '../../tags/TagDirectoryListItem';
import { useTagFollowToggle } from '../../tags/useTagFollowToggle';
import { SearchResultsSourceList } from './SearchResultsSources';
import { SearchResultsUserList } from './SearchResultsUsers';

const emptyDescription: Partial<Record<SearchProviderEnum, string>> = {
  [SearchProviderEnum.Sources]:
    'We couldn’t find any squads or sources matching your search. Try different keywords.',
  [SearchProviderEnum.Users]:
    'We couldn’t find any people matching your search. Try different keywords.',
  [SearchProviderEnum.Tags]:
    'We couldn’t find any tags matching your search. Try different keywords.',
};

interface TagResultListProps {
  items: SearchSuggestion[];
  onTagClick: (tag: string, position: number) => void;
}

const TagResultList = ({
  items,
  onTagClick,
}: TagResultListProps): ReactElement => {
  const { followedTags, onToggleFollow } = useTagFollowToggle(
    Origin.SearchPage,
  );

  return (
    <ul className="-mx-2 flex flex-col">
      {items.map(({ id, title }, position) => {
        const tag = id ?? title;

        return (
          <TagDirectoryListItem
            key={tag}
            tag={tag}
            title={title}
            isFollowed={followedTags.has(tag)}
            onToggleFollow={onToggleFollow}
            onClick={() => onTagClick(tag, position)}
          />
        );
      })}
    </ul>
  );
};

interface SearchProviderResultsProps {
  provider: SearchProviderEnum;
  query: string;
}

export const SearchProviderResults = ({
  provider,
  query,
}: SearchProviderResultsProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { isLoading, suggestions, searchId, searchVersion } =
    useSearchProviderSuggestions({
      provider,
      query,
      limit: searchPageResultsLimit,
      includeContentPreference: provider === SearchProviderEnum.Users,
    });
  const items = suggestions?.hits ?? [];

  const logClick = (
    targetId: string | undefined,
    title: string,
    position: number,
  ) => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: targetId,
      feed_item_title: title,
      extra: JSON.stringify(
        searchRecommendationLogExtra({
          origin: Origin.SearchPage,
          provider,
          position,
          searchId,
          searchVersion,
        }),
      ),
    });
  };

  if (!items.length) {
    return isLoading ? (
      <section aria-busy className="mx-auto w-full max-w-[42.5rem] py-2">
        <ListItemPlaceholder />
        <ListItemPlaceholder />
      </section>
    ) : (
      <SearchEmptyScreen description={emptyDescription[provider]} />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[42.5rem] flex-col px-4 py-4">
      {provider === SearchProviderEnum.Sources && (
        <SearchResultsSourceList
          items={items}
          onSourceClick={(source) =>
            logClick(
              source.id,
              source.name,
              items.findIndex((hit) => hit.id === source.id),
            )
          }
        />
      )}
      {provider === SearchProviderEnum.Users && (
        <SearchResultsUserList
          items={items}
          searchId={searchId}
          searchVersion={searchVersion}
        />
      )}
      {provider === SearchProviderEnum.Tags && (
        <TagResultList
          items={items}
          onTagClick={(tag, position) => logClick(tag, tag, position)}
        />
      )}
    </section>
  );
};
