import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { Post } from '../../graphql/posts';
import type { InterestTurn } from '../../graphql/interests';
import type { AgentMessage } from './chat';
import type { AgentFeedItem } from './hooks/useAgentFeed';
import * as command from './hooks/useSendInterestCommand';
import * as updateHook from './hooks/useUpdateInterest';
import * as queries from './queries';
import { AgentProvider, contentTargetId, useAgent } from './AgentContext';

const post = (id: string): Post => ({ id, title: `Post ${id}` } as Post);

const attachment = (id: string) => ({
  id,
  kind: 'post' as const,
  label: `Label ${id}`,
});

type Agent = ReturnType<typeof useAgent>;

const mountAgent = () => {
  const seen: { current: Agent } = { current: undefined as never };

  const Probe = () => {
    seen.current = useAgent();

    return null;
  };

  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[]}>
        <Probe />
      </AgentProvider>
    </TestBootProvider>,
  );

  return seen;
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('contentTargetId', () => {
  it('keys posts and feeds by what they hold, and panes by name', () => {
    expect(contentTargetId({ type: 'post', postId: 'p1' })).toBe('post:p1');
    expect(
      contentTargetId({ type: 'feed', label: 'Findings', posts: [] }),
    ).toBe('feed:Findings');
    expect(contentTargetId({ type: 'activity' })).toBe('activity');
  });
});

describe('attachments', () => {
  it('adds what a button points at', () => {
    const agent = mountAgent();

    act(() => agent.current.attachContext(attachment('post:a')));

    expect(agent.current.attachments).toHaveLength(1);
  });

  it('adds the same thing twice as one chip, not two', () => {
    const agent = mountAgent();

    act(() => agent.current.attachContext(attachment('post:a')));
    act(() => agent.current.attachContext(attachment('post:a')));

    expect(agent.current.attachments).toHaveLength(1);
  });

  it('removes one without disturbing the others', () => {
    const agent = mountAgent();

    act(() => agent.current.attachContext(attachment('post:a')));
    act(() => agent.current.attachContext(attachment('post:b')));
    act(() => agent.current.detachContext('post:a'));

    expect(agent.current.attachments.map(({ id }) => id)).toEqual(['post:b']);
  });

  it('lets the references leave with the prompt they were attached to', () => {
    const agent = mountAgent();

    act(() => agent.current.attachContext(attachment('post:a')));
    act(() =>
      agent.current.runCommand({
        text: 'why this one',
        attachments: agent.current.attachments,
      }),
    );

    expect(agent.current.attachments).toHaveLength(0);
  });
});

describe('an opening transcript that arrives after mount', () => {
  const mountWithLateOpening = () => {
    const seen: { current: Agent } = { current: undefined as never };

    const Probe = () => {
      seen.current = useAgent();

      return null;
    };

    const Host = ({ messages }: { messages: AgentMessage[] }) => (
      <TestBootProvider client={new QueryClient()}>
        <AgentProvider id="a1" isDemo initialMessages={messages}>
          <Probe />
        </AgentProvider>
      </TestBootProvider>
    );

    const opening: AgentMessage[] = [
      { id: 'o1', role: 'user', at: '', text: 'Cool zig projects' },
      { id: 'o2', role: 'agent', at: '', blocks: [] },
    ];
    const view = render(<Host messages={[]} />);

    return {
      seen,
      opening,
      rerender: (messages: AgentMessage[]) =>
        view.rerender(<Host messages={messages} />),
    };
  };

  it('is adopted, rather than leaving the page blank for good', () => {
    const { seen, opening, rerender } = mountWithLateOpening();

    expect(seen.current.messages).toHaveLength(0);

    act(() => rerender(opening));

    expect(seen.current.messages.map(({ id }) => id)).toEqual(['o1', 'o2']);
  });

  it('never overwrites a transcript that already has turns in it', () => {
    const { seen, opening, rerender } = mountWithLateOpening();

    act(() => seen.current.runCommand({ text: 'raise the bar' }));
    const before = seen.current.messages.length;

    act(() => rerender(opening));

    expect(seen.current.messages).toHaveLength(before);
    expect(seen.current.messages[0].text).toBe('raise the bar');
  });
});

describe('the draft', () => {
  it('carries text written from elsewhere on the screen', () => {
    const agent = mountAgent();

    act(() => agent.current.writeDraft('I marked that one down because '));

    expect(agent.current.draft).toBe('I marked that one down because ');
  });

  it('can be cleared and written again', () => {
    const agent = mountAgent();

    act(() => agent.current.writeDraft('first'));
    act(() => agent.current.clearDraft());

    expect(agent.current.draft).toBeUndefined();

    act(() => agent.current.writeDraft('first'));

    expect(agent.current.draft).toBe('first');
  });
});

describe('content tabs', () => {
  it('opens a tab and focuses it', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));

    expect(agent.current.openContent).toHaveLength(1);
    expect(agent.current.activeContentId).toBe('activity');
  });

  it('re-opening something already open focuses it instead of duplicating it', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));
    act(() => agent.current.openContentTarget({ type: 'debug' }));
    act(() => agent.current.openContentTarget({ type: 'activity' }));

    expect(agent.current.openContent).toHaveLength(2);
    expect(agent.current.activeContentId).toBe('activity');
  });

  it('moves to the tab that slid into the closed one’s place', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));
    act(() => agent.current.openContentTarget({ type: 'debug' }));
    act(() =>
      agent.current.openContentTarget({
        type: 'post',
        postId: 'p1',
        post: post('p1'),
      }),
    );
    act(() => agent.current.focusContent('debug'));
    act(() => agent.current.closeContent('debug'));

    expect(agent.current.activeContentId).toBe('post:p1');
  });

  it('falls back to the new last tab when the rightmost one closes', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));
    act(() => agent.current.openContentTarget({ type: 'debug' }));
    act(() => agent.current.closeContent('debug'));

    expect(agent.current.activeContentId).toBe('activity');
  });

  it('leaves the focus alone when a tab you were not on closes', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));
    act(() => agent.current.openContentTarget({ type: 'debug' }));
    act(() => agent.current.closeContent('activity'));

    expect(agent.current.activeContentId).toBe('debug');
  });

  it('renames a slug-opened tab to the canonical id once the post loads', () => {
    const agent = mountAgent();

    act(() =>
      agent.current.openContentTarget({ type: 'post', postId: 'zig-slug' }),
    );
    act(() => agent.current.reconcilePostTarget('post:zig-slug', post('p1')));

    expect(agent.current.openContent).toEqual([
      { type: 'post', postId: 'p1', post: post('p1') },
    ]);
    expect(agent.current.activeContentId).toBe('post:p1');
  });

  it('merges a slug-opened tab into one that already holds the post', () => {
    const agent = mountAgent();

    act(() =>
      agent.current.openContentTarget({
        type: 'post',
        postId: 'p1',
        post: post('p1'),
      }),
    );
    act(() =>
      agent.current.openContentTarget({ type: 'post', postId: 'zig-slug' }),
    );
    act(() => agent.current.reconcilePostTarget('post:zig-slug', post('p1')));

    expect(agent.current.openContent).toHaveLength(1);
    expect(agent.current.activeContentId).toBe('post:p1');
  });

  it('ignores a request to close something that is not open', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));
    act(() => agent.current.closeContent('debug'));

    expect(agent.current.openContent).toHaveLength(1);
  });

  it('closes the lot', () => {
    const agent = mountAgent();

    act(() => agent.current.openContentTarget({ type: 'activity' }));
    act(() => agent.current.openContentTarget({ type: 'debug' }));
    act(() => agent.current.closeAllContent());

    expect(agent.current.openContent).toHaveLength(0);
    expect(agent.current.activeContent).toBeUndefined();
  });
});

const feedItem = (id: string): AgentFeedItem => ({
  id: `f-${id}`,
  post: post(id),
  score: 0.9,
  rationale: '',
  createdAt: '2026-01-01T00:00:00Z',
});

/**
 * The live transcript is the server's interest history plus a local echo for a
 * command still in flight. A reply only ever comes from a persisted run — an
 * earlier draft answered from a timer and reported findings the backend never
 * accepted.
 */
describe('the live path', () => {
  // The transcript arrives through a real query; fake timers starve its
  // scheduling, so this block waits on real ones instead.
  beforeEach(() => jest.useRealTimers());

  const mountLive = ({
    send = () => Promise.resolve(),
    turns = [] as InterestTurn[],
    findings = [] as AgentFeedItem[],
    posts = [] as { id: string; title: string; createdAt: string }[],
    runId = undefined as string | undefined,
    run = undefined as InterestTurn | undefined,
    interest = {} as Record<string, unknown>,
    onLeaveRunView = jest.fn(),
  } = {}) => {
    jest
      .spyOn(command, 'useSendInterestCommand')
      .mockReturnValue({ isSending: false, sendCommand: send } as never);
    jest.spyOn(queries, 'interestHistoryQueryOptions').mockReturnValue({
      queryKey: ['history', 'a1'],
      queryFn: async () => ({
        edges: turns.map((node) => ({ node, cursor: node.id })),
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      }),
    } as never);
    jest.spyOn(queries, 'interestRunQueryOptions').mockReturnValue({
      queryKey: ['run', 'a1', runId],
      queryFn: async () => {
        if (!run) {
          throw new Error('run not found');
        }
        return run;
      },
      retry: false,
    } as never);

    const seen: { current: Agent; onLeaveRunView: jest.Mock } = {
      current: undefined as never,
      onLeaveRunView,
    };

    const Probe = () => {
      seen.current = useAgent();

      return null;
    };

    render(
      <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
        <AgentProvider
          id="a1"
          interest={{ id: 'a1', query: 'zig', ...interest } as never}
          isDemo={false}
          runId={runId}
          onLeaveRunView={onLeaveRunView}
          findings={findings}
          posts={posts as never}
        >
          <Probe />
        </AgentProvider>
      </TestBootProvider>,
    );

    return seen;
  };

  const flushQueries = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  const waitForHistory = (
    agent: { current: Agent },
    predicate: (current: Agent) => boolean,
  ) => waitFor(() => expect(predicate(agent.current)).toBe(true));

  it('renders the server history, resolving picks against the findings it has', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'a1-spawn',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'zig',
        },
        {
          id: 'run-1',
          role: 'agent',
          createdAt: '2026-01-01T00:01:00Z',
          status: 'completed',
          trigger: 'spawn',
          blocks: [
            { type: 'text', html: '<p>Found things.</p>' },
            { type: 'picks', postIds: ['p1', 'gone'] },
            { type: 'feedLink', label: 'Open all 4 findings', count: 4 },
          ],
        } as InterestTurn,
      ],
      findings: [feedItem('p1')],
    });

    await waitForHistory(agent, (current) => current.messages.length === 2);

    expect(agent.current.messages.map(({ role }) => role)).toEqual([
      'user',
      'agent',
    ]);
    const blocks = agent.current.messages.at(-1)?.blocks ?? [];
    expect(blocks[0]).toEqual({ type: 'text', html: '<p>Found things.</p>' });
    expect(blocks[1]).toMatchObject({ type: 'picks' });
    expect((blocks[1] as { posts: Post[] }).posts.map(({ id }) => id)).toEqual([
      'p1',
    ]);
    expect(blocks[2]).toMatchObject({ type: 'feedLink' });
    expect((blocks[2] as { posts: Post[] }).posts.map(({ id }) => id)).toEqual([
      'p1',
    ]);
  });

  it('scopes a feed link to its own postIds instead of every finding', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'run-1',
          role: 'agent',
          createdAt: '2026-01-01T00:01:00Z',
          status: 'completed',
          trigger: 'scheduled',
          blocks: [
            {
              type: 'feedLink',
              label: 'Open all 2 findings',
              count: 2,
              postIds: ['p2', 'gone'],
            },
          ],
        } as InterestTurn,
      ],
      findings: [feedItem('p1'), feedItem('p2')],
    });

    await waitForHistory(agent, (current) => current.messages.length === 1);

    const blocks = agent.current.messages.at(-1)?.blocks ?? [];
    expect(blocks[0]).toMatchObject({ type: 'feedLink' });
    expect((blocks[0] as { posts: Post[] }).posts.map(({ id }) => id)).toEqual([
      'p2',
    ]);
  });

  it('shows a queued or running run as the working state', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'run-1',
          role: 'agent',
          createdAt: '2026-01-01T00:00:00Z',
          status: 'running',
          trigger: 'scheduled',
        } as InterestTurn,
      ],
    });

    await waitForHistory(agent, (current) => current.messages.length === 1);

    expect(agent.current.isWorking).toBe(true);
    expect(agent.current.messages.at(-1)?.isPending).toBe(true);
  });

  it('pairs a failed run with the command it answers so it can be retried', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'fb-1',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'raise the bar',
        },
        {
          id: 'run-1',
          role: 'agent',
          createdAt: '2026-01-01T00:00:01Z',
          status: 'failed',
          trigger: 'command',
          feedbackId: 'fb-1',
        } as InterestTurn,
      ],
    });

    await waitForHistory(agent, (current) => current.messages.length === 2);

    const reply = agent.current.messages.at(-1);
    expect(reply?.isError).toBe(true);
    expect(reply?.retryText).toBe('raise the bar');
  });

  it('drops a quiet scheduled run but still answers a quiet command', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'run-quiet',
          role: 'agent',
          createdAt: '2026-01-01T00:00:00Z',
          status: 'completed',
          trigger: 'scheduled',
          blocks: [],
        } as InterestTurn,
        {
          id: 'run-answer',
          role: 'agent',
          createdAt: '2026-01-01T00:01:00Z',
          status: 'completed',
          trigger: 'command',
          blocks: [],
        } as InterestTurn,
      ],
    });

    await waitForHistory(agent, (current) => current.messages.length === 1);

    expect(agent.current.messages.map(({ id }) => id)).toEqual(['run-answer']);
    expect(agent.current.messages[0]?.blocks?.[0]).toMatchObject({
      type: 'text',
    });
  });

  it('echoes a sent command as pending until the history catches up', async () => {
    const agent = mountLive({ send: () => Promise.resolve() });

    await flushQueries();
    await act(async () => {
      agent.current.runCommand({ text: 'raise the bar' });
    });

    const reply = agent.current.messages.at(-1);
    expect(agent.current.messages.at(-2)?.text).toBe('raise the bar');
    expect(reply?.isPending).toBe(true);
    expect(reply?.blocks).toBeUndefined();
    expect(agent.current.isWorking).toBe(true);
  });

  it('reports a rejected command as an error the reader can retry', async () => {
    const agent = mountLive({ send: () => Promise.reject(new Error('nope')) });

    await flushQueries();
    await act(async () => {
      agent.current.runCommand({ text: 'raise the bar' });
    });

    const reply = agent.current.messages.at(-1);

    expect(reply?.isError).toBe(true);
    expect(reply?.retryText).toBe('raise the bar');
    expect(agent.current.isWorking).toBe(false);
  });

  it('rolls the optimistic status back when the update is rejected', async () => {
    jest.spyOn(updateHook, 'useUpdateInterest').mockReturnValue({
      isUpdating: false,
      updateInterest: () => Promise.reject(new Error('nope')),
    } as never);
    const agent = mountLive({
      turns: [
        {
          id: 'a1-spawn',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'zig',
        },
      ],
    });

    await flushQueries();
    await act(async () => {
      agent.current.update({ status: 'paused' as never });
    });

    expect(agent.current.status).toBe('active');
  });

  it('keeps a blockless run visible when it wrote a summary post', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'run-1',
          role: 'agent',
          createdAt: '2026-01-01T00:00:00Z',
          status: 'completed',
          trigger: 'scheduled',
          summaryPostId: 'sp-1',
          blocks: [],
        } as InterestTurn,
      ],
      posts: [
        {
          id: 'sp-1',
          title: 'Zig this week',
          createdAt: '2026-01-01T00:02:00Z',
        },
      ],
    });

    await waitForHistory(agent, (current) => current.messages.length === 1);

    expect(agent.current.messages[0].role).toBe('agent');
    expect(agent.current.summaryPosts).toHaveLength(1);
  });

  it('derives the activity log from history and findings', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'fb-1',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'raise the bar',
        },
        {
          id: 'run-1',
          role: 'agent',
          createdAt: '2026-01-01T00:01:00Z',
          finishedAt: '2026-01-01T00:02:00Z',
          status: 'completed',
          trigger: 'command',
          feedbackId: 'fb-1',
          findingsAdded: 2,
          summaryPostId: 'sp-1',
          blocks: [{ type: 'text', html: '<p>Done.</p>' }],
        } as InterestTurn,
      ],
      findings: [feedItem('p1')],
    });

    await waitForHistory(agent, (current) => current.activity.length === 4);

    expect(agent.current.activity.map(({ kind }) => kind).sort()).toEqual([
      'command',
      'finding',
      'post',
      'run',
    ]);
  });
  const completedRun = (id: string, at: string): InterestTurn =>
    ({
      id,
      role: 'agent',
      createdAt: at,
      status: 'completed',
      trigger: 'scheduled',
      findingsAdded: 1,
      blocks: [{ type: 'text', html: `<p>${id}</p>` }],
    } as InterestTurn);

  it('shows only the deep-linked run and offers the latest one when it is older', async () => {
    const agent = mountLive({
      runId: 'run-1',
      run: completedRun('run-1', '2026-01-01T00:00:00Z'),
      turns: [
        completedRun('run-1', '2026-01-01T00:00:00Z'),
        completedRun('run-2', '2026-01-02T00:00:00Z'),
      ],
    });

    await waitForHistory(agent, (current) => current.isOldRunView);
    expect(agent.current.messages.map(({ id }) => id)).toEqual(['run-1']);

    act(() => agent.current.leaveRunView());

    expect(agent.onLeaveRunView).toHaveBeenCalled();
  });

  it('does not offer the latest run when the deep-linked run is the latest', async () => {
    const agent = mountLive({
      runId: 'run-2',
      run: completedRun('run-2', '2026-01-02T00:00:00Z'),
      turns: [
        completedRun('run-1', '2026-01-01T00:00:00Z'),
        completedRun('run-2', '2026-01-02T00:00:00Z'),
      ],
    });

    await waitForHistory(agent, (current) => current.messages.length === 1);
    expect(agent.current.isRunView).toBe(true);
    expect(agent.current.isOldRunView).toBe(false);
  });

  it('falls back to the history when the deep-linked run cannot be loaded', async () => {
    const agent = mountLive({
      runId: 'run-gone',
      turns: [completedRun('run-1', '2026-01-01T00:00:00Z')],
    });

    await waitForHistory(agent, (current) => current.messages.length === 1);
    expect(agent.current.isRunView).toBe(false);
  });

  it('loads only the latest turn while history is switched off', async () => {
    const agent = mountLive({ interest: { showHistory: false } });

    await flushQueries();
    expect(queries.interestHistoryQueryOptions).toHaveBeenLastCalledWith(
      'a1',
      expect.anything(),
      1,
    );
    expect(agent.current.isHistoryLimited).toBe(true);

    act(() => agent.current.showEarlier());

    await waitFor(() =>
      expect(queries.interestHistoryQueryOptions).toHaveBeenLastCalledWith(
        'a1',
        expect.anything(),
        40,
      ),
    );
    expect(agent.current.isHistoryLimited).toBe(false);
  });

  it('renders a reply as the agent answering the turn it belongs to', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'fb-1',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'what single pick do you recommend?',
          replyStatus: 'completed' as never,
          replyBlocks: [
            { type: 'text', html: '<p>Read the teardown first.</p>' },
          ] as never,
        },
      ],
    });

    await waitForHistory(agent, ({ messages }) => messages.length === 2);

    expect(
      agent.current.messages.map(({ id, role, isPending }) => [
        id,
        role,
        !!isPending,
      ]),
    ).toEqual([
      ['fb-1', 'user', false],
      ['fb-1-reply', 'agent', false],
    ]);
  });

  it('never asks for a reply to a vote', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const agent = mountLive({ send, runId: 'run-1' });

    await flushQueries();
    await act(async () => {
      await agent.current.sendFeedback('Fewer replies like this one: "..."');
    });

    expect(send).toHaveBeenCalledWith({
      text: 'Fewer replies like this one: "..."',
      reply: false,
    });
  });

  it('falls back to a plain answer when a completed reply carries no blocks', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'fb-1',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'noted, thanks',
          replyStatus: 'completed' as never,
          replyBlocks: [] as never,
        },
      ],
    });

    await waitForHistory(agent, ({ messages }) => messages.length === 2);

    expect(agent.current.messages[1]).toMatchObject({
      id: 'fb-1-reply',
      role: 'agent',
      isPending: false,
      isError: false,
      blocks: [{ type: 'text', html: '<p>Done.</p>' }],
    });
  });

  it('counts a pending reply as the agent working', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'fb-1',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'too shallow',
          replyStatus: 'running' as never,
        },
      ],
    });

    await waitForHistory(agent, ({ isWorking }) => isWorking === true);

    expect(agent.current.isWorking).toBe(true);
  });

  it('shows a queued reply as pending', async () => {
    const agent = mountLive({
      turns: [
        {
          id: 'fb-1',
          role: 'user',
          createdAt: '2026-01-01T00:00:00Z',
          text: 'too shallow',
          replyStatus: 'queued' as never,
        },
      ],
    });

    await waitForHistory(agent, ({ messages }) => messages.length === 2);

    expect(agent.current.messages[1]).toMatchObject({
      id: 'fb-1-reply',
      role: 'agent',
      isPending: true,
    });
  });

  it('sends the run the reader has open, then leaves the run view', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const agent = mountLive({
      send,
      runId: 'run-1',
      run: {
        id: 'run-1',
        role: 'agent',
        createdAt: '2026-01-01T00:01:00Z',
        blocks: [],
      } as never,
    });

    await flushQueries();
    await act(async () => {
      agent.current.runCommand({ text: 'what single pick do you recommend?' });
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'what single pick do you recommend?',
        runId: 'run-1',
      }),
    );
    expect(agent.onLeaveRunView).toHaveBeenCalled();
  });
});

describe('running commands', () => {
  it('puts the prompt and a pending reply in the transcript', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'raise the bar' }));

    expect(agent.current.messages.map(({ role }) => role)).toEqual([
      'user',
      'agent',
    ]);
    expect(agent.current.isWorking).toBe(true);
  });

  it('resolves the pending reply when the run finishes', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'raise the bar' }));
    act(() => jest.advanceTimersByTime(3000));

    expect(agent.current.isWorking).toBe(false);
    expect(agent.current.messages.at(-1)?.isPending).toBeFalsy();
    expect(agent.current.messages.at(-1)?.blocks).toBeDefined();
  });

  it('queues a second prompt rather than running two at once', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'first' }));
    act(() => agent.current.runCommand({ text: 'second' }));

    expect(agent.current.queuedCommands.map(({ text }) => text)).toEqual([
      'second',
    ]);
  });

  it('starts the queued prompt once the first one lands', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'first' }));
    act(() => agent.current.runCommand({ text: 'second' }));
    act(() => jest.advanceTimersByTime(3000));

    expect(agent.current.queuedCommands).toHaveLength(0);
    expect(agent.current.isWorking).toBe(true);
    expect(agent.current.workingLabel).toBe('second');
  });

  // StrictMode re-runs state updaters, so one that schedules work as a side
  // effect schedules it twice.
  it('starts a queued prompt once, not twice, under StrictMode', () => {
    const seen: { current: Agent } = { current: undefined as never };

    const Probe = () => {
      seen.current = useAgent();

      return null;
    };

    render(
      <React.StrictMode>
        <TestBootProvider client={new QueryClient()}>
          <AgentProvider id="a1" isDemo initialMessages={[]}>
            <Probe />
          </AgentProvider>
        </TestBootProvider>
      </React.StrictMode>,
    );

    act(() => seen.current.runCommand({ text: 'first' }));
    act(() => seen.current.runCommand({ text: 'second' }));
    act(() => jest.advanceTimersByTime(3000));

    const sent = seen.current.messages.filter(
      ({ role, text }) => role === 'user' && text === 'second',
    );

    expect(sent).toHaveLength(1);
  });

  it('lets a queued prompt be taken back before it starts', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'first' }));
    act(() => agent.current.runCommand({ text: 'second' }));
    act(() =>
      agent.current.removeQueuedCommand(agent.current.queuedCommands[0].id),
    );
    act(() => jest.advanceTimersByTime(3000));

    expect(agent.current.isWorking).toBe(false);
  });

  it('knows which target it is working on', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'why', targetId: 'post:p1' }));

    expect(agent.current.isTargetWorking('post:p1')).toBe(true);
    expect(agent.current.isTargetWorking('post:p2')).toBe(false);
  });

  it('leaves nothing spinning once a queue has drained', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'first' }));
    act(() => agent.current.runCommand({ text: 'second' }));
    act(() => agent.current.runCommand({ text: 'third' }));

    // Each run resolves on its own timer, so the advances cannot be merged.
    act(() => jest.advanceTimersByTime(3000));
    act(() => jest.advanceTimersByTime(3000));
    act(() => jest.advanceTimersByTime(3000));

    expect(agent.current.isWorking).toBe(false);
    expect(agent.current.queuedCommands).toHaveLength(0);
    expect(agent.current.messages.filter(({ isPending }) => isPending)).toEqual(
      [],
    );
    expect(
      agent.current.messages
        .filter(({ role }) => role === 'user')
        .map(({ text }) => text),
    ).toEqual(['first', 'second', 'third']);
  });

  it('reflects a status switch without touching the transcript', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'raise the bar' }));
    act(() => agent.current.update({ status: 'paused' as never }));

    expect(agent.current.status).toBe('paused');
    expect(agent.current.messages).toHaveLength(2);
  });
});
