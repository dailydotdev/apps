import type { ReactElement } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { Post } from '../../../graphql/posts';
import { getReadArticleHref } from '../../../graphql/posts';
import type { PostPosition } from '../../../hooks/usePostModalNavigation';
import { ActivePostContextProvider } from '../../../contexts/ActivePostContext';
import { LogExtraContextProvider } from '../../../contexts/LogExtraContext';
import { useLogContext } from '../../../contexts/LogContext';
import SettingsContext from '../../../contexts/SettingsContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ReaderContextProvider } from './ReaderContext';
import { ReaderChrome } from './ReaderChrome';
import { ArticleReaderFrame } from './ArticleReaderFrame';
import { EngagementRail } from './EngagementRail';
import { ReaderFloatingActionBar } from './ReaderFloatingActionBar';
import { useReaderLayoutPrefs } from './hooks/useReaderLayoutPrefs';
import { useIframeEmbed } from './hooks/useIframeEmbed';
import { useReadArticle } from '../../../hooks/usePostContent';

const CHROME_TOP_OFFSET_PX = 72;
const DEFAULT_OUTER_CLASS_NAME = 'flex h-full min-h-0 w-full flex-col';
// DEMO ONLY: rail width is locked (no drag-to-resize) so the article column
// and rail keep a deliberate, balanced layout instead of letting users
// collapse one pane into the other.
const FIXED_RAIL_WIDTH_PX = 380;
// DEMO ONLY: matches the modal's `tablet:!max-w-[min(96vw,76rem)]` cap so
// the standalone post page renders the same shell at the same width as the
// modal portal, even if the outer `outerClassName` ever stops constraining.
const SHELL_MAX_WIDTH = 'min(96vw, 76rem)';

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
  const { logEvent } = useLogContext();
  const { openNewTab } = useContext(SettingsContext);
  const surface = isPostPage ? Origin.ArticlePage : Origin.ArticleModal;
  const onReadArticle = useReadArticle({ post, origin: surface });
  const readArticleHref = getReadArticleHref(post);
  const hasEmbed = !!targetUrl && isEmbeddable;

  useEffect(() => {
    logEvent({
      event_name: LogEvent.ImpressionReaderModal,
      target_type: TargetType.Post,
      target_id: post.id,
      extra: JSON.stringify({
        origin: surface,
        is_embeddable: hasEmbed,
      }),
    });
    // Only fire once per post on this surface
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, surface]);

  // Opening a post in the embedded reader is the user committing to read it,
  // same as clicking "Read article" in the classic flow. Fire the same click
  // handler — reading-streak credit, read-cache update, and the server view
  // event (the iframe loads the redirector permalink which calls notifyView
  // server-side) — but only once the target document reports DOM ready.
  // Firing on mount would credit reads even when the install prompt or
  // permission gate is showing in place of the article.
  // The fallback path keeps the external "Read on host" link, which wires
  // streak credit at click time in `ReaderFallback`.
  const hasCreditedReadRef = useRef(false);
  useEffect(() => {
    hasCreditedReadRef.current = false;
  }, [post.id]);
  const onEmbedReady = useCallback(() => {
    if (hasCreditedReadRef.current) {
      return;
    }
    hasCreditedReadRef.current = true;
    onReadArticle();
  }, [onReadArticle]);

  const onCloseWithLog = useCallback(() => {
    logEvent({
      event_name: LogEvent.CloseReaderModal,
      target_type: TargetType.Post,
      target_id: post.id,
      extra: JSON.stringify({ origin: surface }),
    });
    onClose();
  }, [logEvent, onClose, post.id, surface]);
  const layoutContainerRef = useRef<HTMLDivElement | null>(null);
  const { isRailOpen, setRailOpen } = useReaderLayoutPrefs(layoutContainerRef);
  const railWidthPx = FIXED_RAIL_WIDTH_PX;
  // DEMO ONLY: width is fixed; reader-context consumers still expect this
  // setter, so we provide a no-op that keeps the (width: number) => void
  // signature without flagging an unused parameter.
  const setRailWidthPx = useCallback<(width: number) => void>(
    () => undefined,
    [],
  );

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
            <div
              className="relative mx-auto flex min-h-0 w-full flex-1 flex-col"
              style={{ maxWidth: SHELL_MAX_WIDTH }}
            >
              <div
                ref={layoutContainerRef}
                className="grid min-h-0 flex-1"
                style={
                  isRailOpen
                    ? {
                        gridTemplateColumns: `minmax(0,1fr) ${FIXED_RAIL_WIDTH_PX}px`,
                      }
                    : { gridTemplateColumns: 'minmax(0,1fr)' }
                }
              >
                <div className="relative flex min-h-0 min-w-0 flex-col">
                  <ArticleReaderFrame
                    post={post}
                    targetUrl={targetUrl}
                    isEmbeddable={isEmbeddable}
                    fallbackScrollRef={fallbackScrollRef}
                    className="min-h-0 flex-1"
                    // DEMO ONLY: close lives in the rail header now, but
                    // when the rail is collapsed we still need an escape
                    // hatch in the iframe header.
                    onClose={
                      isPostPage || isRailOpen ? undefined : onCloseWithLog
                    }
                    isPostPage={isPostPage}
                    contentTopOffsetPx={CHROME_TOP_OFFSET_PX}
                    onEmbedReady={onEmbedReady}
                    targetHref={readArticleHref}
                    onTargetLinkClick={onReadArticle}
                    targetLinkInNewTab={openNewTab}
                  />
                  {!hasEmbeddedReaderHeader && (
                    <ReaderChrome
                      onClose={
                        isPostPage || isRailOpen ? undefined : onCloseWithLog
                      }
                      isPostPage={isPostPage}
                    />
                  )}
                  <ReaderFloatingActionBar
                    post={post}
                    onCommentClick={focusDiscussionComposer}
                  />
                </div>
                {isRailOpen && (
                  <EngagementRail
                    post={post}
                    postPosition={postPosition}
                    onPreviousPost={onPreviousPost}
                    onNextPost={onNextPost}
                    onRegisterFocusComment={onRegisterFocusComment}
                    className="min-w-0 border-l border-border-subtlest-tertiary"
                    onBackToFeed={isPostPage ? onCloseWithLog : undefined}
                    onClose={!isPostPage ? onCloseWithLog : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </ReaderContextProvider>
      </LogExtraContextProvider>
    </ActivePostContextProvider>
  );
}
