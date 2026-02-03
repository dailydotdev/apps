import type { NextApiRequest, NextApiResponse } from 'next';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { TAG_DIRECTORY_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { escapeMarkdown } from '@dailydotdev/shared/src/lib/strings';

interface TagDirectoryData {
  tags: Keyword[];
  trendingTags: Array<{ value: string }>;
  popularTags: Array<{ value: string }>;
}

const formatTag = (tag: { value: string }): string => {
  const escaped = escapeMarkdown(tag.value);
  return `- [${escaped}](/tags/${tag.value})`;
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
    const data = await gqlClient.request<TagDirectoryData>(TAG_DIRECTORY_QUERY);

    // Group tags alphabetically
    const tagsByLetter: Record<string, Keyword[]> = {};
    data.tags.forEach((tag) => {
      const rawLetter = tag.value[0].toLowerCase();
      const letter = /^[a-zA-Z]$/.test(rawLetter)
        ? rawLetter.toUpperCase()
        : '#';
      if (!tagsByLetter[letter]) {
        tagsByLetter[letter] = [];
      }
      tagsByLetter[letter].push(tag);
    });

    // Sort letters and tags within each letter
    const sortedLetters = Object.keys(tagsByLetter).sort((a, b) => {
      if (a === '#') {
        return 1;
      }
      if (b === '#') {
        return -1;
      }
      return a.localeCompare(b);
    });

    const allTagsMarkdown = sortedLetters
      .map((letter) => {
        const tags = tagsByLetter[letter].sort((a, b) =>
          a.value.localeCompare(b.value),
        );
        return `### ${letter}\n\n${tags
          .map((t) => `- [${escapeMarkdown(t.value)}](/tags/${t.value})`)
          .join('\n')}`;
      })
      .join('\n\n');

    const markdown = `> ## Documentation Index
> Fetch the complete documentation index at: https://app.daily.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# Tags Directory

> Discover topics that matter to developers on daily.dev

Browse trending, popular, and all available tags to find content that matches your interests.

## Trending Tags

${data.trendingTags.map(formatTag).join('\n')}

## Popular Tags

${data.popularTags.map(formatTag).join('\n')}

## All Tags

${allTagsMarkdown}

---

[View all tags on daily.dev](/tags)
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
    console.error('Error generating tags markdown:', error);
    res
      .status(500)
      .send(
        'Unable to generate markdown. Please try again later or visit https://app.daily.dev/tags',
      );
  }
};

export default handler;
