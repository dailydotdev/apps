import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Edge } from '../../graphql/common';
import type { Comment } from '../../graphql/comments';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';

export interface CollapsedRepliesPreviewProps {
  replies: Edge<Comment>[];
  onExpand: () => void;
  className?: string;
}

const MAX_AVATARS = 3;

export default function CollapsedRepliesPreview({
  replies,
  onExpand,
  className,
}: CollapsedRepliesPreviewProps): ReactElement {
  const uniqueAuthors = useMemo(() => {
    const seen = new Set<string>();
    const authors: Comment['author'][] = [];

    for (const { node } of replies) {
      if (node.author && !seen.has(node.author.id)) {
        seen.add(node.author.id);
        authors.push(node.author);
        if (authors.length >= MAX_AVATARS) {
          break;
        }
      }
    }

    return authors;
  }, [replies]);

  const replyCount = replies.length;
  const replyText = replyCount === 1 ? 'reply' : 'replies';

  return (
    <button
      type="button"
      className={classNames(
        'flex w-full cursor-pointer items-center gap-2 px-4 py-3 hover:bg-surface-hover',
        className,
      )}
      onClick={onExpand}
      aria-label={`View ${replyCount} ${replyText}`}
    >
      <div className="flex items-center">
        {uniqueAuthors.map((author, index) => (
          <ProfilePicture
            key={author.id}
            user={author}
            size={ProfileImageSize.Small}
            className={classNames(
              'border-2 border-background-default',
              index > 0 && '-ml-2',
            )}
            nativeLazyLoading
          />
        ))}
      </div>
      <span className="text-text-tertiary typo-callout">
        View {replyCount} {replyText}
      </span>
    </button>
  );
}
