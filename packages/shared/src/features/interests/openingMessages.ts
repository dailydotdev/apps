import type { UserInterest } from '../../graphql/interests';
import { UserInterestCadence } from '../../graphql/interests';
import type { AgentFeedItem } from './hooks/useAgentFeed';
import type { AgentBlock, AgentMessage } from './chat';

const cadenceCopy: Record<UserInterestCadence, string> = {
  [UserInterestCadence.Hourly]: 'every hour',
  [UserInterestCadence.Daily]: 'daily',
  [UserInterestCadence.Weekly]: 'weekly',
};

// Three in the reply, the rest behind the feed link: the opening turn is a
// greeting, not the whole feed.
const shownPicks = 3;

/**
 * The conversation an agent already has when you first open it.
 *
 * The prompt you typed to spawn it is the agent's name, and it was a sentence
 * addressed to the agent before it was a name — so it opens the transcript as
 * what it was, with the agent's answer under it. Without this the page you land
 * on after creating an agent is blank, and the only way to get a word out of it
 * is to type the same thing a second time.
 *
 * Every part of this is read back off the interest and its findings. There is
 * no message history in the API yet; when there is, it replaces this.
 */
export const openingMessages = (
  interest?: UserInterest,
  items: AgentFeedItem[] = [],
): AgentMessage[] => {
  if (!interest) {
    return [];
  }

  const cadence = cadenceCopy[interest.cadence] ?? 'daily';
  const opening = interest.lastRunAt
    ? `<p>Spawned. I hunt ${cadence} and only ping you when something clears your bar.</p>`
    : `<p>Spawned. I hunt ${cadence} and only ping you when something clears your bar. My first run has not happened yet — I will report back here when it has.</p>`;
  const blocks: AgentBlock[] = [{ type: 'text', html: opening }];

  if (interest.lastRunSummary) {
    blocks.push({
      type: 'text',
      html: `<p>Last run — ${interest.lastRunSummary}.</p>`,
    });
  }

  if (items.length) {
    blocks.push({
      type: 'picks',
      caption:
        items.length > shownPicks
          ? `The ${shownPicks} strongest of what I have found so far:`
          : 'What I have found so far:',
      posts: items.slice(0, shownPicks).map(({ post }) => post),
    });
  }

  if (items.length > shownPicks) {
    blocks.push({
      type: 'feedLink',
      label: `Open all ${items.length} findings as a feed`,
      posts: items.map(({ post }) => post),
    });
  }

  return [
    {
      id: `${interest.id}-opening-prompt`,
      role: 'user',
      at: interest.createdAt,
      text: interest.query,
    },
    {
      id: `${interest.id}-opening-reply`,
      role: 'agent',
      at: interest.lastRunAt ?? interest.createdAt,
      blocks,
    },
  ];
};
