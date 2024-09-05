import React, { ReactElement } from 'react';

import { SearchSuggestion } from '../../../graphql/search';
import { Source, SourceType } from '../../../graphql/sources';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';
import { WidgetCard } from '../../widgets/WidgetCard';

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
