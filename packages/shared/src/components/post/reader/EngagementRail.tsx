import dynamic from 'next/dynamic';
import type { LegacyRef, ReactElement } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import AuthContext, { useAuthContext } from '../../../contexts/AuthContext';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import { SourceType } from '../../../graphql/sources';
import type { SourceTooltip } from '../../../graphql/sources';
import { useShareComment } from '../../../hooks/useShareComment';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { Origin } from '../../../lib/log';
import EntityCardSkeleton from '../../cards/entity/EntityCardSkeleton';
import FurtherReading from '../../widgets/FurtherReading';
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
import { PostComments } from '../PostComments';
import type { NewCommentRef } from '../NewComment';
import { NewComment } from '../NewComment';
import { PostTagList } from '../tags/PostTagList';
import PostMetadata from '../../cards/common/PostMetadata';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import ShowMoreContent from '../../cards/common/ShowMoreContent';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { TimeSortIcon } from '../../icons/Sort/Time';
import { AnalyticsIcon, ArrowIcon, SidebarArrowLeft } from '../../icons';
import { PostMenuOptions } from '../PostMenuOptions';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { SortCommentsBy } from '../../../graphql/comments';
import { Tooltip } from '../../tooltip/Tooltip';
import { ClickableText } from '../../buttons/ClickableText';
import Link from '../../utilities/Link';
import { largeNumberFormat } from '../../../lib';
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { ProfileImageSize } from '../../ProfilePicture';
import { PostPosition } from '../../../hooks/usePostModalNavigation';
import { SourceStrip } from './SourceStrip';
import { ReaderRailActionBar } from './ReaderRailActionBar';
import ShareBar from '../../ShareBar';

const SquadEntityCard = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadEntityCard" */ '../../cards/entity/SquadEntityCard'
    ),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ '../../comments/CommentInputOrModal'
    ),
);

type EngagementRailProps = {
  post: Post;
  postPosition?: PostPosition;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  onToggleRail: () => void;
  onRegisterFocusComment: (fn: () => void) => void;
  className?: string;
  /**
   * Standalone post page only: when provided, renders a left-aligned
   * back-to-feed arrow button at the top of the discussion rail.
   */
  onBackToFeed?: () => void;
};

const noopFocus = (): void => {};

export function EngagementRail({
  post,
  postPosition,
  onPreviousPost,
  onNextPost,
  onToggleRail,
  onRegisterFocusComment,
  className,
  onBackToFeed,
}: EngagementRailProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { user } = useAuthContext();
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const commentRef = useRef<NewCommentRef | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(Origin.ReaderModal);
  const { title: displayTitle } = useSmartTitle(post);
  const isVideoType = isVideoPost(post);
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const canSeeAnalytics = canViewPostAnalytics({ user, post });

  useEffect(() => {
    const run = (): void => {
      commentRef.current?.onShowInput(Origin.PostCommentButton);
    };
    onRegisterFocusComment(run);
    return () => {
      onRegisterFocusComment(noopFocus);
    };
  }, [onRegisterFocusComment, post.id]);

  const { source } = post;
  const showNavigation = !!onPreviousPost || !!onNextPost;

  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
  const sortLabel = isNewestFirst ? 'Sort: Newest first' : 'Sort: Oldest first';
  const railHeaderGroupClasses =
    'flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default/70 p-px shadow-3 backdrop-blur-md backdrop-saturate-150';
  const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';

  return (
    <aside
      id="reader-post-modal-root"
      className={classNames(
        'relative flex min-h-0 flex-col overflow-y-auto overflow-x-hidden border-r border-border-subtlest-tertiary bg-background-default',
        className,
      )}
      aria-label="Discussion and related"
    >
      <div className="bg-background-default/85 sticky top-0 z-[60] flex items-center justify-between gap-2 px-3 pb-2 pt-3 backdrop-blur">
        <div className="flex items-center gap-2">
          {onBackToFeed && (
            <div className={railHeaderGroupClasses} aria-label="Navigation">
              <Tooltip content="Back to feed">
                <Button
                  icon={<ArrowIcon className="-rotate-90" />}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  type="button"
                  className={iconButtonClassName}
                  onClick={onBackToFeed}
                  aria-label="Back to feed"
                />
              </Tooltip>
            </div>
          )}
          <div className={railHeaderGroupClasses} aria-label="Post navigation">
            {showNavigation && (
              <>
                {onPreviousPost && (
                  <Tooltip content="Previous post">
                    <Button
                      icon={<ArrowIcon />}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Tertiary}
                      type="button"
                      className={classNames('-rotate-90', iconButtonClassName)}
                      onClick={onPreviousPost}
                      disabled={
                        !postPosition ||
                        [PostPosition.First, PostPosition.Only].includes(
                          postPosition,
                        )
                      }
                      aria-label="Previous post"
                    />
                  </Tooltip>
                )}
                {onNextPost && (
                  <Tooltip content="Next post">
                    <Button
                      className={classNames('rotate-90', iconButtonClassName)}
                      icon={<ArrowIcon />}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Tertiary}
                      type="button"
                      onClick={onNextPost}
                      disabled={
                        !postPosition ||
                        [PostPosition.Last, PostPosition.Only].includes(
                          postPosition,
                        )
                      }
                      aria-label="Next post"
                    />
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>
        <div className={railHeaderGroupClasses}>
          <PostMenuOptions
            post={post}
            origin={Origin.ReaderModal}
            buttonSize={ButtonSize.Small}
          />
          <Tooltip content="Hide discussion">
            <Button
              icon={<SidebarArrowLeft />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              type="button"
              className={iconButtonClassName}
              onClick={onToggleRail}
              aria-label="Hide discussion panel"
              aria-pressed
            />
          </Tooltip>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-4 px-4 pb-6 pt-4">
        {source && source.type === SourceType.Squad && (
          <SquadEntityCard
            className={{ container: 'w-full bg-transparent' }}
            handle={source.handle}
            origin={Origin.ReaderModal}
          />
        )}
        {source && source.type !== SourceType.Squad && (
          <SourceStrip source={source as SourceTooltip} />
        )}

        <section
          aria-label="Article summary"
          className="flex min-w-0 flex-col gap-2"
        >
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title3}
            bold
            className="break-words text-left"
          >
            {displayTitle}
          </Typography>
          {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
          {post.summary && (
            <div className="mb-1 flex min-w-0 flex-col gap-1 text-text-secondary">
              <ShowMoreContent
                className={{
                  wrapper: 'overflow-hidden',
                  text: 'leading-9 typo-callout',
                }}
                content={post.summary}
                charactersLimit={330}
                threshold={50}
              />
            </div>
          )}
          <PostTagList post={post} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            isVideoType={isVideoType}
            className="!mt-0 !typo-callout"
          />
          <ReaderRailActionBar
            post={post}
            onCommentClick={() =>
              commentRef.current?.onShowInput(Origin.PostCommentButton)
            }
            className="mt-1"
          />
        </section>

        <section
          aria-label="Discussion"
          className="flex min-w-0 flex-col gap-3 border-t border-border-subtlest-tertiary pt-4"
        >
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-text-tertiary typo-callout">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4">
              {upvotes > 0 && (
                <ClickableText onClick={() => onShowUpvoted(post.id, upvotes)}>
                  {largeNumberFormat(upvotes)} Upvote{upvotes > 1 ? 's' : ''}
                </ClickableText>
              )}
              <span>
                {largeNumberFormat(comments)} Comment
                {comments === 1 ? '' : 's'}
              </span>
              {canSeeAnalytics && (
                <Link
                  href={`${webappUrl}posts/${post.id}/analytics`}
                  passHref
                  prefetch={false}
                >
                  <ClickableText
                    tag="a"
                    className="gap-1"
                    textClassName="text-text-tertiary"
                  >
                    <AnalyticsIcon />
                    Analytics
                  </ClickableText>
                </Link>
              )}
            </div>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              iconPosition={ButtonIconPosition.Right}
              icon={
                <TimeSortIcon
                  secondary
                  className={isNewestFirst ? undefined : 'rotate-180'}
                />
              }
              onClick={() =>
                setSortBy(
                  isNewestFirst
                    ? SortCommentsBy.OldestFirst
                    : SortCommentsBy.NewestFirst,
                )
              }
              aria-label={sortLabel}
              className="!text-text-tertiary"
            >
              {isNewestFirst ? 'Newest first' : 'Oldest first'}
            </Button>
          </div>
          <NewComment
            post={post}
            ref={commentRef as LegacyRef<NewCommentRef>}
            shouldHandleCommentQuery
            onComposerOpenChange={setIsComposerOpen}
            size={ProfileImageSize.Medium}
            CommentInputOrModal={CommentInputOrModal}
          />
          <PostComments
            post={post}
            sortBy={sortBy}
            origin={Origin.ReaderModal}
            isComposerOpen={isComposerOpen}
            onShare={(comment) => openShareComment(comment, post)}
            onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
            modalParentSelector={() =>
              document.getElementById('reader-post-modal-root') ?? document.body
            }
          />
          <ShareBar post={post} />
        </section>

        <PostSidebarAdWidget
          postId={post.id}
          className={{ container: 'w-full bg-transparent' }}
        />

        {tokenRefreshed && (
          <section
            aria-label="You might also like"
            className="min-w-0 border-t border-border-subtlest-tertiary pt-3"
          >
            <FurtherReading currentPost={post} />
          </section>
        )}
      </div>
    </aside>
  );
}
