import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Squad } from '../../graphql/sources';
import type { Post } from '../../graphql/posts';
import type { SquadProduct } from '../../graphql/squadProducts';
import type { SquadJob } from '../../graphql/squadJobs';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { safeContextHookExport } from '../../lib/func';
import type { SquadViewer } from './lib/viewer';
import { getSquadViewer, isStaffViewer } from './lib/viewer';
import { useSquadStaffLayerPending } from './hooks/useSquadStaffLayer';

/** A public squad's lists the server fetched, shown until the viewer's own */
export interface SquadPageContent {
  pins?: Post[];
  products?: SquadProduct[];
  jobs?: SquadJob[];
}

interface SquadPageContextProps {
  squad: Squad;
  /**
   * False while the page renders the server's anonymous copy of the squad,
   * before the viewer's own copy arrives. Controls that need the viewer's
   * full permissions wait for it.
   */
  isViewerReady: boolean;
  /**
   * The page shows staff-only blocks: they wait for the viewer's own copy of
   * the squad and the data they render from, and come in together.
   */
  hasStaffLayer?: boolean;
  initialContent?: SquadPageContent;
  children?: ReactNode;
}

export interface SquadPageContextValue {
  /** The squad as the page renders it: without the membership in preview. */
  squad: Squad;
  viewer: SquadViewer;
  /** The viewer's own role, which preview does not change. */
  ownViewer: SquadViewer;
  isViewerReady: boolean;
  /**
   * The viewer's role is settled, from boot's squad memberships before the
   * squad query lands, so role specific regions render once without shifting.
   * For staff it also waits for their own copy of the squad and their blocks'
   * data, so everything they get comes in at once.
   */
  isViewerKnown: boolean;
  initialContent?: SquadPageContent;
  /** Staff may look at the page as a logged in visitor who has not joined. */
  canPreview: boolean;
  isPreviewing: boolean;
  togglePreview: () => void;
}

const [SquadPageContextProvider, useSquadPageContext] = createContextProvider(
  ({
    squad,
    isViewerReady,
    hasStaffLayer = false,
    initialContent,
  }: SquadPageContextProps): SquadPageContextValue => {
    const { isLoggedIn, isAuthReadyOrCached, squads } = useAuthContext();
    const { logEvent } = useLogContext();
    const [isPreviewing, setIsPreviewing] = useState(false);
    const bootMember = useMemo(
      () => squads?.find(({ id }) => id === squad.id)?.currentMember,
      [squads, squad.id],
    );
    const viewerSquad = useMemo(
      () =>
        isViewerReady || !bootMember
          ? squad
          : { ...squad, currentMember: bootMember },
      [isViewerReady, bootMember, squad],
    );
    const ownViewer = getSquadViewer(viewerSquad, isLoggedIn);
    const isRoleKnown = isViewerReady || isAuthReadyOrCached;
    const hasStaffBlocks =
      hasStaffLayer && isRoleKnown && isStaffViewer(ownViewer);
    const isStaffLayerPending = useSquadStaffLayerPending(
      viewerSquad,
      hasStaffBlocks,
    );
    const isViewerKnown =
      isRoleKnown &&
      (!hasStaffBlocks || (isViewerReady && !isStaffLayerPending));
    const canPreview = isViewerKnown && isStaffViewer(ownViewer);
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
      () =>
        isPreviewActive
          ? { ...viewerSquad, currentMember: undefined }
          : viewerSquad,
      [isPreviewActive, viewerSquad],
    );

    return useMemo(
      () => ({
        squad: pageSquad,
        viewer: getSquadViewer(pageSquad, isLoggedIn),
        ownViewer,
        isViewerReady,
        isViewerKnown,
        initialContent,
        canPreview,
        isPreviewing: isPreviewActive,
        togglePreview,
      }),
      [
        pageSquad,
        isLoggedIn,
        ownViewer,
        isViewerReady,
        isViewerKnown,
        initialContent,
        canPreview,
        isPreviewActive,
        togglePreview,
      ],
    );
  },
  { errorMessage: 'SquadPageContext is missing its provider' },
);

const useOptionalSquadPageContext = safeContextHookExport(
  useSquadPageContext,
  'SquadPageContext is missing its provider',
);

export {
  SquadPageContextProvider,
  useSquadPageContext,
  useOptionalSquadPageContext,
};
