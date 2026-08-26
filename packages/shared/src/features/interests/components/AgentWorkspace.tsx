import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { oneDay } from '../../../lib/dateFormat';
import { useAgentShellHeight } from '../shell';
import type { AgentFeedItem } from '../hooks/useAgentFeed';
import { useAgent } from '../AgentContext';
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader';
import { AgentIntro } from './AgentIntro';
import { AgentChatSection } from './AgentChatSection';
import { AgentHistoryEdge } from './AgentHistoryEdge';
import { AgentEmptyState } from './AgentEmptyState';
import { AgentComposer } from './AgentComposer';
import { AgentQuoteAction } from './AgentQuoteAction';
import { AgentContentPane } from './AgentContentPane';
import { AgentDebugPanel } from './AgentDebugPanel';
import { AgentSettingsPane } from './AgentSettingsPane';

// Both columns floor at a mobile-width panel.
const minPanelWidth = 384;
const defaultPaneWidth = 480;

export const AgentWorkspace = ({
  items,
  onDelete,
  isDeleting,
  isStandalone,
  runId,
  isFeedReady = true,
}: {
  items: AgentFeedItem[];
  onDelete: () => void;
  isDeleting: boolean;
  isStandalone?: boolean;
  runId?: string;
  isFeedReady?: boolean;
}): ReactElement => {
  const {
    isSettingsOpen,
    openContent,
    messages,
    summaryPosts,
    isRunView,
    isHistoryLimited,
  } = useAgent();
  const shellHeight = useAgentShellHeight(isStandalone);
  const [storedWidth, setStoredWidth, isWidthLoaded] =
    usePersistentContext<number>('agentPaneWidth', defaultPaneWidth);
  // Not rendered off the store: its async read lands after the write, and the
  // panel snapped back mid-drag.
  const [paneWidth, setPaneWidth] = useState(defaultPaneWidth);
  const [maxPaneWidth, setMaxPaneWidth] = useState(defaultPaneWidth);
  const hasResizedRef = useRef(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isPinnedRef = useRef(true);
  const [isAwayFromBottom, setIsAwayFromBottom] = useState(false);
  const [hasUnseenReply, setHasUnseenReply] = useState(false);

  const onTranscriptScroll = () => {
    const transcript = transcriptRef.current;

    if (!transcript) {
      return;
    }

    const isPinned =
      transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight <
      80;

    isPinnedRef.current = isPinned;
    setIsAwayFromBottom(!isPinned);

    if (isPinned) {
      setHasUnseenReply(false);
    }
  };

  const scrollToBottom = () => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setHasUnseenReply(false);
  };

  // The new row hasn't been laid out on the commit that grew `messages`, so
  // scrollHeight is still the pre-append value until the next frame.
  const followTail = () => {
    const frame = requestAnimationFrame(() => {
      const transcript = transcriptRef.current;

      if (transcript) {
        transcript.scrollTop = transcript.scrollHeight;
      }
    });

    return () => cancelAnimationFrame(frame);
  };

  const focusedRunIdRef = useRef<string>();
  // Render-time read: in the commit where the target row mounts and scrolls
  // itself, the tail effects below must stand down or they yank the transcript
  // back to the bottom. A runId with no matching turn never counts as pending,
  // or a stale link would disable tail-following for good.
  const isFocusPending =
    !!runId &&
    focusedRunIdRef.current !== runId &&
    messages.some(({ id }) => id === runId);

  // Leaving the runId URL re-arms the target, so returning to it via history
  // focuses again.
  useEffect(() => {
    if (!runId) {
      focusedRunIdRef.current = undefined;
    }
  }, [runId]);

  const onFocusRun = useCallback((turnId: string) => {
    if (focusedRunIdRef.current === turnId) {
      return;
    }

    focusedRunIdRef.current = turnId;
    document
      .getElementById(`agent-turn-${turnId}`)
      ?.scrollIntoView({ block: 'center', inline: 'nearest' });
    isPinnedRef.current = false;
    setIsAwayFromBottom(true);
  }, []);

  // The transcript only grows when the reader sends a prompt (a reply resolves
  // the turn already there), so growth re-pins unconditionally.
  useEffect(() => {
    if (isFocusPending) {
      return undefined;
    }

    isPinnedRef.current = true;
    setIsAwayFromBottom(false);
    setHasUnseenReply(false);

    return followTail();
    // Growth is the trigger; a pending focus only stands the effect down.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const latestMessage = messages[messages.length - 1];
  const isLatestStale =
    isHistoryLimited &&
    !!latestMessage &&
    !latestMessage.isPending &&
    Date.now() - new Date(latestMessage.at).getTime() > oneDay * 1000;

  const isTailPending = !!messages.at(-1)?.isPending;

  useEffect(() => {
    if (isFocusPending || isTailPending || !messages.length) {
      return undefined;
    }

    if (!isPinnedRef.current) {
      setHasUnseenReply(true);

      return undefined;
    }

    return followTail();
    // The reply landing is the trigger; the length is the other effect's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTailPending]);

  useEffect(() => {
    const measure = () => {
      const workspace = workspaceRef.current;

      if (workspace) {
        setMaxPaneWidth(
          Math.max(minPanelWidth, workspace.clientWidth - minPanelWidth),
        );
      }
    };

    measure();
    globalThis.addEventListener('resize', measure);

    return () => globalThis.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (!isWidthLoaded || hasResizedRef.current || !storedWidth) {
      return;
    }

    setPaneWidth(storedWidth);
  }, [isWidthLoaded, storedWidth]);

  // Returns the clamped number because the drag reads state one pointer-down
  // behind on release.
  const onPaneWidthChange = (next: number): number => {
    // Whole pixels: a fractional width leaves the panel's border straddling two.
    const clamped = Math.round(
      Math.min(Math.max(next, minPanelWidth), maxPaneWidth),
    );

    hasResizedRef.current = true;
    setPaneWidth(clamped);

    return clamped;
  };

  const onPaneWidthCommit = (next: number) => {
    setStoredWidth(next);
  };

  return (
    <div
      ref={workspaceRef}
      className={classNames(
        'relative flex w-full flex-row overflow-hidden',
        shellHeight,
      )}
    >
      {/* The extra pixel is the pane border's, so both header rules land on the
          same line. */}
      <FlexCol className="min-w-0 flex-1 laptop:pt-[calc(0.5rem+1px)]">
        {isSettingsOpen ? (
          <AgentSettingsPane onDelete={onDelete} isDeleting={isDeleting} />
        ) : (
          <>
            <AgentWorkspaceHeader />
            <div className="relative min-h-0 flex-1">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-px z-1 h-8 bg-gradient-to-b from-background-default to-transparent"
              />
              <div
                ref={transcriptRef}
                onScroll={onTranscriptScroll}
                className="agent-scroll h-full overflow-y-auto px-5 tablet:px-8 laptop:px-10"
              >
                <FlexCol className="mx-auto w-full max-w-[45rem] gap-8 pb-14 pt-6">
                  <AgentIntro
                    findingsCount={items.length}
                    postsCount={summaryPosts.length}
                  />
                  {!isRunView && <AgentHistoryEdge />}
                  {isLatestStale ? (
                    <AgentEmptyState />
                  ) : (
                    <AgentChatSection
                      focusedRunId={isFeedReady ? runId : undefined}
                      onFocusRun={onFocusRun}
                    />
                  )}
                  {isRunView && <AgentHistoryEdge />}
                </FlexCol>
              </div>
            </div>
            <AgentQuoteAction containerRef={transcriptRef} />
            <div className="relative">
              {isAwayFromBottom && (
                <Button
                  icon={
                    <ArrowIcon size={IconSize.Size16} className="rotate-180" />
                  }
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Float}
                  // Float's surface is an 8% wash, invisible over the scrolling
                  // transcript, so the background is forced opaque.
                  className="absolute bottom-full left-1/2 z-1 mb-4 -translate-x-1/2 border-border-subtlest-tertiary !bg-background-subtle shadow-2"
                  aria-label="Scroll to latest"
                  onClick={scrollToBottom}
                >
                  {hasUnseenReply ? 'New reply' : undefined}
                </Button>
              )}
              <AgentComposer />
            </div>
          </>
        )}
      </FlexCol>
      {!!openContent.length && (
        <AgentContentPane
          width={paneWidth}
          minWidth={minPanelWidth}
          maxWidth={maxPaneWidth}
          onWidthChange={onPaneWidthChange}
          onWidthCommit={onPaneWidthCommit}
          debugPanel={<AgentDebugPanel items={items} />}
          summaryPosts={summaryPosts}
        />
      )}
    </div>
  );
};
