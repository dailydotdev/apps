import type { UserInterest } from '../../graphql/interests';
import { UserInterestCadence } from '../../graphql/interests';
import type { AgentFeedItem } from './hooks/useAgentFeed';
import type { AgentBlock, AgentMessage } from './chat';

const cadenceCopy: Record<UserInterestCadence, string> = {
  [UserInterestCadence.Hourly]: 'every hour',
  [UserInterestCadence.Daily]: 'daily',
  [UserInterestCadence.Weekly]: 'weekly',
};

const shownPicks = 3;

// There is no message history in the API yet, so the first turn is rebuilt from
// the interest and its findings. Replace this when there is.
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
    : `<p>Spawned. I hunt ${cadence} and only ping you when something clears your bar. My first run has not happened yet. I will report back here when it has.</p>`;
  const blocks: AgentBlock[] = [{ type: 'text', html: opening }];

  if (interest.lastRunSummary) {
    blocks.push({
      type: 'text',
      html: `<p>Last run: ${interest.lastRunSummary}.</p>`,
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
