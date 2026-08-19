import type { NextApiRequest, NextApiResponse } from 'next';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import {
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import {
  getDealAvailability,
  getDealPath,
  isLiveDeal,
  shouldNoindexDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { getAppOrigin, toAbsoluteUrl } from '../../../lib/seo';

const appOrigin = getAppOrigin();

export const DEALS_FEED_VERSION = 1;

/**
 * `kind` lets a consumer tell a photograph of the product apart from a brand
 * mark, and `isRepresentative` marks the photos that show the product family
 * rather than the exact unit, so neither is reused as proof of the item sold.
 */
const toImage = (deal: Deal) => {
  const { media } = deal;

  if (!media) {
    return null;
  }

  return {
    url: toAbsoluteUrl(media.imageUrl),
    alt: media.alt,
    kind: media.kind,
    isRepresentative: !!media.isRepresentative,
    credit: media.credit ?? null,
  };
};

const toEntry = (deal: Deal) => ({
  slug: deal.slug,
  url: `${appOrigin}${getDealPath(deal)}`,
  title: deal.title,
  description: deal.description,
  brand: {
    name: deal.brand.name,
    domain: deal.brand.domain,
  },
  image: toImage(deal),
  type: deal.type,
  value: deal.value.label,
  savingsUsd: deal.value.savingsUsd ?? null,
  priceCurrency: deal.priceCurrency ?? null,
  discountPercent: deal.discountPercent ?? null,
  discountAmount: deal.discountAmount ?? null,
  partnerUrl: deal.partnerUrl,
  isCommissioned: deal.isCommissioned,
  availability: getDealAvailability(deal),
  categories: deal.categories,
  publishedAt: deal.publishedAt,
  updatedAt: deal.updatedAt,
  validFrom: deal.validFrom ?? null,
  validThrough: deal.validThrough ?? null,
  lastVerifiedAt: deal.community.lastVerifiedAt,
  claims: deal.community.claims,
  upvotes: deal.community.upvotes,
  worksRate: deal.community.worksRate,
});

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const deals = mockDeals
    .filter(isLiveDeal)
    .filter((deal) => !shouldNoindexDeal(deal, MOCK_NOW_MS))
    .map(toEntry);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=86400',
  );
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(200).json({
    version: DEALS_FEED_VERSION,
    generatedAt: new Date(MOCK_NOW_MS).toISOString(),
    directory: `${appOrigin}/deals`,
    count: deals.length,
    deals,
  });
};

export default handler;
