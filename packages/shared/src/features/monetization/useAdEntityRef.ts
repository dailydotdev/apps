import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { AdEntityTarget } from '../../lib/ads';
import { AdEntity } from '../../lib/ads';
import { featureAdEntityParams } from '../../lib/featureManagement';
import { useActivePostContext } from '../../contexts/ActivePostContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useOptionalSquadPageContext } from '../squads/SquadPageContext';

const getAdEntity = ({
  postId,
  squadId,
}: {
  postId?: string;
  squadId?: string;
}): AdEntityTarget | undefined => {
  if (postId) {
    return { entity: AdEntity.Post, id: postId };
  }

  if (squadId) {
    return { entity: AdEntity.Source, id: squadId };
  }

  return undefined;
};

/**
 * A ref, read when a request is made, so the entity never joins a query key
 * or fetch callback: a slot never refetches when the entity or its flag
 * settles, and never waits on GrowthBook to request an ad.
 */
export const useAdEntityRef = (
  enabled = true,
): MutableRefObject<AdEntityTarget | undefined> => {
  const { activePost } = useActivePostContext();
  const squadPage = useOptionalSquadPageContext();
  const postId = activePost?.id;
  const squadId = squadPage?.squad.id;
  const { value: isEntityEnabled } = useConditionalFeature({
    feature: featureAdEntityParams,
    shouldEvaluate: enabled && (!!postId || !!squadId),
  });
  const entityRef = useRef<AdEntityTarget | undefined>(undefined);
  entityRef.current = isEntityEnabled
    ? getAdEntity({ postId, squadId })
    : undefined;

  return entityRef;
};
