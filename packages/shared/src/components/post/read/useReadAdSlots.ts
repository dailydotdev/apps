import { useContext } from 'react';
import {
  featureReadAds,
  featureReadTaboola,
} from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { isDevelopment } from '../../../lib/constants';
import { useFeature } from '../../GrowthBookProvider';
import type { AdSlots } from '../../../features/monetization/kueez';
import { ORGANIC_AD_SLOTS, READ_AD_SLOTS } from './slots';

const NO_SLOTS: AdSlots = {};

/**
 * Anonymous is a post-boot fact, not the absence of a user object: `user` is
 * undefined until boot resolves, so reading it early classifies every
 * logged-in visitor as anonymous for a moment, long enough to run an auction
 * that then has to be torn back out of a Plus member's page. No provider (a
 * bare component test) is never anonymous.
 */
const useIsAnonymous = (): boolean => {
  const auth = useContext(AuthContext);
  return !!auth?.isAuthReady && !auth?.user;
};

/**
 * Whether the /read template serves Taboola's widgets instead of its Kueez
 * units. Same audience as the Kueez slots, anonymous visitors only, except
 * in development, where the flag is on and any session renders live widgets
 * for testing. Either way only once boot resolves, so widgets never render
 * on the server.
 */
export const useReadTaboola = (): boolean => {
  const auth = useContext(AuthContext);
  const enabled = useFeature(featureReadTaboola);

  return !!enabled && !!auth?.isAuthReady && (!auth.user || isDevelopment);
};

/**
 * Whether the /read template keeps its visitors on it: every way off the page
 * is dropped or leads to another /articles page, bar the one read CTA to the
 * original. Rides the Taboola flag, without its auth wait. The page is static
 * and flags resolve after boot, so outside development the chrome still
 * renders in full on the server and drops once features load.
 */
export const useArticlesContained = (): boolean =>
  !!useFeature(featureReadTaboola);

/**
 * The /read template's slots. Anonymous visitors only: the page exists for
 * paid-acquisition traffic, and ad-free is part of what Plus members pay for.
 * The `read_ads` flag is an emergency kill switch, on by default; there is no
 * ramp. Development builds get the dashed density placeholders instead of
 * live auctions, hence the empty map there.
 */
export const useReadAdSlots = (): AdSlots => {
  const isAnonymous = useIsAnonymous();
  const enabled = useFeature(featureReadAds);
  const taboola = useFeature(featureReadTaboola);

  if (isDevelopment || taboola) {
    return NO_SLOTS;
  }

  return enabled && isAnonymous ? READ_AD_SLOTS : NO_SLOTS;
};

/**
 * The organic post page's slots, permanent since the post_adsense experiment
 * won: anonymous visitors only, so any logged-in user (member or Plus) never
 * sees programmatic ads on their post pages. Both post layouts carry them.
 */
export const useOrganicAdSlots = (): AdSlots => {
  const isAnonymous = useIsAnonymous();

  return isAnonymous ? ORGANIC_AD_SLOTS : NO_SLOTS;
};
