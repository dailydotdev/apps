import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getDealBySlug,
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import { getDealComments } from '@dailydotdev/shared/src/features/deals/mockCommunity';
import {
  DEAL_CAVEATS_HEADING,
  formatDealDate,
  formatFullNumber,
  getClaimEvidence,
  getDealAnsweredQuestions,
  getDealAnswerText,
  getDealCoverMedia,
  getDealDirectAnswer,
  getDealFacts,
  getDealMediaCaption,
  getDealPath,
  getDealRedemptionNote,
  getRankedDealCaveats,
  getSimilarDeals,
  shouldNoindexDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { escapeMarkdown } from '@dailydotdev/shared/src/lib/strings';
import {
  getAppOrigin,
  getLlmsTxtUrl,
  toAbsoluteUrl,
} from '../../../../lib/seo';
import { getDealDescription, getDealTitle } from '../../../../lib/dealsSeo';

const appOrigin = getAppOrigin();
const llmsTxtUrl = getLlmsTxtUrl();

const sendNotFound = (res: NextApiResponse, slug: string): void => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Vary', 'Accept');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res
    .status(404)
    .send(
      `# Not found\n\nNo live deal is available at ${appOrigin}/deals/${slug}.\n`,
    );
};

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const slug = req.query.slug as string;
  const deal = slug ? getDealBySlug(slug) : undefined;

  if (!deal || shouldNoindexDeal(deal, MOCK_NOW_MS)) {
    sendNotFound(res, slug);
    return;
  }

  const comments = getDealComments(deal.id);
  const similarDeals = getSimilarDeals(deal, mockDeals, 4);
  const cover = getDealCoverMedia(deal);
  const coverCaption = cover ? getDealMediaCaption(cover) : '';
  const coverMarkdown = cover
    ? `![${escapeMarkdown(cover.alt)}](${toAbsoluteUrl(cover.imageUrl)})\n\n${
        coverCaption ? `_${escapeMarkdown(coverCaption)}_\n\n` : ''
      }`
    : '';

  const rankedCaveats = getRankedDealCaveats(deal);
  const caveatsMarkdown = rankedCaveats.length
    ? `## ${DEAL_CAVEATS_HEADING}\n\n${rankedCaveats
        .map(({ label, detail }) => `- **${label}.** ${escapeMarkdown(detail)}`)
        .join('\n')}\n\n`
    : '';

  const markdown = `---
title: ${getDealTitle(deal)}
url: ${appOrigin}${getDealPath(deal)}
description: ${getDealDescription(deal)}
dateModified: ${deal.updatedAt}
---

> ## Documentation Index
> Fetch the complete documentation index at: ${llmsTxtUrl}
> Use this file to discover all available pages before exploring further.

# ${escapeMarkdown(deal.title)}

${coverMarkdown}${getDealDirectAnswer(deal, MOCK_NOW_MS)}

## What you get

${escapeMarkdown(deal.description)}

- Value: ${escapeMarkdown(deal.value.label)}
- Claimed by ${formatFullNumber(deal.community.claims)} developers
- ${getClaimEvidence(deal)}
- Last verified on ${formatDealDate(deal.community.lastVerifiedAt)}
- Merchant: [${escapeMarkdown(deal.brand.name)}](https://${deal.brand.domain})

## How to redeem

${escapeMarkdown(getDealRedemptionNote(deal))}

${caveatsMarkdown}## Terms

${getDealFacts(deal)
  .map(({ label, value }) => `- ${label}: ${value}`)
  .join('\n')}

${escapeMarkdown(deal.terms)}

## Questions about this deal

${getDealAnsweredQuestions(deal, MOCK_NOW_MS)
  .map((entry) => `### ${entry.question}\n\n${getDealAnswerText(entry)}`)
  .join('\n\n')}

## Community reports

${comments
  .map(
    (comment) =>
      `> ${escapeMarkdown(comment.body)}\n>\n> ${comment.author} (${
        comment.handle
      }) on daily.dev, ${formatDealDate(comment.createdAt)}`,
  )
  .join('\n\n')}

## Similar deals

${similarDeals
  .map(
    (similar) =>
      `- [${escapeMarkdown(similar.title)}](${getDealPath(similar)})`,
  )
  .join('\n')}

---

[View this deal on daily.dev](${getDealPath(deal)})
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
