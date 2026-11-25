import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { AdEntityTarget } from '../../lib/ads';
import { AdEntity } from '../../lib/ads';
import { featureAdEntityParams } from '../../lib/featureManagement';
import { useActivePostContext } from '../../contexts/ActivePostContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
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

interface UseAdEntityRef {
  entityRef: MutableRefObject<AdEntityTarget | undefined>;
  isPending: boolean;
}

/**
 * A ref, read when a request is made, so the entity never joins a query key
 * or fetch callback and a slot never refetches when it changes. A slot with a
 * post or squad waits for the features to settle, so its one request already
 * knows the flag; settling fails open when the boot has no features.
 */
export const useAdEntityRef = (enabled = true): UseAdEntityRef => {
  const { activePost } = useActivePostContext();
  const squadPage = useOptionalSquadPageContext();
  const postId = activePost?.id;
  const squadId = squadPage?.squad.id;
  const hasEntity = !!postId || !!squadId;
  const { settled } = useFeaturesReadyContext();
  const { value: isEntityEnabled } = useConditionalFeature({
    feature: featureAdEntityParams,
    shouldEvaluate: enabled && hasEntity,
  });
  const entityRef = useRef<AdEntityTarget | undefined>(undefined);
  entityRef.current = isEntityEnabled
    ? getAdEntity({ postId, squadId })
    : undefined;

  return { entityRef, isPending: enabled && hasEntity && !settled };
};
