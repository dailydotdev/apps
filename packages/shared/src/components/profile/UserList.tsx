import React, { ReactElement, ReactNode, useContext } from 'react';
import Link from 'next/link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import { UserShortInfo } from './UserShortInfo';
import InfiniteScrolling, {
  InfiniteScrollingProps,
} from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';
import { Squad } from '../../graphql/squads';
import LinkIcon from '../icons/Link';
import { IconSize } from '../Icon';
import { useCopyLink } from '../../hooks/useCopyLink';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import AuthContext from '../../contexts/AuthContext';

export interface UserListProps {
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  users: UserShortProfile[];
  placeholderAmount?: number;
  additionalContent?: (user: UserShortProfile, index: number) => ReactNode;
  squad?: Squad;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  additionalContent,
  squad,
  ...props
}: UserListProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user: currentUser } = useContext(AuthContext);
  const [copying, copyLink] = useCopyLink(() => {
    const permalink = squad?.permalink;
    const token = squad?.currentMember?.referralToken;

    if (!permalink || !token) {
      return undefined;
    }

    const invitation = `${permalink}/${token}`;

    return invitation;
  });

  return (
    <InfiniteScrolling
      {...scrollingProps}
      aria-label="users-list"
      placeholder={
        <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
      }
    >
      {!!squad && (
        <button
          type="button"
          disabled={copying}
          className="flex justify-start items-center py-3 px-6 hover:bg-theme-hover"
          onClick={() => {
            trackEvent({
              event_name: AnalyticsEvent.ShareSquadInvitation,
              extra: JSON.stringify({
                origin: Origin.SquadMembers,
                squad: squad.id,
                squad_member: currentUser.id,
              }),
            });

            copyLink();
          }}
        >
          <div className="flex justify-center items-center mr-4 w-12 h-12 bg-theme-float rounded-10">
            <LinkIcon size={IconSize.Large} />
          </div>
          <p className="text-salt-90 typo-callout">Copy invitation link</p>
        </button>
      )}
      {users.map((user, i) => (
        <Link key={user.username} href={user.permalink}>
          <UserShortInfo {...props} tag="a" href={user.permalink} user={user}>
            {additionalContent?.(user, i)}
          </UserShortInfo>
        </Link>
      ))}
    </InfiniteScrolling>
  );
}

export default UserList;
