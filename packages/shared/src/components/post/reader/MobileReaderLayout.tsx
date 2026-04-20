import dynamic from 'next/dynamic';
import type { LegacyRef, ReactElement } from 'react';
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Post } from '../../../graphql/posts';
import { isVideoPost, UserVote } from '../../../graphql/posts';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useShareComment } from '../../../hooks/useShareComment';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureUpvoteCountThreshold } from '../../../lib/featureManagement';
import { getUpvoteCountDisplay } from '../../../lib/post';
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { Origin } from '../../../lib/log';
import { largeNumberFormat } from '../../../lib';
import AuthContext, { useAuthContext } from '../../../contexts/AuthContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { SortCommentsBy } from '../../../graphql/comments';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { AnalyticsIcon, ArrowIcon } from '../../icons';
import { TimeSortIcon } from '../../icons/Sort/Time';
import { ClickableText } from '../../buttons/ClickableText';
import Link from '../../utilities/Link';
import FurtherReading from '../../widgets/FurtherReading';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { ProfileImageSize } from '../../ProfilePicture';
import ShowMoreContent from '../../cards/common/ShowMoreContent';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { PostTagList } from '../tags/PostTagList';
import PostMetadata from '../../cards/common/PostMetadata';
import { PostComments } from '../PostComments';
import type { NewCommentRef } from '../NewComment';
import { NewComment } from '../NewComment';
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
import ShareBar from '../../ShareBar';
import { ArticleReaderFrame } from './ArticleReaderFrame';
import type { ReaderArticleMode } from './ArticleReaderFrame';
import { ReaderBottomSheet } from './ReaderBottomSheet';
import { ReaderMobileChrome } from './ReaderMobileChrome';
import { ReaderMobilePostIdentity } from './ReaderMobilePostIdentity';
import { ReaderRailActionBar } from './ReaderRailActionBar';
import {
  snapPointToTopPx,
  type BottomSheetSnap,
  type BottomSheetSnapPoint,
} from './hooks/useBottomSheetDrag';
import { useMobileReaderPeekCollapsed } from './hooks/useMobileReaderPeekCollapsed';
import { useLegacyPostLayoutOptOut } from './hooks/useLegacyPostLayoutOptOut';

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ '../../comments/CommentInputOrModal'
    ),
);

/** Peek strip with flat post header + action bar (expanded). */
const PEEK_EXPANDED_PX = 200;
/** Peek strip with drag handle + action icons only (after scrolling article). */
const PEEK_COMPACT_PX = 54;

const MOBILE_READER_SNAP_POINTS_BASE: Record<
  BottomSheetSnap,
  BottomSheetSnapPoint
> = {
  peek: { px: PEEK_EXPANDED_PX },
  half: 40,
  full: 0,
};

type MobileReaderLayoutProps = {
  post: Post;
  onClose: () => void;
  isPostPage?: boolean;
};

export function MobileReaderLayout({
  post,
  onClose,
  isPostPage = false,
}: MobileReaderLayoutProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { user } = useAuthContext();
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const [snap, setSnap] = useState<BottomSheetSnap>('peek');
  const layoutRootRef = useRef<HTMLDivElement | null>(null);
  const [sheetTopPx, setSheetTopPx] = useState(() => {
    const h =
      typeof globalThis.window !== 'undefined'
        ? globalThis.window.innerHeight
        : 800;
    return snapPointToTopPx(MOBILE_READER_SNAP_POINTS_BASE.peek, h);
  });
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [articleRefreshKey, setArticleRefreshKey] = useState(0);
  const [articleMode, setArticleMode] = useState<ReaderArticleMode>('embed');
  const commentRef = useRef<NewCommentRef | null>(null);
  const fallbackScrollRef = useRef<HTMLDivElement | null>(null);
  const { optOut: useLegacyLayout } = useLegacyPostLayoutOptOut();

  const { isPeekCollapsed } = useMobileReaderPeekCollapsed(
    fallbackScrollRef,
    articleMode,
    layoutRootRef,
  );

  const snapPoints = useMemo((): Record<
    BottomSheetSnap,
    BottomSheetSnapPoint
  > => {
    return {
      ...MOBILE_READER_SNAP_POINTS_BASE,
      peek: {
        px: isPeekCollapsed ? PEEK_COMPACT_PX : PEEK_EXPANDED_PX,
      },
    };
  }, [isPeekCollapsed]);
  const { title: displayTitle } = useSmartTitle(post);
  const { openShareComment } = useShareComment(Origin.ReaderModal);
  const { onShowUpvoted } = useUpvoteQuery();
  const isVideoType = isVideoPost(post);
  const isLoggedIn = !!user;
  const { value: upvoteThresholdConfig } = useConditionalFeature({
    feature: featureUpvoteCountThreshold,
    shouldEvaluate: isLoggedIn,
  });

  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const { showCount: showUpvotes } = getUpvoteCountDisplay(
    upvotes,
    upvoteThresholdConfig.threshold,
    upvoteThresholdConfig.belowThresholdLabel,
    post.userState?.vote === UserVote.Up,
    post.createdAt,
    upvoteThresholdConfig.newWindowHours,
  );
  const canSeeAnalytics = canViewPostAnalytics({ user, post });
  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
  const sortLabel = isNewestFirst ? 'Sort: Newest first' : 'Sort: Oldest first';

  const focusCommentComposer = useCallback(() => {
    setSnap('full');
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(() => {
        commentRef.current?.onShowInput(Origin.PostCommentButton);
      });
    });
  }, []);

  const onRefreshArticle = useCallback(() => {
    setArticleRefreshKey((value) => value + 1);
  }, []);

  const expandSheetToFull = useCallback(() => {
    setSnap('full');
  }, []);

  const showChrome = snap !== 'full';

  const showPostIdentityRow = !(snap === 'peek' && isPeekCollapsed);

  return (
    <div
      ref={layoutRootRef}
      className="relative flex min-h-0 w-full flex-1 flex-col"
    >
      <div className="absolute inset-0 z-0 flex min-h-0 flex-1 touch-pan-y flex-col">
        <ArticleReaderFrame
          key={articleRefreshKey}
          post={post}
          onModeChange={setArticleMode}
          onUseLegacyLayout={useLegacyLayout}
          fallbackScrollRef={fallbackScrollRef}
          className="min-h-0 flex-1"
          contentTopOffsetPx={0}
          usePlainEmbed
        />
      </div>
      <ReaderBottomSheet
        snap={snap}
        defaultSnap="peek"
        snapPoints={snapPoints}
        onSnapChange={setSnap}
        onGeometryChange={setSheetTopPx}
        contentClassName="flex flex-col gap-4 px-4 pb-10"
      >
        <div className="flex min-w-0 flex-col gap-3 pt-1">
          {isPostPage && (
            <div className="flex items-center">
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                type="button"
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={onClose}
                aria-label="Back to feed"
                className="!h-8 !w-8 !min-w-8 !rounded-10 !p-0"
              />
            </div>
          )}
          {showPostIdentityRow && (
            <ReaderMobilePostIdentity
              post={post}
              displayTitle={displayTitle}
              onExpand={expandSheetToFull}
            />
          )}
          <ReaderRailActionBar
            post={post}
            onCommentClick={focusCommentComposer}
            className=""
          />
          <section
            aria-label="Article summary"
            className="flex min-w-0 flex-col gap-2"
          >
            {showPostIdentityRow ? (
              <>
                {post.clickbaitTitleDetected && (
                  <PostClickbaitShield post={post} />
                )}
                <PostMetadata
                  createdAt={post.createdAt}
                  readTime={post.readTime}
                  isVideoType={isVideoType}
                  showBelowThresholdLabel={false}
                  className="!mt-0 !typo-footnote"
                />
              </>
            ) : (
              <>
                <Typography
                  tag={TypographyTag.H1}
                  type={TypographyType.Title3}
                  bold
                  className="break-words text-left"
                >
                  {displayTitle}
                </Typography>
                {post.clickbaitTitleDetected && (
                  <PostClickbaitShield post={post} />
                )}
                <PostMetadata
                  createdAt={post.createdAt}
                  readTime={post.readTime}
                  isVideoType={isVideoType}
                  showBelowThresholdLabel={false}
                  className="!mt-0 !typo-footnote"
                />
              </>
            )}
          </section>
        </div>
        {post.summary && (
          <section
            aria-label="Summary"
            className="flex min-w-0 flex-col gap-1 border-t border-border-subtlest-tertiary pt-4 text-text-secondary"
          >
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wide"
            >
              TLDR
            </Typography>
            <ShowMoreContent
              className={{
                wrapper: 'overflow-hidden',
                text: 'leading-8 typo-callout',
              }}
              content={post.summary}
              charactersLimit={260}
              threshold={50}
            />
          </section>
        )}
        <PostTagList post={post} />
        <section
          aria-label="Discussion"
          className="flex min-w-0 flex-col gap-3 border-t border-border-subtlest-tertiary pt-4"
        >
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-text-tertiary typo-callout">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4">
              {showUpvotes && (
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
      </ReaderBottomSheet>
      <ReaderMobileChrome
        post={post}
        onClose={onClose}
        onRefresh={onRefreshArticle}
        sheetTopPx={sheetTopPx}
        isHidden={!showChrome}
        isPostPage={isPostPage}
      />
    </div>
  );
}
