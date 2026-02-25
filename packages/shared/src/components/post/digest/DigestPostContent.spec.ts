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
      company_name: 'Acme Corp',
      company_logo: 'https://example.com/logo.png',
      call_to_action: 'Learn More',
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

  it('should set source to daily regardless of ad type', () => {
    const digestAd: DigestPostAd = {
      type: 'ad_plus',
      index: 1,
      title: 'Upgrade to Plus',
      link: 'https://daily.dev/plus',
      image: 'https://daily.dev/plus-image.png',
      company_name: 'daily.dev',
      company_logo: 'https://daily.dev/logo.png',
      call_to_action: 'Upgrade',
    };

    const result = transformDigestAd(digestAd);

    expect(result.ad.source).toBe('daily');
  });

  it('should always set pixel to empty array', () => {
    const digestAd: DigestPostAd = {
      type: 'dynamic_ad',
      index: 0,
      title: 'Ad title',
      link: 'https://example.com',
      image: 'https://example.com/img.png',
      company_name: 'Company',
      company_logo: 'https://example.com/logo.png',
      call_to_action: 'Click',
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
      company_name: 'Company',
      company_logo: 'https://example.com/logo.png',
      call_to_action: 'Click',
    };

    const result = transformDigestAd(digestAd);

    expect(result.index).toBe(7);
  });
});
