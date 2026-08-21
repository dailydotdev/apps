import { useContext } from 'react';
import { featurePostAdsense } from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { isDevelopment } from '../../../lib/constants';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
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
 * and only for anonymous visitors — any logged-in user (member or Plus)
 * never sees programmatic ads on their post pages.
 */
export const useOrganicAdsenseSlots = (): ReadAdsenseSlots => {
  // Raw context rather than useAuthContext: this runs inside every slot
  // (read surface included), where an AuthContext provider isn't guaranteed.
  const isAnonymous = !useContext(AuthContext)?.user;
  // Conditional evaluation, because evaluating enrolls: a logged-in visitor
  // is structurally unable to see a unit, and counting them into the
  // experiment population would dilute it.
  const { value: enabled } = useConditionalFeature({
    feature: featurePostAdsense,
    shouldEvaluate: isAnonymous,
  });

  return enabled && isAnonymous ? ORGANIC_ADSENSE_SLOTS : NO_SLOTS;
};
