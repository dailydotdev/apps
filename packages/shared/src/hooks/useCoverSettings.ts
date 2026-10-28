import { useMemo } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import {
  featureCoverHook,
  featureGeneratedCover,
} from '../lib/featureManagement';

export interface CoverSettings {
  // Generated covers replace the stock placeholder on image-less posts
  enabled: boolean;
  // The enrichment hook is painted on the generated cover
  hook: boolean;
}

export const useCoverSettings = (): CoverSettings => {
  const enabled = useFeature(featureGeneratedCover);
  const hook = useFeature(featureCoverHook);

  // Memoised so effects keyed on it do not rerun every render
  return useMemo(() => ({ enabled: !!enabled, hook: !!hook }), [enabled, hook]);
};
