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
  const [storedWidth, setStoredWidth] = usePersistentContext<number>(
    'agentPaneWidth',
    defaultPaneWidth,
  );
  // Live width during a drag; committed to storage on pointer release so a
  // drag doesn't write to IndexedDB on every pointermove.
  const [draggingWidth, setDraggingWidth] = useState<number>();
  const paneWidth = draggingWidth ?? storedWidth ?? defaultPaneWidth;
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

  const onPaneWidthChange = (next: number) => {
    const workspace = workspaceRef.current;

    if (!workspace) {
      return;
    }

    const max = Math.max(minPanelWidth, workspace.clientWidth - minPanelWidth);

    setDraggingWidth(Math.min(Math.max(next, minPanelWidth), max));
  };

  const onPaneWidthCommit = () => {
    if (typeof draggingWidth === 'undefined') {
      return;
    }

    setStoredWidth(draggingWidth);
    setDraggingWidth(undefined);
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
            <div
              ref={transcriptRef}
              onScroll={onTranscriptScroll}
              className="agent-scroll min-h-0 flex-1 overflow-y-auto px-5 tablet:px-8 laptop:px-10"
            >
              <FlexCol className="mx-auto w-full max-w-[45rem] gap-8 py-6">
                <AgentIntro
                  findingsCount={items.length}
                  postsCount={postsCount}
                />
                <AgentChatSection />
              </FlexCol>
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
