import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { PostPosition } from '../../../hooks/usePostModalNavigation';
import { ActivePostContextProvider } from '../../../contexts/ActivePostContext';
import { LogExtraContextProvider } from '../../../contexts/LogExtraContext';
import { TargetType } from '../../../lib/log';
import { ReaderContextProvider } from './ReaderContext';
import { ReaderChrome } from './ReaderChrome';
import { ArticleReaderFrame } from './ArticleReaderFrame';
import { EngagementRail } from './EngagementRail';
import { ReaderFloatingActionBar } from './ReaderFloatingActionBar';
import { PaneDivider } from './PaneDivider';
import { useReaderLayoutPrefs } from './hooks/useReaderLayoutPrefs';
import { useIframeEmbed } from './hooks/useIframeEmbed';

const CHROME_TOP_OFFSET_PX = 72;
const DEFAULT_OUTER_CLASS_NAME = 'flex h-full min-h-0 w-full flex-col';

type ReaderPostLayoutProps = {
  post: Post;
  postPosition?: PostPosition;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  onClose: () => void;
  /**
   * Override the outer container className. Defaults to the modal sizing
   * (max ~56rem high). The standalone post page passes a className that
   * fills the viewport below the global header instead.
   */
  outerClassName?: string;
  /**
   * When true (standalone post page), the chrome shows a left-aligned back
   * arrow (wired to `onClose`) instead of the modal's right-side close (X)
   * button.
   */
  isPostPage?: boolean;
};

export function ReaderPostLayout({
  post,
  postPosition,
  onPreviousPost,
  onNextPost,
  onClose,
  outerClassName,
  isPostPage = false,
}: ReaderPostLayoutProps): ReactElement {
  const { targetUrl, isEmbeddable } = useIframeEmbed(post.permalink);
  const {
    isRailOpen,
    setRailOpen,
    railWidthPx,
    setRailWidthPx,
    minRailWidthPx,
    maxRailWidthPx,
  } = useReaderLayoutPrefs();

  const focusCommentRef = useRef<() => void>(() => {});
  const onRegisterFocusComment = useCallback((fn: () => void) => {
    focusCommentRef.current = fn;
  }, []);
  const fallbackScrollRef = useRef<HTMLDivElement | null>(null);

  const toggleRail = useCallback(() => {
    setRailOpen(!isRailOpen);
  }, [isRailOpen, setRailOpen]);

  const focusDiscussionComposer = useCallback(() => {
    if (!isRailOpen) {
      setRailOpen(true);
      globalThis.requestAnimationFrame(() => {
        globalThis.requestAnimationFrame(() => {
          focusCommentRef.current();
        });
      });
      return;
    }
    focusCommentRef.current();
  }, [isRailOpen, setRailOpen]);

  const onResizeDelta = useCallback(
    (deltaPx: number) => {
      setRailWidthPx(railWidthPx + deltaPx);
    },
    [railWidthPx, setRailWidthPx],
  );

  const clampedRailWidth = Math.min(
    maxRailWidthPx,
    Math.max(minRailWidthPx, railWidthPx),
  );
  const hasEmbeddedReaderHeader = !!targetUrl && isEmbeddable;

  const readerContextValue = useMemo(
    () => ({
      post,
      isRailOpen,
      setRailOpen,
      toggleRail,
      railWidthPx,
      setRailWidthPx,
      focusCommentRef,
      articleScrollRef: fallbackScrollRef,
    }),
    [post, isRailOpen, setRailOpen, toggleRail, railWidthPx, setRailWidthPx],
  );

  return (
    <ActivePostContextProvider post={post}>
      <LogExtraContextProvider
        selector={() => ({
          referrer_target_id: post?.id,
          referrer_target_type: post?.id ? TargetType.Post : undefined,
        })}
      >
        <ReaderContextProvider value={readerContextValue}>
          <div
            className={outerClassName ?? DEFAULT_OUTER_CLASS_NAME}
            data-testid="readerPostLayout"
          >
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                className={classNames(
                  'grid min-h-0 flex-1',
                  isRailOpen && 'gap-0',
                )}
                style={
                  isRailOpen
                    ? {
                        gridTemplateColumns: `${clampedRailWidth}px auto minmax(0,1fr)`,
                      }
                    : { gridTemplateColumns: 'minmax(0,1fr)' }
                }
              >
                {isRailOpen && (
                  <>
                    <EngagementRail
                      post={post}
                      postPosition={postPosition}
                      onPreviousPost={onPreviousPost}
                      onNextPost={onNextPost}
                      onRegisterFocusComment={onRegisterFocusComment}
                      className="min-w-0"
                      onBackToFeed={isPostPage ? onClose : undefined}
                    />
                    <PaneDivider onResizeDelta={onResizeDelta} />
                  </>
                )}
                <div className="relative flex min-h-0 min-w-0 flex-col">
                  <ArticleReaderFrame
                    post={post}
                    targetUrl={targetUrl}
                    isEmbeddable={isEmbeddable}
                    fallbackScrollRef={fallbackScrollRef}
                    className="min-h-0 flex-1"
                    onClose={onClose}
                    isPostPage={isPostPage}
                    contentTopOffsetPx={CHROME_TOP_OFFSET_PX}
                  />
                  {!hasEmbeddedReaderHeader && (
                    <ReaderChrome
                      onClose={onClose}
                      isPostPage={isPostPage}
                    />
                  )}
                  <ReaderFloatingActionBar
                    post={post}
                    onCommentClick={focusDiscussionComposer}
                  />
                </div>
              </div>
            </div>
          </div>
        </ReaderContextProvider>
      </LogExtraContextProvider>
    </ActivePostContextProvider>
  );
}
