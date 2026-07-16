import type { AdvertiserCampaign } from './types';
import { googleCloudCampaign } from './campaigns/googleCloud/campaign';

// The advertiser campaigns currently running in the Explore-feed mockup.
//
// TO ADD A NEW COMPANY (e.g. IBM, Kaiser):
//   1. Create `campaigns/<company>/images.ts` with the creative images
//      (base64 data URIs keep the mockup self-contained — no hosting needed).
//   2. Create `campaigns/<company>/campaign.ts` exporting an
//      `AdvertiserCampaign` (brand + placements) — copy googleCloud/campaign.ts.
//   3. Add it to the array below.
//
// With more than one campaign here, the randomizer mixes creatives across all
// of them. To feature a single advertiser exclusively, keep just one entry.
export const activeCampaigns: AdvertiserCampaign[] = [googleCloudCampaign];
