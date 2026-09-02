// Advertiser-agnostic model for the Explore-feed ad takeover mockup.
//
// A "campaign" is one advertiser (Google Cloud today; IBM, Kaiser, etc. can be
// added later). Each campaign carries its brand (name/logo/CTA styling) and a
// list of creatives ("placements"). The feed card and the randomizer are fully
// driven by these objects, so onboarding a new company is: add an assets file,
// add a campaign object, and register it — no component or feed changes.

export type AdvertiserBrand = {
  // Shown in the card attribution as "Promoted by {name}".
  name: string;
  // Round favicon/avatar on the card. A data URI or an absolute URL.
  logo: string;
};

export type AdvertiserPlacement = {
  // Stable unique id across the whole mockup (prefix with the campaign id).
  id: string;
  // Human label for the product this creative promotes (for reference/QA).
  product: string;
  headline: string;
  image: string;
  landingPage: string;
  // Raw UTM query string appended to the landing page. Optional.
  utm?: string;
  tags: string[];
};

export type AdvertiserCampaign = {
  id: string;
  brand: AdvertiserBrand;
  placements: AdvertiserPlacement[];
};

// A single creative resolved together with the campaign (brand) it belongs to.
// This is what the randomizer returns and the card renders.
export type ResolvedCreative = {
  campaign: AdvertiserCampaign;
  placement: AdvertiserPlacement;
};
