import React, { ReactElement } from 'react';
import { WidgetCard } from '../../widgets/WidgetCard';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import { SearchProviderEnum, SearchSuggestion } from '../../../graphql/search';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { FollowButton } from '../../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { LoggedUser } from '../../../lib/user';

interface SearchResultsUsersProps {
  items: SearchSuggestion[];
  isLoading: boolean;
}

export const SearchResultsUsers = ({
  items,
  isLoading,
}: SearchResultsUsersProps): ReactElement => {
  const { logEvent } = useLogContext();
  const users = items.map(({ id, subtitle, image, title, ...rest }) => ({
    id,
    name: title,
    image,
    username: subtitle,
    permalink: `/${subtitle}`,
    ...rest,
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
              className="flex gap-2"
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
                  wrapper: 'flex-1 truncate px-0 py-0',
                }}
                origin={Origin.SearchPage}
              />
              <FollowButton
                className="ml-auto"
                userId={user.id}
                type={ContentPreferenceType.User}
                entityName={`@${user.username}`}
                status={(user as LoggedUser).contentPreference?.status}
                origin={Origin.SearchPage}
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
