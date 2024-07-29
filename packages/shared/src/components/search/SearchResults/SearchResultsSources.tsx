import React, { ReactElement } from 'react';
import { Source } from '../../../graphql/sources';
import { WidgetCard } from '../../widgets/WidgetCard';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';

interface SearchResultsSourcesProps {
  items: Source[];
  isLoading: boolean;
  onSourceClick: (source: Source) => void;
}

export const SearchResultsSources = (
  props: SearchResultsSourcesProps,
): ReactElement => {
  const { items, isLoading, onSourceClick } = props;
  return (
    <WidgetCard heading="Related sources">
      {!!items.length && (
        <ul className="flex flex-col gap-4">
          {items.map((source) => (
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
