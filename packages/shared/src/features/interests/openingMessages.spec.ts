import type { UserInterest } from '../../graphql/interests';
import {
  UserInterestCadence,
  UserInterestStatus,
} from '../../graphql/interests';
import type { Post } from '../../graphql/posts';
import type { AgentFeedItem } from './hooks/useAgentFeed';
import { openingMessages } from './openingMessages';

const interest = (over: Partial<UserInterest> = {}): UserInterest =>
  ({
    id: 'i1',
    query: 'Cool zig projects — keep me on top of what actually ships',
    status: UserInterestStatus.Active,
    cadence: UserInterestCadence.Daily,
    createdAt: '2026-01-01T09:00:00.000Z',
    lastRunAt: '2026-02-01T09:00:00.000Z',
    lastRunSummary: 'scanned 128 posts, kept 6',
    ...over,
  } as UserInterest);

const item = (id: string): AgentFeedItem => ({
  id,
  post: { id: `p-${id}`, title: `Post ${id}` } as Post,
  score: 0.9,
  rationale: '',
  createdAt: '2026-02-01T09:00:00.000Z',
});

const html = (messages: ReturnType<typeof openingMessages>) =>
  messages
    .flatMap(({ blocks }) => blocks ?? [])
    .map((block) => (block.type === 'text' ? block.html : ''))
    .join(' ');

describe('openingMessages', () => {
  // The page used to land on nothing at all, so the prompt that spawned the
  // agent had to be typed a second time to get a word out of it.
  it('opens with the prompt that spawned it, and an answer to it', () => {
    const messages = openingMessages(interest());

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      role: 'user',
      text: 'Cool zig projects — keep me on top of what actually ships',
      at: '2026-01-01T09:00:00.000Z',
    });
    expect(messages[1].role).toBe('agent');
    expect(messages[1].isPending).toBeFalsy();
  });

  it('has nothing to say without an agent to say it about', () => {
    expect(openingMessages(undefined)).toEqual([]);
  });

  it('states the cadence it actually runs on', () => {
    expect(html(openingMessages(interest()))).toContain('hunt daily');
    expect(
      html(openingMessages(interest({ cadence: UserInterestCadence.Hourly }))),
    ).toContain('hunt every hour');
    expect(
      html(openingMessages(interest({ cadence: UserInterestCadence.Weekly }))),
    ).toContain('hunt weekly');
  });

  it('says so plainly when it has not run yet, rather than implying it has', () => {
    const messages = openingMessages(
      interest({ lastRunAt: null, lastRunSummary: null }),
    );

    expect(html(messages)).toContain('first run has not happened yet');
    expect(messages[1].at).toBe('2026-01-01T09:00:00.000Z');
  });

  it('quotes the last run in the agent’s own words', () => {
    expect(html(openingMessages(interest()))).toContain(
      'scanned 128 posts, kept 6',
    );
  });

  it('leaves the run line out when there is no run to report', () => {
    expect(
      html(openingMessages(interest({ lastRunSummary: null }))),
    ).not.toContain('Last run');
  });

  it('stamps the reply with the run it is reporting', () => {
    expect(openingMessages(interest())[1].at).toBe('2026-02-01T09:00:00.000Z');
  });

  describe('with findings', () => {
    it('shows them, and nothing more, when there are only a few', () => {
      const [, reply] = openingMessages(interest(), [item('a'), item('b')]);
      const blocks = reply.blocks ?? [];
      const picks = blocks.find((block) => block.type === 'picks');

      expect(picks).toMatchObject({ caption: 'What I have found so far:' });
      expect(picks?.type === 'picks' && picks.posts).toHaveLength(2);
      expect(blocks.some((block) => block.type === 'feedLink')).toBe(false);
    });

    // The opening turn is a greeting, not the whole feed.
    it('shows three and puts the rest behind a feed link', () => {
      const items = ['a', 'b', 'c', 'd', 'e'].map(item);
      const [, reply] = openingMessages(interest(), items);
      const blocks = reply.blocks ?? [];
      const picks = blocks.find((block) => block.type === 'picks');
      const link = blocks.find((block) => block.type === 'feedLink');

      expect(picks?.type === 'picks' && picks.posts).toHaveLength(3);
      expect(link).toMatchObject({ label: 'Open all 5 findings as a feed' });
      expect(link?.type === 'feedLink' && link.posts).toHaveLength(5);
    });

    it('has no picks block at all when it has found nothing', () => {
      const [, reply] = openingMessages(interest(), []);

      expect((reply.blocks ?? []).every((block) => block.type === 'text')).toBe(
        true,
      );
    });
  });
});
