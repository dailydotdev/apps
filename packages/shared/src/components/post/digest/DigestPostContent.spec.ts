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
        pixel: [],
      },
      index: 3,
    });
  });

  it('should always set pixel to empty array', () => {
    const digestAd: DigestPostAd = {
      type: 'dynamic_ad',
      index: 0,
      title: 'Ad title',
      link: 'https://example.com',
      image: 'https://example.com/img.png',
      companyName: 'Company',
      companyLogo: 'https://example.com/logo.png',
      callToAction: 'Click',
    };

    const result = transformDigestAd(digestAd);

    expect(result.ad.pixel).toEqual([]);
  });

  it('should preserve the index from the digest ad', () => {
    const digestAd: DigestPostAd = {
      type: 'dynamic_ad',
      index: 7,
      title: 'Ad',
      link: 'https://example.com',
      image: 'https://example.com/img.png',
      companyName: 'Company',
      companyLogo: 'https://example.com/logo.png',
      callToAction: 'Click',
    };

    const result = transformDigestAd(digestAd);

    expect(result.index).toBe(7);
  });
});
