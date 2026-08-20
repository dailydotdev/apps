import type { Feature } from '../../../lib/featureManagement';
import { featureReadAdsenseSlots } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';
import type { ReadAdsenseSlots } from './adsense';

/**
 * GrowthBook's JSONValue constraint rejects optional properties under strict
 * TS even though absent keys are valid JSON, so the one cast lives here. Any
 * entry in the value flips the /read template to live mode.
 */
export const useReadAdsenseSlots = (): ReadAdsenseSlots =>
  useFeature(
    featureReadAdsenseSlots as unknown as Feature<Record<string, never>>,
  ) as ReadAdsenseSlots;
