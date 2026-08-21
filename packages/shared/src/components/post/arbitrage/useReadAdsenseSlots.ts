import { useContext } from 'react';
import { featurePostAdsense } from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { isDevelopment } from '../../../lib/constants';
import { useFeature } from '../../GrowthBookProvider';
import type { ReadAdsenseSlots } from './adsense';
import { ORGANIC_ADSENSE_SLOTS, READ_ADSENSE_SLOTS } from './slots';

const NO_SLOTS: ReadAdsenseSlots = {};

/**
 * The /read template's units — always live: the page is only ever reached
 * through paid placements, so there is nothing to ramp. Development builds
 * get the dashed density placeholders instead of live units, hence the empty
 * map there.
 */
export const useReadAdsenseSlots = (): ReadAdsenseSlots =>
  isDevelopment ? NO_SLOTS : READ_ADSENSE_SLOTS;

/**
 * The organic post page's units: only while the `post_adsense` flag is on,
 * and only for anonymous visitors — logged-in users (member or Plus) never
 * see programmatic ads on their own feed's post pages.
 */
export const useOrganicAdsenseSlots = (): ReadAdsenseSlots => {
  // Raw context rather than useAuthContext: this runs inside every slot
  // (read surface included), where an AuthContext provider isn't guaranteed.
  const isAnonymous = !useContext(AuthContext)?.user;
  const enabled = useFeature(featurePostAdsense);

  return enabled && isAnonymous ? ORGANIC_ADSENSE_SLOTS : NO_SLOTS;
};
