import React, { ReactElement } from 'react';

import { useLogContext } from '../../../contexts/LogContext';
import { SearchProviderEnum, SearchSuggestion } from '../../../graphql/search';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import { WidgetCard } from '../../widgets/WidgetCard';

interface SearchResultsUsersProps {
  items: SearchSuggestion[];
  isLoading: boolean;
}

export const SearchResultsUsers = ({
  items,
  isLoading,
}: SearchResultsUsersProps): ReactElement => {
  const { logEvent } = useLogContext();
  const users = items.map(({ id, subtitle, image, title }) => ({
    id,
    name: title,
    image,
    username: subtitle,
    permalink: `/${subtitle}`,
  }));

  if (!isLoading && !items.length) {
    return null;
  }

  return (
    <WidgetCard heading="Related users">
      {!!users?.length && (
        <ul className="flex flex-col gap-4">
          {users.map((user) => (
            <li
              key={user.id}
              onClickCapture={() => {
                logEvent({
                  event_name: LogEvent.Click,
                  target_type: TargetType.SearchRecommendation,
                  target_id: user.id,
                  feed_item_title: user.id,
                  extra: JSON.stringify({
                    origin: Origin.SearchPage,
                    provider: SearchProviderEnum.Users,
                  }),
                });
              }}
            >
              <UserHighlight
                {...user}
                showReputation={false}
                allowSubscribe={false}
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

export default SearchResultsUsers;
