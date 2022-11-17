import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { UserShortInfo } from './profile/UserShortInfo';

interface RecommendedUser {
  id: string;
  image: string;
  name: string;
  username: string;
  permalink: string;
}

interface RecommendedMentionProps {
  users: RecommendedUser[];
  selected: number;
  onClick?: (username: string) => unknown;
}

export function RecommendedMention({
  users,
  selected,
  onClick,
}: RecommendedMentionProps): ReactElement {
  if (!users?.length) {
    return null;
  }

  return (
    <ul
      className="flex overflow-hidden flex-col w-70 rounded-16 border border-theme-divider-secondary text-theme-label-primary"
      role="listbox"
    >
      {users.map((user, index) => (
        <UserShortInfo
          key={user.username}
          user={user}
          className={classNames(
            'px-3 cursor-pointer',
            index === selected && 'bg-theme-active',
          )}
          imageSize="large"
          tag="li"
          onClick={() => onClick(user.username)}
          aria-selected={index === selected}
          role="option"
          disableTooltip
        />
      ))}
    </ul>
  );
}
