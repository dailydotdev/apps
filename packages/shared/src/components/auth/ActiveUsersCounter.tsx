import React, { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserIcon } from '../icons';
import { IconSize } from '../Icon';
import { getRandomUsersCount } from '../../lib/activity';
import { generateQueryKey, RequestKey } from '../../lib/query';

export function ActiveUsersCounter(): ReactElement {
  const { data } = useQuery(
    generateQueryKey(RequestKey.ActiveUsers, null),
    getRandomUsersCount,
  );

  if (!data) {
    return null;
  }

  return (
    <div className="relative mb-2 flex w-fit flex-row items-center rounded-8 bg-surface-float p-1 pr-3">
      <UserIcon secondary size={IconSize.Small} />
      <span className="ml-3 typo-footnote">
        <strong>{data.toLocaleString('en-US')} </strong>
        devs online
      </span>
      <span
        className="absolute left-4 top-4 ml-0.5 mt-0.5 h-3 w-3 animate-ping rounded-full bg-action-upvote-default"
        style={{
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
      <span className="absolute left-5 top-5 h-2 w-2 rounded-full bg-action-upvote-default" />
    </div>
  );
}
