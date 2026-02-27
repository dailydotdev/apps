import type { Ad, DigestPostAd } from '../../../graphql/posts';

export const transformDigestAd = (
  digestAd: DigestPostAd,
): { ad: Ad; index: number } => ({
  ad: {
    source: 'daily',
    company: digestAd.companyName,
    description: digestAd.title,
    link: digestAd.link,
    image: digestAd.image,
    companyLogo: digestAd.companyLogo,
    callToAction: digestAd.callToAction,
    pixel: [],
  },
  index: digestAd.index,
});
