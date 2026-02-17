import type { NextApiRequest, NextApiResponse } from 'next';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCE_DIRECTORY_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { escapeMarkdown } from '@dailydotdev/shared/src/lib/strings';

interface SourceDirectoryData {
  trendingSources: Source[];
  popularSources: Source[];
  mostRecentSources: Source[];
  topVideoSources: Source[];
}

const formatSource = (source: Source): string => {
  const name = escapeMarkdown(source.name);
  const description = source.description
    ? `: ${escapeMarkdown(source.description)}`
    : '';
  return `- [${name}](/sources/${source.handle})${description}`;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const data = await gqlClient.request<SourceDirectoryData>(
      SOURCE_DIRECTORY_QUERY,
    );

    const markdown = `> ## Documentation Index
> Fetch the complete documentation index at: https://app.daily.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# Sources Directory

> 1,300+ curated content sources on daily.dev

Explore the top sources for developer content. Find trending blogs, publications, YouTube channels and more from our trusted developer network.

## Trending Sources

${data.trendingSources.map(formatSource).join('\n')}

## Popular Sources

${data.popularSources.map(formatSource).join('\n')}

## Recently Added Sources

${data.mostRecentSources.map(formatSource).join('\n')}

## Top Video Sources

${data.topVideoSources.map(formatSource).join('\n')}

---

[View all sources on daily.dev](/sources)
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800',
    );
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.status(200).send(markdown);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error generating sources markdown:', error);
    res
      .status(500)
      .send(
        'Unable to generate markdown. Please try again later or visit https://app.daily.dev/sources',
      );
  }
};

export default handler;
