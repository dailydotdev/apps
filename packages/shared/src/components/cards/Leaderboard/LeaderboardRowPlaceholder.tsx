import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from '../../widgets/common';

interface LeaderboardRowPlaceholderProps {
  indexClassName?: string;
  avatarClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function LeaderboardRowPlaceholder({
  indexClassName = 'w-14',
  avatarClassName = 'rounded-12',
  leading,
  trailing,
}: LeaderboardRowPlaceholderProps): ReactElement {
  return (
    <li className="flex w-full flex-row items-center px-2">
      <span
        className={classNames(
          'flex shrink-0 tablet:justify-center',
          indexClassName,
        )}
      >
        <TextPlaceholder className="w-6" />
      </span>
      {leading}
      <span className="flex shrink-0 p-2">
        <ElementPlaceholder className={classNames('size-8', avatarClassName)} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <BodyTextPlaceholder className="w-2/5" />
        <TextPlaceholder className="w-1/4" />
      </span>
      {trailing}
    </li>
  );
}
