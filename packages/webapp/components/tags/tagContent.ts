import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';

export interface TagFaqItem {
  question: string;
  answer: string;
}

interface TagFaqInput {
  title: string;
  topContributors?: UserShortProfile[];
  recommendedTags?: TagsData['tags'];
  roadmap?: string;
}

const listToSentence = (items: string[]): string => {
  if (items.length === 1) {
    return items[0];
  }
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

/**
 * Builds a data-backed FAQ for a tag. Every answer is grounded in real data we
 * already have (description, contributors, related tags, roadmap) — nothing is
 * fabricated, and entries are only included when there's a genuine answer.
 *
 * Used both for the visible FAQ section and the FAQPage JSON-LD, so the two
 * never drift apart. This is the page's main Answer-Engine (AEO) surface:
 * concise, quotable Q&A that LLMs and AI Overviews can lift directly.
 */
export function getTagFaqItems({
  title,
  topContributors = [],
  recommendedTags = [],
  roadmap,
}: TagFaqInput): TagFaqItem[] {
  const items: TagFaqItem[] = [];

  items.push({
    question: `How do I keep up with ${title}?`,
    answer: `Follow ${title} on daily.dev to get the most upvoted posts, videos, and discussions about it in a single feed — curated by millions of developers and updated every day.`,
  });

  const contributorNames = topContributors
    .map((user) => user.name)
    .filter((name): name is string => !!name)
    .slice(0, 3);
  if (contributorNames.length > 0) {
    items.push({
      question: `Who are the top ${title} contributors?`,
      answer: `${listToSentence(contributorNames)} ${
        contributorNames.length > 1 ? 'are' : 'is'
      } among the most active developers writing about ${title} on daily.dev.`,
    });
  }

  const relatedNames = recommendedTags
    .map((tag) => tag.name)
    .filter((name): name is string => !!name)
    .slice(0, 4);
  if (relatedNames.length >= 2) {
    items.push({
      question: `What topics are related to ${title}?`,
      answer: `Popular topics developers follow alongside ${title} include ${listToSentence(
        relatedNames,
      )}.`,
    });
  }

  if (roadmap) {
    items.push({
      question: `How can I learn ${title}?`,
      answer: `Explore a structured ${title} learning roadmap to go from the fundamentals to advanced topics, then follow ${title} on daily.dev to keep building with fresh, community-curated content.`,
    });
  }

  return items;
}
