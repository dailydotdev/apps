import { QueryClient } from '@tanstack/react-query';
import { SharedFeedPage } from '../../components/utilities/common';
import { OtherFeedPage } from '../../lib/query';
import {
  canPatchyOffer,
  countPatchyTagOpen,
  createPatchyOfferMemory,
  getPatchyQuickReads,
  parsePatchyOfferMemory,
  PATCHY_OFFERS_PER_DAY,
  withPatchyOfferAnswer,
  withPatchyOfferShown,
} from './patchyAssistant';

const today = new Date(2026, 10, 19, 10);
const tomorrow = new Date(2026, 10, 20, 9);

describe('patchy offer policy', () => {
  it('allows each kind once a day and at most three a day', () => {
    let memory = createPatchyOfferMemory(today);
    expect(canPatchyOffer(memory, 'long_read')).toBe(true);
    memory = withPatchyOfferShown(memory, 'long_read');
    expect(canPatchyOffer(memory, 'long_read')).toBe(false);
    memory = withPatchyOfferShown(memory, 'finished');
    memory = withPatchyOfferShown(memory, 'follow_tag', 'rust');
    expect(memory.shownToday).toBe(PATCHY_OFFERS_PER_DAY);
    expect(canPatchyOffer(memory, 'streak_risk')).toBe(false);
  });

  it('stops a kind after two "not now"s or one "never"', () => {
    let memory = createPatchyOfferMemory(today);
    memory = withPatchyOfferAnswer(memory, 'finished', 'dismiss');
    expect(canPatchyOffer(memory, 'finished')).toBe(true);
    memory = withPatchyOfferAnswer(memory, 'finished', 'dismiss');
    expect(canPatchyOffer(memory, 'finished')).toBe(false);
    memory = withPatchyOfferAnswer(memory, 'long_read', 'never');
    expect(canPatchyOffer(memory, 'long_read')).toBe(false);
    // Ignoring or accepting changes nothing.
    memory = withPatchyOfferAnswer(memory, 'welcome_back', 'ignore');
    memory = withPatchyOfferAnswer(memory, 'welcome_back', 'accept');
    expect(canPatchyOffer(memory, 'welcome_back')).toBe(true);
  });

  it('resets the day but keeps what you told him', () => {
    let memory = createPatchyOfferMemory(today);
    memory = withPatchyOfferShown(memory, 'follow_tag', 'rust');
    memory = withPatchyOfferAnswer(memory, 'follow_tag', 'dismiss');
    memory = withPatchyOfferAnswer(memory, 'long_read', 'never');
    const next = parsePatchyOfferMemory(JSON.stringify(memory), tomorrow);
    expect(next).toMatchObject({
      shownToday: 0,
      offeredToday: [],
      tagOpens: {},
      dismissed: { follow_tag: 1 },
      never: ['long_read'],
      suggestedTags: ['rust'],
    });
  });

  it('survives broken storage', () => {
    expect(parsePatchyOfferMemory('{oops', today)).toEqual(
      createPatchyOfferMemory(today),
    );
    expect(
      parsePatchyOfferMemory(
        JSON.stringify({ never: ['dance', 'long_read'], dismissed: { x: 3 } }),
        today,
      ),
    ).toMatchObject({ never: ['long_read'], dismissed: {} });
  });
});

describe('countPatchyTagOpen', () => {
  const lists = { followed: ['webdev'], blocked: ['php'] };

  it('suggests a tag on its third open of the day, once', () => {
    let memory = createPatchyOfferMemory(today);
    let result = countPatchyTagOpen(memory, 'p1', ['Rust', 'cli'], lists);
    result = countPatchyTagOpen(result.memory, 'p2', ['rust'], lists);
    expect(result.tag).toBeNull();
    result = countPatchyTagOpen(result.memory, 'p3', ['rust'], lists);
    expect(result.tag).toBe('rust');
    memory = withPatchyOfferShown(result.memory, 'follow_tag', 'rust');
    // A fourth open, or the same tag another day, never suggests it again.
    expect(countPatchyTagOpen(memory, 'p4', ['rust'], lists).tag).toBeNull();
  });

  it('counts reopening the same post once', () => {
    let memory = createPatchyOfferMemory(today);
    for (let index = 0; index < 3; index += 1) {
      memory = countPatchyTagOpen(memory, 'p1', ['rust'], lists).memory;
    }
    expect(memory.tagOpens.rust).toBe(1);
    memory = countPatchyTagOpen(memory, 'p2', ['rust'], lists).memory;
    expect(countPatchyTagOpen(memory, 'p3', ['rust'], lists).tag).toBe('rust');
  });

  it('skips tags you follow or block', () => {
    let memory = createPatchyOfferMemory(today);
    for (let index = 0; index < 2; index += 1) {
      memory = countPatchyTagOpen(
        memory,
        `p${index}`,
        ['webdev', 'php'],
        lists,
      ).memory;
    }
    expect(
      countPatchyTagOpen(memory, 'p9', ['WebDev', 'php'], lists).tag,
    ).toBeNull();
  });
});

describe('getPatchyQuickReads', () => {
  const post = (
    id: string,
    readTime: number,
    numUpvotes = 0,
    read = false,
  ) => ({
    id,
    title: `Post ${id}`,
    commentsPermalink: `https://app.daily.dev/posts/${id}`,
    image: '',
    readTime,
    numUpvotes,
    read,
  });

  it('picks short unread posts from cached feeds, best first', () => {
    const client = new QueryClient();
    client.setQueryData([SharedFeedPage.MyFeed, 'user'], {
      pages: [
        {
          page: {
            edges: [
              { node: post('a', 3, 10) },
              { node: post('b', 12, 99) },
              { node: post('c', 2, 50) },
              { node: post('d', 4, 70, true) },
            ],
          },
        },
      ],
    });
    client.setQueryData([OtherFeedPage.Bookmarks, 'user'], {
      pages: [{ page: { edges: [{ node: post('c', 2, 50) }] } }],
    });
    // Not a feed he picks from, and a post without `read` isn't known unread.
    client.setQueryData([SharedFeedPage.Search, 'user'], {
      pages: [{ page: { edges: [{ node: post('e', 1, 500) }] } }],
    });
    client.setQueryData([SharedFeedPage.Popular, 'user'], {
      pages: [
        {
          page: {
            edges: [{ node: { ...post('f', 1, 400), read: undefined } }],
          },
        },
      ],
    });

    expect(getPatchyQuickReads(client).map(({ id }) => id)).toEqual(['c', 'a']);
    expect(
      getPatchyQuickReads(client, { excludeId: 'c' }).map(({ id }) => id),
    ).toEqual(['a']);
  });
});
