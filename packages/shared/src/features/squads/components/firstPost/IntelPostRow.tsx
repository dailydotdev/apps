import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  DiscussIcon,
  LinkIcon,
  OpenLinkIcon,
  UpvoteIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { IntelPost } from '../../../../graphql/squadIntel';

const number = (value: number): string => value.toLocaleString('en-US');

/** A post as a place to go: its picture, its title as a link, how it did */
export const IntelPostRow = ({
  post,
  rank,
  stat,
  children,
}: {
  post: IntelPost;
  rank?: number;
  /** What the post stands out for, as "38× the average reads" */
  stat?: string;
  children?: ReactNode;
}): ReactElement => (
  <li>
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener"
      className="group -mx-2 flex items-center gap-3 rounded-12 p-2 hover:bg-surface-float"
    >
      {rank !== undefined && (
        <span className="w-4 shrink-0 text-center tabular-nums text-text-tertiary typo-footnote">
          {rank}
        </span>
      )}
      {post.image ? (
        <img
          src={post.image}
          alt=""
          className="h-12 w-20 shrink-0 self-start rounded-8 object-cover"
        />
      ) : (
        <span className="flex h-12 w-20 shrink-0 items-center justify-center self-start rounded-8 bg-surface-float text-text-tertiary group-hover:bg-surface-hover">
          <LinkIcon size={IconSize.Small} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-2 font-bold typo-callout group-hover:underline">
          {post.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-footnote">
          <span>{post.source}</span>
          {stat && <strong className="text-text-primary">{stat}</strong>}
          {post.upvotes !== undefined && (
            <span className="flex items-center gap-1">
              <UpvoteIcon size={IconSize.Size16} />
              {number(post.upvotes)}
            </span>
          )}
          {post.comments !== undefined && (
            <span className="flex items-center gap-1">
              <DiscussIcon size={IconSize.Size16} />
              {number(post.comments)}
            </span>
          )}
        </span>
        {children}
      </span>
      <OpenLinkIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-tertiary group-hover:text-text-primary"
      />
    </a>
  </li>
);
