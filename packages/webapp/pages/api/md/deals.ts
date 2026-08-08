import type { NextApiRequest, NextApiResponse } from 'next';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import {
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import {
  formatFullNumber,
  formatWorksRate,
  getDealBrandPath,
  getDealCategories,
  getDealCategoryPath,
  getDealCoverMedia,
  getDealPath,
  isLiveDeal,
  shouldNoindexDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { escapeMarkdown } from '@dailydotdev/shared/src/lib/strings';
import { getAppOrigin, getLlmsTxtUrl, toAbsoluteUrl } from '../../../lib/seo';
import {
  DEALS_DIRECTORY_DESCRIPTION,
  DEALS_DIRECTORY_TITLE,
} from '../../../lib/dealsSeo';

const appOrigin = getAppOrigin();
const llmsTxtUrl = getLlmsTxtUrl();

const formatDeal = (deal: Deal): string => {
  const cover = getDealCoverMedia(deal);
  const image = cover
    ? ` ![${escapeMarkdown(cover.alt)}](${toAbsoluteUrl(cover.imageUrl)})`
    : '';

  return `- [${escapeMarkdown(deal.title)}](${getDealPath(
    deal,
  )}): ${escapeMarkdown(deal.value.label)}, ${formatFullNumber(
    deal.community.claims,
  )} claims, ${formatWorksRate(
    deal.community.worksRate,
  )} reported working, last verified ${deal.community.lastVerifiedAt}.${image}`;
};

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const deals = mockDeals
    .filter(isLiveDeal)
    .filter((deal) => !shouldNoindexDeal(deal, MOCK_NOW_MS));
  const categories = getDealCategories(deals);

  const markdown = `---
title: ${DEALS_DIRECTORY_TITLE}
url: ${appOrigin}/deals
description: ${DEALS_DIRECTORY_DESCRIPTION}
---

> ## Documentation Index
> Fetch the complete documentation index at: ${llmsTxtUrl}
> Use this file to discover all available pages before exploring further.

# ${DEALS_DIRECTORY_TITLE}

> ${DEALS_DIRECTORY_DESCRIPTION}

Every offer below is operated by daily.dev and carries the number of developers who claimed it and the share who reported it worked. A machine readable version of the same data is served at ${appOrigin}/api/deals/feed.json, where each deal also carries an \`image\` object holding \`url\`, \`alt\`, \`kind\` (product, artwork or brand), \`isRepresentative\` and \`credit\`, or \`null\` when the deal has no image.

## Categories

${categories
  .map((category) => `- [${category} deals](${getDealCategoryPath(category)})`)
  .join('\n')}

## Live deals

${deals.map(formatDeal).join('\n')}

## Brands

${Array.from(new Map(deals.map((deal) => [deal.brand.id, deal.brand])).values())
  .map(
    (brand) =>
      `- [${escapeMarkdown(
        brand.name,
      )} promo codes and deals](${getDealBrandPath(brand)})`,
  )
  .join('\n')}

---

[View all deals on daily.dev](/deals)
`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Vary', 'Accept');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800',
  );
  res.setHeader('Link', '</llms.txt>; rel="llms-txt"');
  res.setHeader('X-Llms-Txt', '/llms.txt');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(200).send(markdown);
};

export default handler;
