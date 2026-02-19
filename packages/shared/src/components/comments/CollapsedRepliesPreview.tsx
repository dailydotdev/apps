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
  isThreadStyle?: boolean;
}

const MAX_AVATARS = 3;

export default function CollapsedRepliesPreview({
  replies,
  onExpand,
  className,
  isThreadStyle = false,
}: CollapsedRepliesPreviewProps): ReactElement | null {
  const uniqueAuthors = useMemo(() => {
    if (!replies.length) {
      return [];
    }

    const seen = new Set<string>();

    return replies.reduce<Comment['author'][]>((authors, { node }) => {
      if (
        authors.length < MAX_AVATARS &&
        node.author &&
        !seen.has(node.author.id)
      ) {
        seen.add(node.author.id);
        return [...authors, node.author];
      }
      return authors;
    }, []);
  }, [replies]);

  const replyCount = replies.length;
  const replyText = replyCount === 1 ? 'reply' : 'replies';

  if (!replies.length) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex w-full cursor-pointer items-center gap-2 rounded-16 px-4 py-3 hover:bg-surface-hover',
        isThreadStyle &&
          'group relative gap-3 rounded-none !px-0 !py-0 hover:bg-transparent',
        className,
      )}
      onClick={onExpand}
      aria-label={`View ${replyCount} ${replyText}`}
    >
      {isThreadStyle && (
        <>
          {/* Elbow connector: left-[-28px] reaches avatar lane center (offset from ml-12 parent).
              top-[-6px] / h-[18px] / w-7 (28px) form the L-shape that meets the parent thread line. */}
          <div className="absolute left-[-28px] top-[-6px] h-[18px] w-7 rounded-bl-[10px] border-b border-l border-accent-pepper-subtle" />
        </>
      )}
      <div
        className={classNames(
          'flex items-center',
          isThreadStyle &&
            'gap-3 rounded-8 py-0.5 pl-1 pr-2 group-hover:bg-surface-hover',
        )}
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
        <span
          className={classNames(
            'text-text-tertiary typo-callout',
            isThreadStyle && 'text-text-secondary',
          )}
        >
          {isThreadStyle
            ? `${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`
            : `View ${replyCount} ${replyText}`}
        </span>
      </div>
    </button>
  );
}
