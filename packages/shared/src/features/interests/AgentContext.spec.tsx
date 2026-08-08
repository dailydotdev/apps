import React from 'react';
import { act, render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { Post } from '../../graphql/posts';
import type { AgentMessage } from './chat';
import { AgentProvider, contentTargetId, useAgent } from './AgentContext';

const post = (id: string): Post => ({ id, title: `Post ${id}` } as Post);

const attachment = (id: string) => ({
  id,
  kind: 'post' as const,
  label: `Label ${id}`,
});

type Agent = ReturnType<typeof useAgent>;

/** Hands the live context out to the test, re-read on every render. */
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
    expect(contentTargetId({ type: 'post', post: post('p1') })).toBe('post:p1');
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

  // The buttons stay on screen after you press them, so a second press must
  // not leave two identical chips in the field.
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

// The blank page: the provider reads `initialMessages` once, and the page that
// builds it from a query mounts before that query has answered.
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

  // Consumed once: the composer takes it and clears it, so pressing the same
  // link again writes it again rather than being swallowed as unchanged.
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
      agent.current.openContentTarget({ type: 'post', post: post('p1') }),
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

  // React re-runs state updaters under StrictMode, which Next turns on by
  // default. An updater that schedules work as a side effect therefore
  // schedules it twice, and the queued prompt runs twice.
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

  it('logs what was asked and what came back', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'raise the bar' }));
    act(() => jest.advanceTimersByTime(3000));

    expect(agent.current.activity.map(({ kind }) => kind)).toEqual([
      'run',
      'command',
    ]);
  });
});

describe('stopping', () => {
  it('resolves the pending turn into a visible note rather than deleting it', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'raise the bar' }));
    act(() => agent.current.stopCommand());

    expect(agent.current.isWorking).toBe(false);
    expect(agent.current.messages.at(-1)?.blocks).toEqual([
      { type: 'text', html: '<p>Stopped.</p>' },
    ]);
  });

  // Stop is a brake on everything: resuming the queue would restart work the
  // reader just refused.
  it('drops what was queued behind it', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'first' }));
    act(() => agent.current.runCommand({ text: 'second' }));
    act(() => agent.current.stopCommand());
    act(() => jest.advanceTimersByTime(5000));

    expect(agent.current.queuedCommands).toHaveLength(0);
    expect(agent.current.isWorking).toBe(false);
  });

  it('leaves nothing spinning once a queue has drained', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'first' }));
    act(() => agent.current.runCommand({ text: 'second' }));
    act(() => agent.current.runCommand({ text: 'third' }));

    // Each run resolves on its own timer, and the next starts from the commit
    // that ends the previous one.
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

  it('stops the run when the agent is switched off', () => {
    const agent = mountAgent();

    act(() => agent.current.runCommand({ text: 'raise the bar' }));
    act(() => agent.current.update({ status: 'paused' as never }));

    expect(agent.current.isWorking).toBe(false);
    expect(agent.current.status).toBe('paused');
  });
});
