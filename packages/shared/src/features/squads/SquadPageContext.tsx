import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SourceFeatures, Squad } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { squadJobsPerksFeaturesQueryOptions } from '../../graphql/squadJobsPerks';
import type { SquadViewer } from './lib/viewer';
import { getSquadViewer, isStaffViewer } from './lib/viewer';

interface SquadPageContextProps {
  squad: Squad;
  /**
   * False while the page renders the server's anonymous copy of the squad,
   * before the viewer's own copy arrives. Controls that need the viewer's
   * full permissions wait for it.
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
  /**
   * The viewer's role is settled, from boot's squad memberships before the
   * squad query lands, so role specific regions render once without shifting.
   */
  isViewerKnown: boolean;
  /** Staff may look at the page as a logged in visitor who has not joined. */
  canPreview: boolean;
  isPreviewing: boolean;
  togglePreview: () => void;
  /** The jobs and perks flags have arrived, or the squad cannot have them. */
  areFeaturesReady: boolean;
}

const [SquadPageContextProvider, useSquadPageContext] = createContextProvider(
  ({ squad, isViewerReady }: SquadPageContextProps): SquadPageContextValue => {
    const { isLoggedIn, isAuthReadyOrCached, squads } = useAuthContext();
    const { logEvent } = useLogContext();
    const [isPreviewing, setIsPreviewing] = useState(false);
    const bootMember = useMemo(
      () => squads?.find(({ id }) => id === squad.id)?.currentMember,
      [squads, squad.id],
    );
    // Jobs and perks come from their own query (see the query options),
    // folded into the squad here so every surface reads squad.features
    const featuresQuery = squadJobsPerksFeaturesQueryOptions({ squad });
    const { data: jobsPerks, isFetched: isFeaturesFetched } =
      useQuery(featuresQuery);
    const areFeaturesReady = !featuresQuery.enabled || isFeaturesFetched;
    const viewerSquad = useMemo(() => {
      const withFeatures = jobsPerks
        ? {
            ...squad,
            features: { ...squad.features, ...jobsPerks } as SourceFeatures,
          }
        : squad;

      return isViewerReady || !bootMember
        ? withFeatures
        : { ...withFeatures, currentMember: bootMember };
    }, [isViewerReady, bootMember, squad, jobsPerks]);
    const isViewerKnown = isViewerReady || isAuthReadyOrCached;
    const ownViewer = getSquadViewer(viewerSquad, isLoggedIn);
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
        canPreview,
        isPreviewing: isPreviewActive,
        togglePreview,
        areFeaturesReady,
      }),
      [
        pageSquad,
        isLoggedIn,
        ownViewer,
        isViewerReady,
        isViewerKnown,
        canPreview,
        isPreviewActive,
        togglePreview,
        areFeaturesReady,
      ],
    );
  },
  { errorMessage: 'SquadPageContext is missing its provider' },
);

export { SquadPageContextProvider, useSquadPageContext };
