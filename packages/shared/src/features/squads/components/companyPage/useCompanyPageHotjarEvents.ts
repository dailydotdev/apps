import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import {
  squadFreeBoostQueryOptions,
  SquadFreeBoostStatus,
} from '../../../../graphql/squadFreeBoost';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { StartupsHotjarEvent, trackHotjarEvent } from '../../../../lib/hotjar';
import storageWrapper from '../../../../lib/storageWrapper';
import {
  isCompanyPageDescriptionReady,
  isPlaceholderSquadImage,
} from '../../lib/readiness';

type Milestone =
  | StartupsHotjarEvent.CompanyPageReady
  | StartupsHotjarEvent.FirstPost
  | StartupsHotjarEvent.FreeBoost;

type Reached = Partial<Record<Milestone, boolean>>;

const storage = storageWrapper();
const getStorageKey = (squadId: string) => `startups_hotjar_${squadId}`;
// A page this young has nothing reached before it was first seen
const NEW_PAGE_MS = 24 * 60 * 60 * 1000;
const BOOSTED = [
  SquadFreeBoostStatus.Pending,
  SquadFreeBoostStatus.Active,
  SquadFreeBoostStatus.Completed,
];

const readReached = (squadId: string): Reached | null => {
  try {
    return JSON.parse(storage.getItem(getStorageKey(squadId)) ?? 'null');
  } catch {
    return null;
  }
};

/**
 * Sends a Hotjar event when a company page reaches a funnel stage while its
 * admin watches: ready for the free boost (logo, website, description), its
 * first post, and the free boost starting. What was already reached is kept
 * per page in this browser, so each stage is sent once.
 */
export const useCompanyPageHotjarEvents = (squad: Squad): void => {
  const { user } = useAuthContext();
  const { data: freeBoost, isFetched: isFreeBoostFetched } = useQuery({
    ...squadFreeBoostQueryOptions({ user, sourceId: squad.id }),
    enabled: !!user,
  });
  const isReady =
    !isPlaceholderSquadImage(squad.image) &&
    !!squad.website &&
    isCompanyPageDescriptionReady(squad.description);
  const hasPosted = (squad.flags?.totalPosts ?? 0) > 0;
  const isBoosted = !!freeBoost?.status && BOOSTED.includes(freeBoost.status);

  useEffect(() => {
    const squadId = squad.id;

    if (!isFreeBoostFetched || !squadId) {
      return;
    }

    const now: Reached = {
      [StartupsHotjarEvent.CompanyPageReady]: isReady,
      [StartupsHotjarEvent.FirstPost]: hasPosted,
      [StartupsHotjarEvent.FreeBoost]: isBoosted,
    };
    const isNewPage =
      !!squad.createdAt &&
      Date.now() - new Date(squad.createdAt).getTime() < NEW_PAGE_MS;
    const before = readReached(squadId) ?? (isNewPage ? {} : now);
    const reached: Reached = { ...before };

    (Object.keys(now) as Milestone[]).forEach((milestone) => {
      if (now[milestone] && !before[milestone]) {
        trackHotjarEvent(milestone);
        reached[milestone] = true;
      }
    });

    storage.setItem(getStorageKey(squadId), JSON.stringify(reached));
  }, [
    hasPosted,
    isBoosted,
    isFreeBoostFetched,
    isReady,
    squad.createdAt,
    squad.id,
  ]);
};
