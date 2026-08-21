import { useContext } from 'react';
import {
  featurePostAdsense,
  featureReadAdsense,
} from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { useFeature } from '../../GrowthBookProvider';
import type { ReadAdsenseSlots } from './adsense';
import { ORGANIC_ADSENSE_SLOTS, READ_ADSENSE_SLOTS } from './slots';

const NO_SLOTS: ReadAdsenseSlots = {};

/** The /read template's units; the whole surface hangs off one boolean. */
export const useReadAdsenseSlots = (): ReadAdsenseSlots =>
  useFeature(featureReadAdsense) ? READ_ADSENSE_SLOTS : NO_SLOTS;

/**
 * The organic post page's units. Plus members never see them, same as the
 * internal PostSidebarAdWidget — an ad-free experience is part of what they
 * pay for.
 */
export const useOrganicAdsenseSlots = (): ReadAdsenseSlots => {
  // Raw context rather than usePlusSubscription: this runs inside every slot
  // (read surface included), where an AuthContext provider isn't guaranteed.
  const isPlus = !!useContext(AuthContext)?.user?.isPlus;
  const enabled = useFeature(featurePostAdsense);

  return enabled && !isPlus ? ORGANIC_ADSENSE_SLOTS : NO_SLOTS;
};
