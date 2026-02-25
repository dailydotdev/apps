import type { Ad, DigestPostAd } from '../../../graphql/posts';

export const transformDigestAd = (
  digestAd: DigestPostAd,
): { ad: Ad; index: number } => ({
  ad: {
    source: 'daily',
    company: digestAd.company_name,
    description: digestAd.title,
    link: digestAd.link,
    image: digestAd.image,
    pixel: [],
  },
  index: digestAd.index,
});
