import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Comment } from '../../graphql/comments';
import {
  filteredCommentsCountQueryOptions,
  filteredCommentsQueryOptions,
  reportNotSpam,
} from '../../graphql/filteredComments';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useToastNotification } from '../../hooks/useToastNotification';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { featureFilteredCommentsBar } from '../../lib/featureManagement';
import { postLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import { labels } from '../../lib/labels';
import { ArrowIcon } from '../icons/Arrow';
import { ShieldIcon } from '../icons/Shield';
import { ShieldCheckIcon } from '../icons/ShieldCheck';
import { IconSize } from '../Icon';
import UserBadge from '../UserBadge';
import CommentContainer from './CommentContainer';
import PlaceholderCommentList from './PlaceholderCommentList';
import { threadCommentBoxClassName } from './common';

interface FilteredCommentsProps {
  post: Post;
  appendTooltipTo?: () => HTMLElement;
  isModalThread?: boolean;
}

const rowClassName =
  'flex w-full cursor-pointer items-center gap-3 rounded-16 px-4 py-3 text-left hover:bg-surface-hover';

const RowIcon = (): ReactElement => (
  <span className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
    <ShieldCheckIcon size={IconSize.Size16} />
  </span>
);

function FilteredComment({
  post,
  comment,
  appendTooltipTo,
  isModalThread,
}: FilteredCommentsProps & { comment: Comment }): ReactElement {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () => reportNotSpam(comment.id),
    onSuccess: () =>
      logEvent(
        postLogEvent(LogEvent.ReportFilteredCommentNotSpam, post, {
          extra: { commentId: comment.id },
        }),
      ),
    onError: () => displayToast(labels.error.generic),
  });

  return (
    <CommentContainer
      post={post}
      comment={comment}
      postAuthorId={post.author?.id ?? null}
      postScoutId={post.scout?.id ?? null}
      appendTooltipTo={appendTooltipTo}
      className={{
        container: classNames(
          'opacity-[0.64]',
          isModalThread && threadCommentBoxClassName.container,
        ),
        content: classNames(isModalThread && threadCommentBoxClassName.content),
        markdown: classNames(
          isModalThread && threadCommentBoxClassName.markdown,
        ),
      }}
      badge={
        <UserBadge className="gap-0.5 normal-case">
          <ShieldIcon size={IconSize.Size16} />
          Spam filter
        </UserBadge>
      }
      actions={
        <div
          className={classNames(
            'flex h-8 items-center text-text-tertiary typo-footnote',
            isModalThread ? 'mt-1' : 'mt-3',
          )}
        >
          {isSuccess ? (
            'Sent to our moderators. Thanks.'
          ) : (
            <button
              type="button"
              className="font-bold hover:text-text-primary"
              disabled={isPending}
              onClick={() => mutate()}
            >
              Not spam? Report it
            </button>
          )}
        </div>
      }
    />
  );
}

function FilteredCommentsRow({
  post,
  appendTooltipTo,
  isModalThread,
}: FilteredCommentsProps): ReactElement | null {
  const { user, isLoggedIn, tokenRefreshed, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const [isOpen, setIsOpen] = useState(false);
  const queryParams = { postId: post.id, user };
  const { data: count = 0 } = useQuery({
    ...filteredCommentsCountQueryOptions(queryParams),
    enabled: tokenRefreshed,
  });
  const { data: comments } = useQuery({
    ...filteredCommentsQueryOptions(queryParams),
    enabled: isLoggedIn && isOpen,
  });

  useLogEventOnce(
    () =>
      postLogEvent(LogEvent.ImpressionFilteredComments, post, {
        extra: { count },
      }),
    { condition: count > 0 },
  );

  if (count === 0) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        className={rowClassName}
        onClick={() => showLogin({ trigger: AuthTriggers.FilteredComments })}
      >
        <RowIcon />
        <span className="flex-1 text-text-tertiary typo-callout">
          {count} hidden by our spam filter
        </span>
        <span className="font-bold text-text-link typo-footnote">
          Log in to view
        </span>
      </button>
    );
  }

  const label = `${count} filtered comment${count === 1 ? '' : 's'}`;

  const onToggle = () => {
    if (!isOpen) {
      logEvent(postLogEvent(LogEvent.ExpandFilteredComments, post));
    }

    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        type="button"
        className={rowClassName}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <RowIcon />
        <span className="flex-1 text-text-tertiary typo-callout">
          {isOpen ? 'Hide' : 'View'} {label}
        </span>
        <ArrowIcon
          size={IconSize.Size16}
          className={classNames(
            'text-text-tertiary transition-transform',
            !isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen &&
        (comments ? (
          comments.map((comment) => (
            <FilteredComment
              key={comment.id}
              post={post}
              comment={comment}
              appendTooltipTo={appendTooltipTo}
              isModalThread={isModalThread}
            />
          ))
        ) : (
          <PlaceholderCommentList placeholderAmount={count} />
        ))}
    </>
  );
}

export function FilteredComments({
  post,
  appendTooltipTo,
  isModalThread,
}: FilteredCommentsProps): ReactElement | null {
  const { value: isEnabled } = useConditionalFeature({
    feature: featureFilteredCommentsBar,
    shouldEvaluate: !!post.id,
  });

  if (!isEnabled) {
    return null;
  }

  return (
    <FilteredCommentsRow
      post={post}
      appendTooltipTo={appendTooltipTo}
      isModalThread={isModalThread}
    />
  );
}
