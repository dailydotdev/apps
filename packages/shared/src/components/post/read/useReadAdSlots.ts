import { useContext } from 'react';
import { featureReadAds } from '../../../lib/featureManagement';
import AuthContext from '../../../contexts/AuthContext';
import { useActivePostContext } from '../../../contexts/ActivePostContext';
import type { Source } from '../../../graphql/sources';
import { isSourceAdFree } from '../../../lib/ads';
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
 * A post in an ad-free squad carries no slot at all. The post comes from the
 * caller where it has one (the page itself, the layout banner), otherwise from
 * the active post every slot below the page renders under.
 */
export interface AdSlotsPost {
  source?: Pick<Source, 'features'> | null;
}

const useIsAdFreePost = (post?: AdSlotsPost): boolean => {
  const { activePost } = useActivePostContext();
  return isSourceAdFree((post ?? activePost)?.source);
};

/**
 * The /read template's slots. Anonymous visitors only: the page exists for
 * paid-acquisition traffic, and ad-free is part of what Plus members pay for.
 * The `read_ads` flag is an emergency kill switch, on by default; there is no
 * ramp. Development builds get the dashed density placeholders instead of
 * live auctions, hence the empty map there.
 */
export const useReadAdSlots = (post?: AdSlotsPost): AdSlots => {
  const isAnonymous = useIsAnonymous();
  const enabled = useFeature(featureReadAds);
  const isAdFree = useIsAdFreePost(post);

  if (isDevelopment) {
    return NO_SLOTS;
  }

  return enabled && isAnonymous && !isAdFree ? READ_AD_SLOTS : NO_SLOTS;
};

/**
 * The organic post page's slots, permanent since the post_adsense experiment
 * won: anonymous visitors only, so any logged-in user (member or Plus) never
 * sees programmatic ads on their post pages. Both post layouts carry them.
 */
export const useOrganicAdSlots = (post?: AdSlotsPost): AdSlots => {
  const isAnonymous = useIsAnonymous();
  const isAdFree = useIsAdFreePost(post);

  return isAnonymous && !isAdFree ? ORGANIC_AD_SLOTS : NO_SLOTS;
};
