import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { WidgetCard } from '../../widgets/WidgetCard';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import { ListItemPlaceholder } from '../../widgets/ListItemPlaceholder';
import type { SearchSuggestion } from '../../../graphql/search';
import { SearchProviderEnum } from '../../../graphql/search';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { FollowButton } from '../../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import type { LoggedUser } from '../../../lib/user';
import { searchRecommendationLogExtra } from '../../../lib/searchLog';
import { fallbackImages } from '../../../lib/config';

interface SearchResultsUserListProps {
  items: SearchSuggestion[];
  /** Identity of the suggestion fetch that produced `items`. */
  searchId?: string;
  searchVersion?: number;
  className?: string;
}

interface SearchResultsUsersProps
  extends Omit<SearchResultsUserListProps, 'className'> {
  isLoading: boolean;
}

export const SearchResultsUserList = ({
  items,
  searchId,
  searchVersion,
  className,
}: SearchResultsUserListProps): ReactElement => {
  const { logEvent } = useLogContext();
  // A hit without an id cannot be followed or linked to, so it never makes a
  // usable row.
  const users = items.flatMap(({ id, subtitle, image, title, ...rest }) =>
    id
      ? [
          {
            id,
            name: title,
            image: image ?? fallbackImages.avatar,
            username: subtitle ?? '',
            permalink: `/${subtitle}`,
            ...rest,
          },
        ]
      : [],
  );

  return (
    <ul className={classNames('flex flex-col gap-4', className)}>
      {users.map((user, position) => (
        <li
          key={user.id}
          className="flex gap-2"
          onClickCapture={() => {
            logEvent({
              event_name: LogEvent.Click,
              target_type: TargetType.SearchRecommendation,
              target_id: user.id,
              feed_item_title: user.id,
              extra: JSON.stringify(
                searchRecommendationLogExtra({
                  origin: Origin.SearchPage,
                  provider: SearchProviderEnum.Users,
                  position,
                  searchId,
                  searchVersion,
                }),
              ),
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
            entityId={user.id}
            type={ContentPreferenceType.User}
            entityName={`@${user.username}`}
            status={(user as LoggedUser).contentPreference?.status}
            origin={Origin.SearchPage}
          />
        </li>
      ))}
    </ul>
  );
};

export const SearchResultsUsers = ({
  items,
  isLoading,
  searchId,
  searchVersion,
}: SearchResultsUsersProps): ReactElement | null => {
  if (!isLoading && !items.length) {
    return null;
  }

  return (
    <WidgetCard heading="Related users">
      {!!items.length && (
        <SearchResultsUserList
          items={items}
          searchId={searchId}
          searchVersion={searchVersion}
        />
      )}
      {isLoading && <ListItemPlaceholder />}
    </WidgetCard>
  );
};

export default SearchResultsUsers;
