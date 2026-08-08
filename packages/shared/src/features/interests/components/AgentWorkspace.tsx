import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useAgentShellHeight } from '../shell';
import type { AgentFeedItem } from '../hooks/useAgentFeed';
import { useAgent } from '../AgentContext';
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader';
import { AgentIntro } from './AgentIntro';
import { AgentChatSection } from './AgentChatSection';
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
  postsCount,
  onDelete,
  isDeleting,
  isStandalone,
}: {
  items: AgentFeedItem[];
  postsCount: number;
  onDelete: () => void;
  isDeleting: boolean;
  /** Rendered without the app chrome, so the workspace owns the viewport. */
  isStandalone?: boolean;
}): ReactElement => {
  const { isSettingsOpen, openContent, messages, isWorking, stopCommand } =
    useAgent();
  const shellHeight = useAgentShellHeight(isStandalone);
  const [storedWidth, setStoredWidth, isWidthLoaded] =
    usePersistentContext<number>('agentPaneWidth', defaultPaneWidth);
  // The pane's width lives here, not in the store. The store is read once for
  // the opening size and written on release; rendering straight off it put an
  // async round-trip between the pointer and the panel, and the panel snapped
  // back whenever the read landed after the write.
  const [paneWidth, setPaneWidth] = useState(defaultPaneWidth);
  const hasResizedRef = useRef(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  // Follow the conversation only while the reader is already at its tail;
  // yanking them down mid-read is the thing Claude and Codex never do.
  const isPinnedRef = useRef(true);
  const [isAwayFromBottom, setIsAwayFromBottom] = useState(false);
  const [hasUnseenReply, setHasUnseenReply] = useState(false);

  // Escape is the universal brake in terminal agents.
  useKeyboardNavigation(globalThis?.window, [
    ['Escape', () => isWorking && stopCommand()],
  ]);

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

  useEffect(() => {
    if (!isPinnedRef.current) {
      setHasUnseenReply(true);
      return undefined;
    }

    // The new row hasn't been laid out on the commit that grew `messages`, so
    // scrollHeight is still the pre-append value until the next frame.
    const frame = requestAnimationFrame(() => {
      const transcript = transcriptRef.current;

      if (transcript) {
        transcript.scrollTop = transcript.scrollHeight;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  // Seed it from the last session's width, once. After the first drag the
  // workspace owns the number and a late read from the store is ignored.
  useEffect(() => {
    if (!isWidthLoaded || hasResizedRef.current || !storedWidth) {
      return;
    }

    setPaneWidth(storedWidth);
  }, [isWidthLoaded, storedWidth]);

  // Returns what it settled on: the drag needs the clamped number to hand back
  // on release, and reading it out of state there gets the value as it was when
  // the pointer went down, which is a drag or two behind.
  const onPaneWidthChange = (next: number): number => {
    const workspace = workspaceRef.current;
    const max = workspace
      ? Math.max(minPanelWidth, workspace.clientWidth - minPanelWidth)
      : next;
    // Whole pixels: a fractional width leaves the panel's border straddling
    // two of them, which softens the one hairline the eye follows.
    const clamped = Math.round(Math.min(Math.max(next, minPanelWidth), max));

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
      {/* Settings take the conversation's whole column, header included,
          rather than floating over it in a sheet. The inset matches the
          panel's, plus the pixel its border takes, so the two header rules
          land on exactly the same line. */}
      <FlexCol className="min-w-0 flex-1 laptop:pt-[calc(0.5rem+1px)]">
        {isSettingsOpen ? (
          <AgentSettingsPane onDelete={onDelete} isDeleting={isDeleting} />
        ) : (
          <>
            <AgentWorkspaceHeader />
            <div className="relative min-h-0 flex-1">
              {/* The line under the header, as a fade rather than a rule: the
                  conversation dissolves into the chrome instead of being cut
                  by it. Pulled a pixel up so nothing shows between the two. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-px z-1 h-8 bg-gradient-to-b from-background-default to-transparent"
              />
              <div
                ref={transcriptRef}
                onScroll={onTranscriptScroll}
                className="agent-scroll h-full overflow-y-auto px-5 tablet:px-8 laptop:px-10"
              >
                <FlexCol className="mx-auto w-full max-w-[45rem] gap-8 py-6">
                  <AgentIntro
                    findingsCount={items.length}
                    postsCount={postsCount}
                  />
                  <AgentChatSection />
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
                  // Float's surface is an 8% wash, so over the transcript the
                  // control reads as half-there. It floats over live content
                  // and has to sit on something opaque.
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
          onWidthChange={onPaneWidthChange}
          onWidthCommit={onPaneWidthCommit}
          debugPanel={<AgentDebugPanel items={items} />}
        />
      )}
    </div>
  );
};
