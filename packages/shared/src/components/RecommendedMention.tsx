import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { UserShortInfo } from './profile/UserShortInfo';
import type { UserShortProfile } from '../lib/user';

interface RecommendedMentionProps {
  users: UserShortProfile[];
  selected: number;
  onClick?: (user: UserShortProfile) => unknown;
  onHover?: (index: number) => unknown;
}

export function RecommendedMention({
  users,
  selected,
  onClick,
  onHover,
}: RecommendedMentionProps): ReactElement {
  if (!users?.length) {
    return null;
  }

  return (
    <ul
      className="flex w-70 flex-col overflow-hidden rounded-16 border border-border-subtlest-secondary text-text-primary"
      role="listbox"
    >
      {users.map((user, index) => (
        <UserShortInfo
          key={user.username}
          user={user}
          className={{
            container: classNames(
              'cursor-pointer p-3',
              index === selected && 'bg-theme-active',
            ),
          }}
          imageSize="large"
          tag="li"
          onClick={() => onClick(user)}
          aria-selected={index === selected}
          role="option"
          disableTooltip
          showDescription={false}
          onHover={() => onHover?.(index)}
        />
      ))}
    </ul>
  );
}
