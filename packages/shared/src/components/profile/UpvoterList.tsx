import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Upvote } from '../../graphql/common';
import { LazyImage } from '../LazyImage';

export interface UpvoterListProps {
  upvotes: Upvote[];
  children?: ReactNode;
}

export function UpvoterList({
  upvotes,
  children,
}: UpvoterListProps): ReactElement {
  return (
    <div className="flex flex-col relative">
      {upvotes.map(({ user }) => (
        <Link
          key={user.username}
          href={`https://app.daily.dev/${user.username}`}
        >
          <a className="flex flex-row hover:bg-theme-active px-6 py-3">
            <LazyImage
              imgSrc={user.image}
              imgAlt={user.username}
              className="w-12 h-12 rounded-10"
              ratio="1 / 1"
            />
            <div className="flex flex-col flex-1 ml-4 typo-callout">
              <span className="font-bold">{user.name}</span>
              <span className="text-theme-label-secondary">
                @{user.username}
              </span>
              {user.bio && (
                <span className="mt-1 text-theme-label-tertiary">
                  {user.bio}
                </span>
              )}
            </div>
          </a>
        </Link>
      ))}
      {children}
    </div>
  );
}

export default UpvoterList;
