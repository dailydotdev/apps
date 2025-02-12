import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { UserShortInfo } from './profile/UserShortInfo';
import type { UserShortProfile } from '../lib/user';
import ConditionalWrapper from './ConditionalWrapper';
import { SimpleTooltip } from './tooltips';

interface RecommendedMentionProps {
  className?: string;
  users: UserShortProfile[];
  selected: number;
  onClick?: (user: UserShortProfile) => unknown;
  checkIsDisabled?: (user: UserShortProfile) => unknown;
  disabledTooltip?: string;
}

export function RecommendedMention({
  className,
  users,
  selected,
  onClick,
  checkIsDisabled,
  disabledTooltip,
}: RecommendedMentionProps): ReactElement {
  if (!users?.length) {
    return null;
  }

  return (
    <ul
      className={classNames(
        'flex flex-col overflow-hidden rounded-16 border border-border-subtlest-secondary text-text-primary',
        className,
      )}
      role="listbox"
    >
      {users.map((user, index) => (
        <ConditionalWrapper
          key={user.username}
          condition={checkIsDisabled?.(user) && !!disabledTooltip}
          wrapper={(component) => (
            <SimpleTooltip content={disabledTooltip}>
              <div>{component}</div>
            </SimpleTooltip>
          )}
        >
          <UserShortInfo
            user={user}
            className={{
              container: classNames(
                'cursor-pointer p-3',
                checkIsDisabled?.(user)
                  ? 'pointer-events-none opacity-64'
                  : 'cursor-pointer',
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
          />
        </ConditionalWrapper>
      ))}
    </ul>
  );
}
