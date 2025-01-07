import type { ReactElement } from 'react';
import React from 'react';
import type { Source } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { WidgetCard } from '../../widgets/WidgetCard';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import type { SearchSuggestion } from '../../../graphql/search';

interface SearchResultsSourcesProps {
  items: SearchSuggestion[];
  isLoading: boolean;
  onSourceClick: (source: Source) => void;
}

export const SearchResultsSources = (
  props: SearchResultsSourcesProps,
): ReactElement => {
  const { items, isLoading, onSourceClick } = props;
  const sources = items.map(({ id, subtitle, image, title }) => ({
    id,
    name: title,
    image,
    handle: subtitle,
    permalink: `/sources/${subtitle}`,
    type: SourceType.Machine,
    public: true,
  }));

  if (!isLoading && !items.length) {
    return null;
  }

  return (
    <WidgetCard heading="Related sources" data-testid="related-sources">
      {!!sources?.length && (
        <ul className="flex flex-col gap-4">
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
      )}
      {isLoading && <ListItemPlaceholder />}
    </WidgetCard>
  );
};

export default SearchResultsSources;
