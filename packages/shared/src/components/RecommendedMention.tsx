import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { UserShortInfo } from './profile/UserShortInfo';

interface RecommendedUser {
  image: string;
  name: string;
  username: string;
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
      className="flex overflow-hidden flex-col rounded-16 border border-theme-divider-secondary text-theme-label-primary"
      style={{ width: '15rem' }}
    >
      {users.map(({ name, username, image }, index) => (
        <UserShortInfo
          key={username}
          name={name}
          username={username}
          image={image}
          className={classNames(
            'px-3 cursor-pointer',
            index === selected && 'bg-theme-active',
          )}
          imageSize="large"
          tag="li"
          onClick={() => onClick(username)}
        />
      ))}
    </ul>
  );
}
