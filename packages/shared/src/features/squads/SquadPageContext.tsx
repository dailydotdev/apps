import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Squad } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import type { SquadViewer } from './lib/viewer';
import { getSquadViewer, isStaffViewer } from './lib/viewer';

interface SquadPageContextProps {
  squad: Squad;
  /**
   * False while the page renders the server's anonymous copy of the squad,
   * before the viewer's own copy arrives. Viewer specific controls wait.
   */
  isViewerReady: boolean;
  children?: ReactNode;
}

export interface SquadPageContextValue {
  /** The squad as the page renders it: without the membership in preview. */
  squad: Squad;
  viewer: SquadViewer;
  /** The viewer's own role, which preview does not change. */
  ownViewer: SquadViewer;
  isViewerReady: boolean;
  /** Staff may look at the page as a logged in visitor who has not joined. */
  canPreview: boolean;
  isPreviewing: boolean;
  togglePreview: () => void;
}

const [SquadPageContextProvider, useSquadPageContext] = createContextProvider(
  ({ squad, isViewerReady }: SquadPageContextProps): SquadPageContextValue => {
    const { isLoggedIn } = useAuthContext();
    const { logEvent } = useLogContext();
    const [isPreviewing, setIsPreviewing] = useState(false);
    const ownViewer = getSquadViewer(squad, isLoggedIn);
    const canPreview = isViewerReady && isStaffViewer(ownViewer);
    const isPreviewActive = canPreview && isPreviewing;

    const togglePreview = useCallback(() => {
      logEvent({
        event_name: LogEvent.ToggleSquadPreview,
        target_id: squad.id,
        extra: JSON.stringify({ preview: !isPreviewing }),
      });
      setIsPreviewing(!isPreviewing);
    }, [isPreviewing, logEvent, squad.id]);

    const pageSquad = useMemo(
      () => (isPreviewActive ? { ...squad, currentMember: undefined } : squad),
      [isPreviewActive, squad],
    );

    return useMemo(
      () => ({
        squad: pageSquad,
        viewer: getSquadViewer(pageSquad, isLoggedIn),
        ownViewer,
        isViewerReady,
        canPreview,
        isPreviewing: isPreviewActive,
        togglePreview,
      }),
      [
        pageSquad,
        isLoggedIn,
        ownViewer,
        isViewerReady,
        canPreview,
        isPreviewActive,
        togglePreview,
      ],
    );
  },
  { errorMessage: 'SquadPageContext is missing its provider' },
);

export { SquadPageContextProvider, useSquadPageContext };
