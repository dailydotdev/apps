import type { LegacyRef, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { useShareComment } from '@dailydotdev/shared/src/hooks/useShareComment';
import { useUpvoteQuery } from '@dailydotdev/shared/src/hooks/useUpvoteQuery';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import type { NewCommentRef } from '@dailydotdev/shared/src/components/post/NewComment';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import CommentInput from '@dailydotdev/shared/src/components/comments/CommentInput';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimeSortIcon } from '@dailydotdev/shared/src/components/icons/Sort/Time';
import { SortCommentsBy } from '@dailydotdev/shared/src/graphql/comments';
import { usePostComments } from '@dailydotdev/shared/src/hooks/comments/usePostComments';
import { DiscussionShareRow } from '@dailydotdev/shared/src/components/post/focus/DiscussionShareRow';
import { EndOfThreadShare } from '@dailydotdev/shared/src/features/snapshot/EndOfThreadShare';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { AdAsComment } from '@dailydotdev/shared/src/components/comments/AdAsComment';
import { CommentAd } from './commentAd';
import { useStoredCommentDraft } from '@dailydotdev/shared/src/components/fields/RichTextEditor/useDraftStorage';

interface DiscussionProps {
  post: Post;
  onRegisterFocusComment?: (fn: () => void) => void;
  /** The thread's programmatic MPU, every `interleaveEvery` comments. */
  interleaveEvery?: number;
  renderInterleaved?: (occurrence: number) => ReactNode;
  /** The redesign as it shipped: production's comment ad and spacing. */
  asShipped?: boolean;
  /** Production drops it wherever programmatic units run (hideInternalAd). */
  hideCommentAd?: boolean;
}

/**
 * The redesign's discussion (PostDiscussionPanel before #6882): a quiet
 * composer row, share-to-Squad row, sort as a text link, the real comment
 * thread and the end-of-thread share. The composer itself is production's
 * NewComment, opened from the redesign's trigger.
 */
export const Discussion = ({
  post,
  onRegisterFocusComment,
  interleaveEvery,
  renderInterleaved,
  asShipped = false,
  hideCommentAd = false,
}: DiscussionProps): ReactElement => {
  const { user } = useAuthContext();
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const { commentsCount } = usePostComments({ postId: post.id, sortBy });
  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
  const commentRef = useRef<NewCommentRef | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const draft = useStoredCommentDraft(post.id, !!user && !isComposerOpen);
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(Origin.ArticlePage);
  const { isPlus } = usePlusSubscription();
  const openComposer = (origin: Origin) =>
    commentRef.current?.onShowInput(origin);

  useEffect(() => {
    onRegisterFocusComment?.(() => openComposer(Origin.PostCommentButton));
  }, [onRegisterFocusComment]);

  return (
    <section aria-label="Discussion" className="flex min-w-0 flex-col gap-2">
      {!isComposerOpen && (
        <button
          type="button"
          aria-label="Add a comment"
          onClick={() => openComposer(Origin.StartDiscussion)}
          className="group flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 text-left transition-colors hover:border-border-subtlest-primary"
        >
          {user ? (
            <ProfilePicture
              className="shrink-0"
              nativeLazyLoading
              size={ProfileImageSize.Medium}
              user={user}
            />
          ) : (
            <Image
              alt="Placeholder image for anonymous user"
              aria-hidden
              className={classNames(
                'shrink-0',
                getProfilePictureClasses(ProfileImageSize.Medium),
              )}
              fetchPriority="low"
              height={32}
              loading="lazy"
              role="presentation"
              src={fallbackImages.avatar}
              width={32}
            />
          )}
          {draft ? (
            <span className="min-w-0 flex-1 truncate text-text-secondary typo-callout">
              <span className="font-bold">Draft:</span> {draft}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout">
              Share your thoughts…
            </span>
          )}
          <span className="shrink-0 rounded-10 bg-background-default px-3 py-1.5 text-text-secondary transition-colors typo-footnote group-hover:text-text-primary">
            Comment
          </span>
        </button>
      )}
      <div className={classNames(isComposerOpen && 'animate-composer-in')}>
        <NewComment
          post={post}
          ref={commentRef as LegacyRef<NewCommentRef>}
          className={{ container: '!hidden' }}
          shouldHandleCommentQuery
          onComposerOpenChange={setIsComposerOpen}
          size={ProfileImageSize.Medium}
          CommentInput={CommentInput}
        />
      </div>
      <DiscussionShareRow post={post} withSquads />
      {!isPlus &&
        !renderInterleaved &&
        !hideCommentAd &&
        (asShipped ? (
          <AdAsComment postId={post.id} source={post.source} />
        ) : (
          <div className="py-2 empty:hidden">
            <CommentAd postId={post.id} source={post.source} />
          </div>
        ))}
      {commentsCount > 0 && (
        <ClickableText
          type="button"
          defaultTypo={false}
          className="mb-2 w-fit gap-1 typo-footnote"
          onClick={() =>
            setSortBy(
              isNewestFirst
                ? SortCommentsBy.OldestFirst
                : SortCommentsBy.NewestFirst,
            )
          }
        >
          {isNewestFirst ? 'Newest first' : 'Oldest first'}
          <TimeSortIcon
            secondary
            size={IconSize.XSmall}
            className={isNewestFirst ? undefined : 'rotate-180'}
          />
        </ClickableText>
      )}
      {/* PostComments and the share band carry the classic page's margins
          (48px under the thread, 24px around the band); the column's gap
          spaces them here. */}
      <div
        className={classNames('-mt-6 min-w-0', !asShipped && '[&>div]:!mb-0')}
      >
        <PostComments
          post={post}
          sortBy={sortBy}
          origin={Origin.ArticlePage}
          isComposerOpen={isComposerOpen}
          onShare={(comment) => openShareComment(comment, post)}
          onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
          modalParentSelector={() => document.body}
          interleaveEvery={interleaveEvery}
          renderInterleaved={renderInterleaved}
        />
      </div>
      <div className={asShipped ? 'mt-2' : 'mt-4 [&>*]:!my-0'}>
        <EndOfThreadShare commentsCount={commentsCount} post={post} />
      </div>
    </section>
  );
};
