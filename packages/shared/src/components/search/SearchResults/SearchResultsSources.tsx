import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Source } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { WidgetCard } from '../../widgets/WidgetCard';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import type { SearchSuggestion } from '../../../graphql/search';
import { getSourceSuggestionUrl } from '../../../graphql/search';

interface SearchResultsSourceListProps {
  items: SearchSuggestion[];
  onSourceClick: (source: Source) => void;
  className?: string;
}

interface SearchResultsSourcesProps
  extends Omit<SearchResultsSourceListProps, 'className'> {
  isLoading: boolean;
}

export const SearchResultsSourceList = ({
  items,
  onSourceClick,
  className,
}: SearchResultsSourceListProps): ReactElement => {
  const sources = items.map((item) => ({
    id: item.id,
    name: item.title,
    image: item.image ?? '',
    handle: item.subtitle ?? '',
    permalink: getSourceSuggestionUrl(item),
    type: item.sourceType ?? SourceType.Machine,
    public: true,
    features: {
      verified: item.verified ?? null,
      adFree: null,
      links: null,
      products: null,
    },
  }));

  return (
    <ul className={classNames('flex flex-col gap-4', className)}>
      {sources.map((source) => (
        <li
          key={source.id}
          onClickCapture={() => {
            onSourceClick(source);
          }}
        >
          <UserHighlight
            {...source}
            allowSubscribe={false}
            userType={UserType.Source}
            className={{
              wrapper: 'px-0 py-0',
            }}
          />
        </li>
      ))}
    </ul>
  );
};

export const SearchResultsSources = (
  props: SearchResultsSourcesProps,
): ReactElement | null => {
  const { items, isLoading, onSourceClick } = props;

  if (!isLoading && !items.length) {
    return null;
  }

  return (
    <WidgetCard heading="Related sources" data-testid="related-sources">
      {!!items.length && (
        <SearchResultsSourceList items={items} onSourceClick={onSourceClick} />
      )}
      {isLoading && <ListItemPlaceholder />}
    </WidgetCard>
  );
};

export default SearchResultsSources;
