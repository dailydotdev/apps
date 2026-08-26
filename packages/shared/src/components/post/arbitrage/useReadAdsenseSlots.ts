import { useContext } from 'react';
import {
  featurePostAdsense,
  featureReadAdsense,
} from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { isDevelopment } from '../../../lib/constants';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useFeature } from '../../GrowthBookProvider';
import type { AdsenseSlots } from '../../../features/monetization/adsense';
import { hasLiveAdsenseUnits } from '../../../features/monetization/adsense';
import { ORGANIC_ADSENSE_SLOTS, READ_ADSENSE_SLOTS } from './slots';

const NO_SLOTS: AdsenseSlots = {};

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
export const useReadAdsenseSlots = (): AdsenseSlots => {
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
 *
 * `canRender` is the caller's own knowledge of whether its slots can appear
 * at all — the post page passes false in the focus-card redesign arm, whose
 * layout carries no slot markup.
 */
export const useOrganicAdsenseSlots = (canRender = true): AdsenseSlots => {
  const isAnonymous = useIsAnonymous();
  // Conditional evaluation, because evaluating enrolls: a visitor who is
  // logged in — or who cannot be shown a unit — would fill the experiment
  // with byte-identical variants.
  const { value: enabled } = useConditionalFeature({
    feature: featurePostAdsense,
    shouldEvaluate:
      canRender && isAnonymous && hasLiveAdsenseUnits(ORGANIC_ADSENSE_SLOTS),
  });

  return enabled && isAnonymous && canRender ? ORGANIC_ADSENSE_SLOTS : NO_SLOTS;
};
