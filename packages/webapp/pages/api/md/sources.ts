import type { NextApiRequest, NextApiResponse } from 'next';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCE_DIRECTORY_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';

interface SourceDirectoryData {
  trendingSources: Source[];
  popularSources: Source[];
  mostRecentSources: Source[];
  topVideoSources: Source[];
}

/**
 * Escapes special markdown characters in user-generated content
 * to prevent potential XSS when AI agents parse the markdown.
 */
const escapeMarkdown = (text: string): string => {
  return text.replace(/[\\`*_{}[\]()#+\-.!|]/g, '\\$&');
};

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

    const markdown = `# Sources Directory

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
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
    res.status(200).send(markdown);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error generating sources markdown:', error);
    res.status(500).send('Internal server error');
  }
};

export default handler;
