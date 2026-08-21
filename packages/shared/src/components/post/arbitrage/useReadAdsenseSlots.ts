import { useContext } from 'react';
import {
  featurePostAdsense,
  featureReadAdsense,
} from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { isDevelopment } from '../../../lib/constants';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useFeature } from '../../GrowthBookProvider';
import type { ReadAdsenseSlots } from './adsense';
import { hasLiveAdsenseUnits } from './adsense';
import { ORGANIC_ADSENSE_SLOTS, READ_ADSENSE_SLOTS } from './slots';

const NO_SLOTS: ReadAdsenseSlots = {};

/**
 * Anonymous is a post-boot fact, not the absence of a user object: `user` is
 * undefined until boot resolves, so reading it early classifies every
 * logged-in visitor as anonymous for a moment — long enough to request an ad
 * that then has to be torn back out of a Plus member's page. No provider (a
 * bare component test) is never anonymous.
 */
const useIsAnonymous = (): boolean => {
  const auth = useContext(AuthContext);
  return !!auth?.isAuthReady && !auth?.user;
};

/**
 * The /read template's units. Anonymous visitors only — the page exists for
 * paid-acquisition traffic, and ad-free is part of what Plus members pay for.
 * The `read_adsense` flag is an emergency kill switch, on by default; there
 * is no ramp. Development builds get the dashed density placeholders instead
 * of live units, hence the empty map there.
 */
export const useReadAdsenseSlots = (): ReadAdsenseSlots => {
  const isAnonymous = useIsAnonymous();
  const enabled = useFeature(featureReadAdsense);

  if (isDevelopment) {
    return NO_SLOTS;
  }

  return enabled && isAnonymous ? READ_ADSENSE_SLOTS : NO_SLOTS;
};

/**
 * The organic post page's units: only while the `post_adsense` flag is on,
 * and only for anonymous visitors — any logged-in user (member or Plus)
 * never sees programmatic ads on their post pages.
 */
export const useOrganicAdsenseSlots = (): ReadAdsenseSlots => {
  const isAnonymous = useIsAnonymous();
  // Conditional evaluation, because evaluating enrolls: a visitor who is
  // logged in — or whose units have no AdSense id yet and so cannot render
  // anything — would fill the experiment with byte-identical variants.
  const { value: enabled } = useConditionalFeature({
    feature: featurePostAdsense,
    shouldEvaluate: isAnonymous && hasLiveAdsenseUnits(ORGANIC_ADSENSE_SLOTS),
  });

  return enabled && isAnonymous ? ORGANIC_ADSENSE_SLOTS : NO_SLOTS;
};
