import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';
import type { AgentFeedItem } from '../hooks/useAgentFeed';
import { useAgent } from '../AgentContext';
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader';
import { AgentIntro } from './AgentIntro';
import { AgentChatSection } from './AgentChatSection';
import { AgentComposer } from './AgentComposer';
import { AgentContentPane } from './AgentContentPane';
import { AgentDebugPanel } from './AgentDebugPanel';
import { AgentSettingsModal } from './AgentSettingsModal';

// Both columns floor at a mobile-width panel.
const minPanelWidth = 384;
const defaultPaneWidth = 480;

export const AgentWorkspace = ({
  items,
  postsCount,
  onDelete,
  isDeleting,
}: {
  items: AgentFeedItem[];
  postsCount: number;
  onDelete: () => void;
  isDeleting: boolean;
}): ReactElement => {
  const { isSettingsOpen, setSettingsOpen, openContent, messages } = useAgent();
  const { isV2 } = useLayoutVariant();
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

  useEffect(() => {
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
    <>
      <div
        ref={workspaceRef}
        className={classNames(
          'relative flex w-full flex-row overflow-hidden',
          // The workspace scrolls internally, so it has to stop exactly at the
          // viewport. What sits above it differs per layout: the mobile footer
          // nav plus the global header in the control variant, the floating
          // card's own margins in v2.
          'h-[calc(100dvh-7.5rem-var(--safe-area-top))] tablet:h-[calc(100dvh-3.5rem)]',
          isV2
            ? 'laptop:h-[calc(100dvh-1.75rem)]'
            : 'laptop:h-[calc(100dvh-4rem)]',
        )}
      >
        <FlexCol className="min-w-0 flex-1">
          <AgentWorkspaceHeader />
          <div
            ref={transcriptRef}
            className="min-h-0 flex-1 overflow-y-auto px-3 tablet:px-4"
          >
            <FlexCol className="mx-auto w-full max-w-[45rem] gap-8 py-6">
              <AgentIntro
                findingsCount={items.length}
                postsCount={postsCount}
              />
              <AgentChatSection />
            </FlexCol>
          </div>
          <AgentComposer />
        </FlexCol>
        {!!openContent.length && (
          <AgentContentPane
            width={paneWidth}
            onWidthChange={onPaneWidthChange}
            onWidthCommit={onPaneWidthCommit}
            debugPanel={
              <AgentDebugPanel
                items={items}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            }
          />
        )}
      </div>
      {isSettingsOpen && (
        <AgentSettingsModal
          isOpen
          onRequestClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
};
