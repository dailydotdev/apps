import dynamic from 'next/dynamic';
import type { LegacyRef, ReactElement } from 'react';
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { isVideoPost, UserVote } from '../../../graphql/posts';
import { SourceType } from '../../../graphql/sources';
import type { SourceTooltip } from '../../../graphql/sources';
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
import SettingsContext, {
  useSettingsContext,
} from '../../../contexts/SettingsContext';
import { SortCommentsBy } from '../../../graphql/comments';
import { apiUrl } from '../../../lib/config';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { AnalyticsIcon, MiniCloseIcon as CloseIcon } from '../../icons';
import { TimeSortIcon } from '../../icons/Sort/Time';
import { Tooltip } from '../../tooltip/Tooltip';
import { ClickableText } from '../../buttons/ClickableText';
import Link from '../../utilities/Link';
import EntityCardSkeleton from '../../cards/entity/EntityCardSkeleton';
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
import { PostMenuOptions } from '../PostMenuOptions';
import type { NewCommentRef } from '../NewComment';
import { NewComment } from '../NewComment';
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
import ShareBar from '../../ShareBar';
import { ArticleReaderFrame } from './ArticleReaderFrame';
import type { ReaderArticleMode } from './ArticleReaderFrame';
import { ReaderBottomSheet } from './ReaderBottomSheet';
import { SourceStrip } from './SourceStrip';
import { ReaderRailActionBar } from './ReaderRailActionBar';
import type { BottomSheetSnap } from './hooks/useBottomSheetDrag';
import { useScrollProgress } from './hooks/useScrollProgress';

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

type MobileReaderLayoutProps = {
  post: Post;
  onClose: () => void;
};

export function MobileReaderLayout({
  post,
  onClose,
}: MobileReaderLayoutProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { user } = useAuthContext();
  const { openNewTab } = useContext(SettingsContext);
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const [snap, setSnap] = useState<BottomSheetSnap>('peek');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [articleMode, setArticleMode] = useState<ReaderArticleMode>('embed');
  const commentRef = useRef<NewCommentRef | null>(null);
  const fallbackScrollRef = useRef<HTMLDivElement | null>(null);
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
  const sourceDomain = useMemo((): string => {
    const domain = post.domain?.trim();
    if (!domain) {
      return '';
    }
    if (
      domain.toLowerCase() === 'daily.dev' ||
      domain.toLowerCase().endsWith('.daily.dev')
    ) {
      return '';
    }
    return domain;
  }, [post.domain]);
  const faviconSrc = useMemo(() => {
    const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
    const iconSize = Math.max(Math.round(16 * pixelRatio), 96);
    const host = sourceDomain.length > 0 ? sourceDomain : 'source';
    return `${apiUrl}/icon?url=${encodeURIComponent(host)}&size=${iconSize}`;
  }, [sourceDomain]);

  const { isFloatingBarHidden } = useScrollProgress(
    fallbackScrollRef,
    articleMode === 'fallback',
  );

  const focusCommentComposer = useCallback(() => {
    setSnap('full');
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(() => {
        commentRef.current?.onShowInput(Origin.PostCommentButton);
      });
    });
  }, []);

  const { source } = post;
  const sourceLabel = sourceDomain || 'source';
  const readHref = post.permalink;
  const showFloatingClose = snap !== 'full';

  const sheetHeader = (
    <div className="flex min-w-0 flex-col gap-3 px-4 pb-3 pt-1">
      <div className="flex min-w-0 items-center justify-between gap-3">
        {source && source.type === SourceType.Squad && (
          <SquadEntityCard
            className={{
              container:
                'w-full !flex-row items-center gap-3 bg-transparent p-0',
            }}
            handle={source.handle}
            origin={Origin.ReaderModal}
            showNotificationCtaOnJoin={false}
          />
        )}
        {source && source.type !== SourceType.Squad && (
          <SourceStrip source={source as SourceTooltip} />
        )}
        {readHref ? (
          <a
            className="flex shrink-0 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-2 py-1 hover:border-border-subtlest-secondary"
            href={readHref}
            target={openNewTab ? '_blank' : '_self'}
            rel={openNewTab ? 'noopener noreferrer' : undefined}
            aria-label={`Read on ${sourceLabel}`}
          >
            <img
              src={faviconSrc}
              alt=""
              className="size-4 shrink-0 rounded-4"
              loading="lazy"
              aria-hidden
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="min-w-0 max-w-[8rem] truncate"
              title={sourceLabel}
            >
              {sourceLabel}
            </Typography>
          </a>
        ) : null}
      </div>
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
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          isVideoType={isVideoType}
          showBelowThresholdLabel={false}
          className="!mt-0 !typo-footnote"
        />
      </section>
      <ReaderRailActionBar
        post={post}
        onCommentClick={focusCommentComposer}
        className=""
      />
    </div>
  );

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div className="absolute inset-0 flex min-h-0 flex-1 flex-col">
        <ArticleReaderFrame
          post={post}
          onModeChange={setArticleMode}
          fallbackScrollRef={fallbackScrollRef}
          className="min-h-0 flex-1"
          contentTopOffsetPx={56}
        />
      </div>
      <div
        className={classNames(
          'z-40 pointer-events-none absolute inset-x-3 top-3 flex items-start justify-end transition-opacity duration-300 ease-in-out',
          showFloatingClose ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="bg-background-default/80 pointer-events-auto flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary p-px shadow-3 backdrop-blur-md backdrop-saturate-150">
          <PostMenuOptions
            post={post}
            origin={Origin.ReaderModal}
            buttonSize={ButtonSize.Small}
          />
          <Tooltip content="Close">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<CloseIcon />}
              onClick={onClose}
              aria-label="Close reader"
              className="!h-8 !w-8 !min-w-8 !rounded-10 !p-0"
            />
          </Tooltip>
        </div>
      </div>
      <ReaderBottomSheet
        snap={snap}
        defaultSnap="peek"
        onSnapChange={setSnap}
        header={sheetHeader}
        contentClassName={classNames(
          'flex flex-col gap-4 px-4 pb-10',
          isFloatingBarHidden && 'pb-6',
        )}
      >
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
    </div>
  );
}
