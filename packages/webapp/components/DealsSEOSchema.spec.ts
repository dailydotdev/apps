import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import {
  DealCaveatKind,
  DealMediaKind,
  DealState,
  DealType,
} from '@dailydotdev/shared/src/features/deals/types';
import { getDealSeo } from '../lib/dealsSeo';
import {
  getDealBrandCrumbs,
  getDealCategoryCrumbs,
  getDealCrumbs,
  getDealPageJsonLd,
  getDealsCollectionJsonLd,
} from './DealsSEOSchema';

const buildDeal = (overrides: Partial<Deal> = {}): Deal => ({
  id: 'deal-id',
  slug: 'keychron-q1-30-off',
  title: '30% off the Keychron Q1 mechanical keyboard',
  description: 'The hot-swappable board half of your timeline types on.',
  brand: {
    id: 'b-keychron',
    name: 'Keychron',
    logoUrl: null,
    domain: 'keychron.com',
  },
  type: DealType.PromoCode,
  state: DealState.Available,
  value: { label: '-30%', savingsUsd: 60 },
  code: 'KEYDEV30',
  partnerUrl: 'https://keychron.com/products/keychron-q1',
  isCommissioned: true,
  publishedAt: '2026-07-30T09:00:00.000Z',
  updatedAt: '2026-08-01T08:25:00.000Z',
  validFrom: '2026-07-30T09:00:00.000Z',
  validThrough: '2026-08-27T09:00:00.000Z',
  priceCurrency: 'USD',
  discountPercent: 30,
  terms: 'One use per customer.',
  caveats: [
    {
      kind: DealCaveatKind.SingleUse,
      label: 'One use per customer',
      detail: 'One use per customer. A second order pays full price.',
    },
  ],
  categories: ['Hardware'],
  community: {
    upvotes: 1204,
    comments: 88,
    claims: 2411,
    worksRate: 0.93,
    lastVerifiedAt: '2026-08-01T08:25:00.000Z',
  },
  ...overrides,
});

const parseGraph = (jsonLd: string): Record<string, unknown>[] =>
  JSON.parse(jsonLd)['@graph'];

const findNode = (
  jsonLd: string,
  type: string,
): Record<string, unknown> | undefined =>
  parseGraph(jsonLd).find((node) => node['@type'] === type);

describe('getDealPageJsonLd', () => {
  it('emits an ItemPage carrying the deal freshness dates', () => {
    const deal = buildDeal();
    const page = findNode(getDealPageJsonLd(deal), 'ItemPage');

    expect(page).toMatchObject({
      '@id': 'https://daily.dev/deals/keychron-q1-30-off#page',
      url: 'https://daily.dev/deals/keychron-q1-30-off',
      name: deal.title,
      datePublished: deal.publishedAt,
      dateModified: deal.updatedAt,
      mainEntity: { '@id': 'https://daily.dev/deals/keychron-q1-30-off#offer' },
    });
  });

  it('emits an Offer with the merchant as seller and the discount we can evidence', () => {
    const offer = findNode(getDealPageJsonLd(buildDeal()), 'Offer');

    expect(offer).toMatchObject({
      '@id': 'https://daily.dev/deals/keychron-q1-30-off#offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      discount: '30%',
      discountCode: 'KEYDEV30',
      validThrough: '2026-08-27T09:00:00.000Z',
      seller: {
        '@type': 'Organization',
        name: 'Keychron',
        url: 'https://keychron.com',
      },
    });
  });

  it('omits price when the directory does not hold one', () => {
    const offer = findNode(getDealPageJsonLd(buildDeal()), 'Offer');

    expect(offer).not.toHaveProperty('price');
  });

  it('emits a money discount with its currency when there is no percentage', () => {
    const deal = buildDeal({
      discountPercent: undefined,
      discountAmount: 20,
      code: undefined,
    });
    const offer = findNode(getDealPageJsonLd(deal), 'Offer');

    expect(offer).toMatchObject({ discount: 20, discountCurrency: 'USD' });
    expect(offer).not.toHaveProperty('discountCode');
  });

  it('maps sold out and expired deals to their schema availability', () => {
    const soldOut = findNode(
      getDealPageJsonLd(buildDeal({ state: DealState.SoldOut })),
      'Offer',
    );
    const expired = findNode(
      getDealPageJsonLd(buildDeal({ state: DealState.Expired })),
      'Offer',
    );

    expect(soldOut).toMatchObject({
      availability: 'https://schema.org/SoldOut',
    });
    expect(expired).toMatchObject({
      availability: 'https://schema.org/Discontinued',
    });
  });

  it('carries the deal media as the image on the page and the offer', () => {
    const jsonLd = getDealPageJsonLd(
      buildDeal({
        media: {
          kind: DealMediaKind.Product,
          imageUrl: 'https://upload.wikimedia.org/keychron.jpg',
          alt: 'A Keychron Q series aluminium mechanical keyboard',
          isRepresentative: true,
        },
      }),
    );

    expect(findNode(jsonLd, 'ItemPage')).toMatchObject({
      image: 'https://upload.wikimedia.org/keychron.jpg',
    });
    expect(findNode(jsonLd, 'Offer')).toMatchObject({
      image: 'https://upload.wikimedia.org/keychron.jpg',
    });
  });

  it('resolves a relative media path against the app origin', () => {
    const jsonLd = getDealPageJsonLd(
      buildDeal({
        media: {
          kind: DealMediaKind.Artwork,
          imageUrl: '/images/amazon-gift-card.png',
          alt: 'Amazon gift card artwork',
        },
      }),
    );

    expect(findNode(jsonLd, 'Offer')).toMatchObject({
      image: 'https://daily.dev/images/amazon-gift-card.png',
    });
  });

  it('omits the image rather than emitting a placeholder when there is no media', () => {
    const jsonLd = getDealPageJsonLd(buildDeal());

    expect(findNode(jsonLd, 'ItemPage')).not.toHaveProperty('image');
    expect(findNode(jsonLd, 'Offer')).not.toHaveProperty('image');
  });

  it('mirrors the visible breadcrumb trail', () => {
    const deal = buildDeal();
    const breadcrumbs = findNode(getDealPageJsonLd(deal), 'BreadcrumbList');

    expect(getDealCrumbs(deal)).toEqual([
      { name: 'Deals', path: '/deals' },
      { name: 'Keychron', path: '/deals/brand/keychron' },
      { name: deal.title },
    ]);
    expect(breadcrumbs).toMatchObject({
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Deals',
          item: 'https://daily.dev/deals',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Keychron',
          item: 'https://daily.dev/deals/brand/keychron',
        },
        { '@type': 'ListItem', position: 3, name: deal.title },
      ],
    });
  });
});

describe('getDealsCollectionJsonLd', () => {
  const build = (deals: Deal[]): string =>
    getDealsCollectionJsonLd({
      deals,
      path: '/deals/c/hardware',
      name: 'Hardware deals and promo codes',
      description: 'Live hardware offers for developers.',
      crumbs: getDealCategoryCrumbs('Hardware'),
    });

  it('emits a CollectionPage and an ItemList of every deal', () => {
    const jsonLd = build([buildDeal(), buildDeal({ slug: 'other', id: 'x' })]);

    expect(findNode(jsonLd, 'CollectionPage')).toMatchObject({
      '@id': 'https://daily.dev/deals/c/hardware#page',
      url: 'https://daily.dev/deals/c/hardware',
      name: 'Hardware deals and promo codes',
    });
    expect(findNode(jsonLd, 'ItemList')).toMatchObject({
      '@id': 'https://daily.dev/deals/c/hardware#deals',
      numberOfItems: 2,
      itemListElement: [
        {
          position: 1,
          url: 'https://daily.dev/deals/keychron-q1-30-off',
        },
        { position: 2, url: 'https://daily.dev/deals/other' },
      ],
    });
  });

  it('omits the ItemList rather than emitting an empty one', () => {
    expect(findNode(build([]), 'ItemList')).toBeUndefined();
    expect(findNode(build([]), 'CollectionPage')).toBeDefined();
  });

  it('builds brand crumbs from the same helper the page renders', () => {
    expect(getDealBrandCrumbs('Keychron')).toEqual([
      { name: 'Deals', path: '/deals' },
      { name: 'Keychron' },
    ]);
  });
});

describe('getDealSeo social images', () => {
  const getOgImages = (deal: Deal) =>
    getDealSeo(deal, Date.parse('2026-08-01T09:00:00.000Z')).openGraph?.images;

  it('uses a product photo as the share image', () => {
    const images = getOgImages(
      buildDeal({
        media: {
          kind: DealMediaKind.Product,
          imageUrl: 'https://upload.wikimedia.org/keychron.jpg',
          alt: 'A Keychron Q series aluminium mechanical keyboard',
        },
      }),
    );

    expect(images).toEqual([
      {
        url: 'https://upload.wikimedia.org/keychron.jpg',
        alt: 'A Keychron Q series aluminium mechanical keyboard',
      },
    ]);
  });

  it('falls back to the default share image for a brand mark, which is a 128px favicon', () => {
    const brandImages = getOgImages(
      buildDeal({
        media: {
          kind: DealMediaKind.Brand,
          imageUrl: 'https://cdn.simpleicons.org/cursor',
          alt: 'Cursor logo',
        },
      }),
    );

    expect(brandImages).toEqual(getOgImages(buildDeal({ media: undefined })));
    expect(brandImages).not.toContainEqual(
      expect.objectContaining({ url: 'https://cdn.simpleicons.org/cursor' }),
    );
  });

  it('keeps the brand mark on the JSON-LD image, where size is not a ranking input', () => {
    const jsonLd = getDealPageJsonLd(
      buildDeal({
        media: {
          kind: DealMediaKind.Brand,
          imageUrl: 'https://cdn.simpleicons.org/cursor',
          alt: 'Cursor logo',
        },
      }),
    );

    expect(findNode(jsonLd, 'Offer')).toMatchObject({
      image: 'https://cdn.simpleicons.org/cursor',
    });
  });
});
