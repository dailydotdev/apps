import type { Post } from '../../graphql/posts';
import {
  activityAttachment,
  agentAttachments,
  feedAttachment,
  mentionCandidates,
  postAttachment,
  quoteAttachment,
  targetAttachment,
} from './attachments';
import type { AgentMessage } from './chat';
import { promptWithContext } from './chat';

const makePost = (id: string, title = `Post ${id}`): Post =>
  ({
    id,
    title,
    source: { name: 'GitHub' },
  } as Post);

describe('postAttachment', () => {
  it('carries the title and the source', () => {
    expect(postAttachment(makePost('a', 'Zig 0.15'))).toEqual({
      id: 'post:a',
      kind: 'post',
      label: 'Zig 0.15',
      detail: 'GitHub',
    });
  });

  it('labels an untitled post rather than rendering an empty chip', () => {
    expect(postAttachment({ id: 'a' } as Post).label).toBe('Untitled post');
  });

  // The id is what dedupes a post open in the panel against the same post in
  // the transcript, so it has to be the post's, not the label's.
  it('keys on the post id, not the title', () => {
    const first = postAttachment(makePost('a', 'One title'));
    const second = postAttachment(makePost('a', 'A different title'));

    expect(first.id).toBe(second.id);
  });
});

describe('quoteAttachment', () => {
  it('keeps a short passage whole', () => {
    expect(quoteAttachment('comptime is not a macro system').label).toBe(
      'comptime is not a macro system',
    );
  });

  it('cuts a long passage to something a chip can hold', () => {
    const { label } = quoteAttachment('x'.repeat(400));

    expect(label).toHaveLength(141);
    expect(label.endsWith('…')).toBe(true);
  });

  it('does not leave a dangling space before the ellipsis', () => {
    const { label } = quoteAttachment(`${'x'.repeat(139)} word`);

    expect(label).not.toMatch(/ …$/);
  });
});

describe('feedAttachment and activityAttachment', () => {
  it('counts the posts in a feed', () => {
    expect(feedAttachment('Findings', [makePost('a'), makePost('b')])).toEqual({
      id: 'feed:Findings',
      kind: 'feed',
      label: 'Findings',
      detail: '2 posts',
    });
  });

  it('points at one activity entry rather than the whole log', () => {
    const item = {
      id: 'act-1',
      at: '2026-01-01T00:00:00.000Z',
      kind: 'run' as const,
      text: 'Scanned 128 posts',
    };

    expect(activityAttachment(item)).toEqual({
      id: 'activity:act-1',
      kind: 'activity',
      label: 'Scanned 128 posts',
      detail: 'From the activity log',
    });
  });
});

describe('targetAttachment', () => {
  it('maps a post tab to the post', () => {
    expect(targetAttachment({ type: 'post', post: makePost('a') })?.id).toBe(
      'post:a',
    );
  });

  it('maps a feed tab to the feed', () => {
    expect(
      targetAttachment({ type: 'feed', label: 'Findings', posts: [] })?.id,
    ).toBe('feed:Findings');
  });

  it("maps the activity tab onto the agent's own run history", () => {
    expect(targetAttachment({ type: 'activity' })?.id).toBe('agent:activity');
  });

  it('has nothing to offer for the debug tab', () => {
    expect(targetAttachment({ type: 'debug' })).toBeUndefined();
  });
});

describe('mentionCandidates', () => {
  const withPosts = (posts: Post[]): AgentMessage[] => [
    { id: 'm1', role: 'agent', at: '', blocks: [{ type: 'posts', posts }] },
  ];

  it('offers what is open, then what it found, then the agent itself', () => {
    const candidates = mentionCandidates({
      openContent: [{ type: 'post', post: makePost('open') }],
      messages: withPosts([makePost('found')]),
    });

    expect(candidates.map(({ id }) => id)).toEqual([
      'post:open',
      'post:found',
      ...agentAttachments.map(({ id }) => id),
    ]);
  });

  it('lists a post open in the panel once, not twice', () => {
    const post = makePost('same');
    const candidates = mentionCandidates({
      openContent: [{ type: 'post', post }],
      messages: withPosts([post]),
    });

    expect(candidates.filter(({ id }) => id === 'post:same')).toHaveLength(1);
  });

  it('reads the newest turn first, since that is the likeliest reference', () => {
    const candidates = mentionCandidates({
      openContent: [],
      messages: [
        {
          id: 'm1',
          role: 'agent',
          at: '',
          blocks: [{ type: 'posts', posts: [makePost('older')] }],
        },
        {
          id: 'm2',
          role: 'agent',
          at: '',
          blocks: [{ type: 'picks', posts: [makePost('newer')] }],
        },
      ],
    });

    expect(candidates.map(({ id }) => id).slice(0, 2)).toEqual([
      'post:newer',
      'post:older',
    ]);
  });

  it('survives turns that carry no blocks at all', () => {
    expect(() =>
      mentionCandidates({
        openContent: [],
        messages: [{ id: 'm1', role: 'user', at: '', text: 'hello' }],
      }),
    ).not.toThrow();
  });

  it('always offers the agent itself, even with nothing on screen', () => {
    expect(
      mentionCandidates({ openContent: [], messages: [] }).map(({ id }) => id),
    ).toEqual(agentAttachments.map(({ id }) => id));
  });
});

describe('promptWithContext', () => {
  it('sends the text untouched when nothing is attached', () => {
    expect(promptWithContext('raise the bar', [])).toBe('raise the bar');
  });

  // The chips only exist in the transcript; the API sees one string, so what
  // the prompt pointed at has to be spelled out in it.
  it('names every attachment so the backend knows what was meant', () => {
    const prompt = promptWithContext('why this one', [
      postAttachment(makePost('a', 'Zig 0.15')),
      quoteAttachment('self-hosted backend'),
    ]);

    expect(prompt).toContain('why this one');
    expect(prompt).toContain('Zig 0.15');
    expect(prompt).toContain('self-hosted backend');
  });
});
