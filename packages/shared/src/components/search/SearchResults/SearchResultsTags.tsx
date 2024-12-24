import type { ReactElement } from 'react';
import React from 'react';
import { WidgetCard } from '../../widgets/WidgetCard';
import { TagLink } from '../../TagLinks';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import type { SearchSuggestion } from '../../../graphql/search';

interface SearchResultsTagsProps {
  items: string[];
  isLoading: boolean;
  onTagClick: (suggestion: SearchSuggestion) => void;
}

export const SearchResultsTags = (
  props: SearchResultsTagsProps,
): ReactElement => {
  const { items = [], isLoading, onTagClick } = props;

  if (!isLoading && !items.length) {
    return null;
  }

  return (
    <WidgetCard heading="Related tags" data-testid="related-tags">
      {!!items?.length && (
        <div className="flex flex-wrap gap-3" role="list">
          {items.map((tag) => (
            <TagLink
              key={tag}
              tag={tag}
              buttonProps={{
                onClick: (e) => {
                  e.preventDefault();
                  onTagClick({ title: tag });
                },
              }}
            />
          ))}
        </div>
      )}
      {isLoading && <ListItemPlaceholder />}
    </WidgetCard>
  );
};

export default SearchResultsTags;
