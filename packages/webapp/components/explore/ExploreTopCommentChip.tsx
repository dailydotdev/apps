import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  getCommentHash,
  TOP_COMMENTS_QUERY,
  type TopCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { stripHtmlTags } from '@dailydotdev/shared/src/lib/strings';

/** Show preview only when comment body has more than this many words. */
const MIN_COMMENT_WORDS = 15;

const TOP_COMMENTS_FETCH = 25;

function countWords(text: string): number {
  const t = text.trim();
  if (!t) {
    return 0;
  }

  return t.split(/\s+/).length;
}

export type ExploreTopCommentChipProps = {
  postId: string;
  commentsPermalink: string;
  numComments: number;
};

export const ExploreTopCommentChip = ({
  postId,
  commentsPermalink,
  numComments,
}: ExploreTopCommentChipProps): ReactElement | null => {
  const { data } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.PostComments,
      undefined,
      'explore-top',
      postId,
      TOP_COMMENTS_FETCH,
    ),
    queryFn: () =>
      gqlClient.request<TopCommentsData>(TOP_COMMENTS_QUERY, {
        postId,
        first: TOP_COMMENTS_FETCH,
      }),
    staleTime: StaleTime.Default,
    enabled: numComments > 0 && Boolean(postId),
  });

  const comment = (data?.topComments ?? []).find((c) => {
    const text = stripHtmlTags(c.contentHtml ?? '').trim();
    return text.length > 0 && countWords(text) > MIN_COMMENT_WORDS;
  });
  const author = comment?.author;
  if (!comment || !author) {
    return null;
  }

  const preview = stripHtmlTags(comment.contentHtml ?? '').trim();
  if (!preview) {
    return null;
  }

  const initial =
    author.name?.trim()?.charAt(0) || author.username?.trim()?.charAt(0) || '?';

  const href = `${commentsPermalink}${getCommentHash(comment.id)}`;

  return (
    <div className="mt-2 w-full min-w-0">
      <Link href={href}>
        <a
          href={href}
          className="flex w-[60%] max-w-full min-w-0 items-start gap-1.5 overflow-hidden rounded-6 bg-surface-float px-2 py-1.5 text-left text-text-tertiary transition-colors typo-caption2 hover:bg-surface-hover"
          style={{ fontSize: '13px' }}
        >
          {author.image ? (
            <img
              src={author.image}
              alt=""
              className="mt-0.5 h-4 w-4 shrink-0 rounded-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-bold uppercase text-text-tertiary">
              {initial}
            </span>
          )}
          <p className="m-0 flex min-w-0 flex-1 items-baseline gap-0">
            <span aria-hidden className="shrink-0">
              {'\u201c'}
            </span>
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {preview}
            </span>
            <span aria-hidden className="shrink-0">
              {'\u201d'}
            </span>
          </p>
        </a>
      </Link>
    </div>
  );
};
