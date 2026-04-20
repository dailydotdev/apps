import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { PostPosition } from '../../../hooks/usePostModalNavigation';
import { ActivePostContextProvider } from '../../../contexts/ActivePostContext';
import { LogExtraContextProvider } from '../../../contexts/LogExtraContext';
import { TargetType } from '../../../lib/log';
import { useViewSize, ViewSize } from '../../../hooks';
import { ReaderContextProvider } from './ReaderContext';
import { ReaderChrome } from './ReaderChrome';
import { ArticleReaderFrame } from './ArticleReaderFrame';
import type { ReaderArticleMode } from './ArticleReaderFrame';
import { EngagementRail } from './EngagementRail';
import { ReaderFloatingActionBar } from './ReaderFloatingActionBar';
import { PaneDivider } from './PaneDivider';
import { ShortcutHelpOverlay } from './ShortcutHelpOverlay';
import { MobileReaderLayout } from './MobileReaderLayout';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useReaderLayoutPrefs } from './hooks/useReaderLayoutPrefs';
import { useReaderShortcuts } from './hooks/useReaderShortcuts';
import { useLegacyPostLayoutOptOut } from './hooks/useLegacyPostLayoutOptOut';

const CHROME_TOP_OFFSET_PX = 72;

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

const DEFAULT_OUTER_CLASS_NAME =
  'flex h-[min(100vh-2rem,56rem)] max-h-[calc(100vh-2rem)] min-h-0 w-full flex-col';

export function ReaderPostLayout({
  post,
  postPosition,
  onPreviousPost,
  onNextPost,
  onClose,
  outerClassName,
  isPostPage = false,
}: ReaderPostLayoutProps): ReactElement {
  const isMobileViewport = !useViewSize(ViewSize.Tablet);
  const {
    isRailOpen,
    setRailOpen,
    railWidthPx,
    setRailWidthPx,
    minRailWidthPx,
    maxRailWidthPx,
  } = useReaderLayoutPrefs();

  const [isShortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [articleMode, setArticleMode] = useState<ReaderArticleMode>('embed');
  const [articleRefreshKey, setArticleRefreshKey] = useState(0);
  const { optOut: useLegacyLayout } = useLegacyPostLayoutOptOut();
  const focusCommentRef = useRef<() => void>(() => {});
  const onRegisterFocusComment = useCallback((fn: () => void) => {
    focusCommentRef.current = fn;
  }, []);
  const fallbackScrollRef = useRef<HTMLDivElement | null>(null);

  const { isFloatingBarHidden } = useScrollProgress(
    fallbackScrollRef,
    articleMode === 'fallback',
  );

  const toggleRail = useCallback(() => {
    setRailOpen(!isRailOpen);
  }, [isRailOpen, setRailOpen]);

  const toggleShortcutHelp = useCallback(() => {
    setShortcutHelpOpen((open) => !open);
  }, []);

  const refreshArticleContent = useCallback(() => {
    setArticleRefreshKey((value) => value + 1);
  }, []);

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
      isShortcutHelpOpen,
      setShortcutHelpOpen,
      toggleShortcutHelp,
    }),
    [
      post,
      isRailOpen,
      setRailOpen,
      toggleRail,
      railWidthPx,
      setRailWidthPx,
      isShortcutHelpOpen,
      toggleShortcutHelp,
    ],
  );

  useReaderShortcuts({
    isActive: !isMobileViewport,
    post,
    onClose,
    onPreviousPost,
    onNextPost,
    toggleRail,
    focusCommentComposer: focusDiscussionComposer,
    toggleShortcutHelp,
  });

  if (isMobileViewport) {
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
              className="flex h-full min-h-0 w-full flex-col"
              data-testid="readerPostLayout"
            >
              <MobileReaderLayout
                post={post}
                onClose={onClose}
                isPostPage={isPostPage}
              />
            </div>
          </ReaderContextProvider>
        </LogExtraContextProvider>
      </ActivePostContextProvider>
    );
  }

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
                      onToggleRail={toggleRail}
                      onRegisterFocusComment={onRegisterFocusComment}
                      className="min-w-0"
                      onBackToFeed={isPostPage ? onClose : undefined}
                    />
                    <PaneDivider onResizeDelta={onResizeDelta} />
                  </>
                )}
                <div className="relative flex min-h-0 min-w-0 flex-col">
                  <ArticleReaderFrame
                    key={articleRefreshKey}
                    post={post}
                    onUseLegacyLayout={useLegacyLayout}
                    onModeChange={setArticleMode}
                    fallbackScrollRef={fallbackScrollRef}
                    className="min-h-0 flex-1"
                    contentTopOffsetPx={CHROME_TOP_OFFSET_PX}
                  />
                  <ReaderChrome
                    post={post}
                    onClose={onClose}
                    isRailOpen={isRailOpen}
                    onToggleRail={toggleRail}
                    onRefreshContent={refreshArticleContent}
                    isPostPage={isPostPage}
                  />
                  <ReaderFloatingActionBar
                    post={post}
                    isHidden={isFloatingBarHidden}
                    onCommentClick={focusDiscussionComposer}
                  />
                </div>
              </div>
              <ShortcutHelpOverlay
                isOpen={isShortcutHelpOpen}
                onClose={() => setShortcutHelpOpen(false)}
              />
            </div>
          </div>
        </ReaderContextProvider>
      </LogExtraContextProvider>
    </ActivePostContextProvider>
  );
}
