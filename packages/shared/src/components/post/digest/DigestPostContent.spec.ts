import type { DigestPostAd } from '../../../graphql/posts';
import { transformDigestAd } from './utils';

describe('transformDigestAd', () => {
  it('should transform DigestPostAd to Ad with correct field mapping', () => {
    const digestAd: DigestPostAd = {
      type: 'dynamic_ad',
      index: 3,
      title: 'Check out our product',
      link: 'https://example.com/ad',
      image: 'https://example.com/ad-image.png',
      companyName: 'Acme Corp',
      companyLogo: 'https://example.com/logo.png',
      callToAction: 'Learn More',
    };

    const result = transformDigestAd(digestAd);

    expect(result).toEqual({
      ad: {
        source: 'daily',
        company: 'Acme Corp',
        description: 'Check out our product',
        link: 'https://example.com/ad',
        image: 'https://example.com/ad-image.png',
        companyLogo: 'https://example.com/logo.png',
        callToAction: 'Learn More',
        pixel: [],
      },
      index: 3,
    });
  });
});
