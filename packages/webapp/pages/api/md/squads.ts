import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  Squad,
  SourceCategory,
} from '@dailydotdev/shared/src/graphql/sources';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { SOURCES_QUERY } from '@dailydotdev/shared/src/graphql/squads';
import { SOURCE_CATEGORIES_QUERY } from '@dailydotdev/shared/src/graphql/sources';

interface SquadsData {
  sources: Connection<Squad>;
}

interface CategoriesData {
  categories: Connection<SourceCategory>;
}

/**
 * Escapes special markdown characters in user-generated content
 * to prevent potential XSS when AI agents parse the markdown.
 */
const escapeMarkdown = (text: string): string => {
  return text.replace(/[\\`*_{}[\]()#+\-.!|]/g, '\\$&');
};

const formatSquad = (squad: Squad): string => {
  const name = escapeMarkdown(squad.name);
  const description = squad.description
    ? `: ${escapeMarkdown(squad.description)}`
    : '';
  const members = squad.membersCount
    ? ` (${squad.membersCount.toLocaleString()} members)`
    : '';
  return `- [${name}](/squads/${squad.handle})${members}${description}`;
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
    // Fetch featured squads
    const featuredData = await gqlClient.request<SquadsData>(SOURCES_QUERY, {
      filterOpenSquads: true,
      featured: true,
      first: 20,
      sortByMembersCount: true,
    });

    // Fetch categories
    const categoriesData = await gqlClient.request<CategoriesData>(
      SOURCE_CATEGORIES_QUERY,
      { first: 20 },
    );

    const categories = categoriesData.categories.edges.map((edge) => edge.node);
    const featuredSquads = featuredData.sources.edges.map((edge) => edge.node);

    // Fetch squads for each category
    const categorySquadsPromises = categories.map(async (category) => {
      const data = await gqlClient.request<SquadsData>(SOURCES_QUERY, {
        filterOpenSquads: true,
        categoryId: category.id,
        first: 10,
        sortByMembersCount: true,
      });
      return {
        category,
        squads: data.sources.edges.map((edge) => edge.node),
      };
    });

    const categorySquads = await Promise.all(categorySquadsPromises);

    const categorySections = categorySquads
      .filter(({ squads }) => squads.length > 0)
      .map(
        ({ category, squads }) =>
          `### ${escapeMarkdown(category.title)}\n\n${squads
            .map(formatSquad)
            .join('\n')}`,
      )
      .join('\n\n');

    const markdown = `# Squads Directory

> Developer communities on daily.dev

Squads are specialized developer communities focused on specific technologies and topics. Join Squads to connect with like-minded developers, share knowledge, and engage in focused discussions.

## Featured Squads

${featuredSquads.map(formatSquad).join('\n')}

## Squads by Category

${categorySections}

---

[Discover all Squads on daily.dev](/squads/discover)
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
    res.status(200).send(markdown);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error generating squads markdown:', error);
    res.status(500).send('Internal server error');
  }
};

export default handler;
