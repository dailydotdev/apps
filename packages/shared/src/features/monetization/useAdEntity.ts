import { useMemo } from 'react';
import type { AdEntityTarget } from '../../lib/ads';
import { AdEntity } from '../../lib/ads';
import { featureAdEntityParams } from '../../lib/featureManagement';
import { useActivePostContext } from '../../contexts/ActivePostContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useOptionalSquadPageContext } from '../squads/SquadPageContext';

interface UseAdEntity {
  entity?: AdEntityTarget;
  isLoading: boolean;
}

export const useAdEntity = (enabled = true): UseAdEntity => {
  const { activePost } = useActivePostContext();
  const squadPage = useOptionalSquadPageContext();
  const postId = activePost?.id;
  const squadId = squadPage?.squad.id;
  const hasEntity = !!postId || !!squadId;
  const { value: isEntityEnabled, isLoading } = useConditionalFeature({
    feature: featureAdEntityParams,
    shouldEvaluate: enabled && hasEntity,
  });

  const entity = useMemo((): AdEntityTarget | undefined => {
    if (!isEntityEnabled) {
      return undefined;
    }

    if (postId) {
      return { entity: AdEntity.Post, id: postId };
    }

    if (squadId) {
      return { entity: AdEntity.Source, id: squadId };
    }

    return undefined;
  }, [isEntityEnabled, postId, squadId]);

  return { entity, isLoading: enabled && hasEntity && isLoading };
};
