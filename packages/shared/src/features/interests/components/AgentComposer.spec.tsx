import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import { AgentProvider, useAgent } from '../AgentContext';
import { AgentComposer } from './AgentComposer';

type Agent = ReturnType<typeof useAgent>;

const mountComposer = () => {
  const seen: { current: Agent } = { current: undefined as never };

  const Probe = () => {
    seen.current = useAgent();

    return null;
  };

  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[]}>
        <AgentComposer />
        <Probe />
      </AgentProvider>
    </TestBootProvider>,
  );

  return seen;
};

const field = () =>
  screen.getByLabelText('Tell the agent what to change') as HTMLTextAreaElement;

const type = (value: string) =>
  fireEvent.change(field(), { target: { value } });

const indent = () =>
  parseFloat(field().style.getPropertyValue('text-indent')) || 0;

const lastPrompt = (agent: { current: Agent }) =>
  agent.current.messages.filter(({ role }) => role === 'user').at(-1)?.text;

beforeAll(() => {
  // jsdom implements no scrolling, and the menu scrolls its active row in view.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockDesktop();
});

describe('AgentComposer', () => {
  it('sends what was typed on Enter', () => {
    const agent = mountComposer();

    type('fewer announcements');
    fireEvent.keyDown(field(), { key: 'Enter' });

    expect(lastPrompt(agent)).toBe('fewer announcements');
    expect(field().value).toBe('');
  });

  it('leaves Shift+Enter to write another line', () => {
    const agent = mountComposer();

    type('first line');
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true });

    expect(agent.current.messages).toHaveLength(0);
    expect(field().value).toBe('first line');
  });

  it('will not send an empty field', () => {
    const agent = mountComposer();

    type('   ');
    fireEvent.keyDown(field(), { key: 'Enter' });

    expect(agent.current.messages).toHaveLength(0);
  });

  it('sends on the send button too', () => {
    const agent = mountComposer();

    type('raise the bar');
    fireEvent.click(screen.getByLabelText('Send to agent'));

    expect(lastPrompt(agent)).toBe('raise the bar');
  });

  it('has nothing to send until something is typed', () => {
    mountComposer();

    expect(screen.getByLabelText('Send to agent')).toBeDisabled();

    type('something');

    expect(screen.getByLabelText('Send to agent')).toBeEnabled();
  });

  describe('commands', () => {
    it('turns a command typed out in full into its prompt', () => {
      const agent = mountComposer();

      type('/explore comptime');
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(lastPrompt(agent)).toBe('Explore more around comptime');
    });

    it('sends a bare command as its no-argument prompt', () => {
      const agent = mountComposer();

      type('/recap');
      fireEvent.keyDown(field(), { key: 'Enter' });
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(lastPrompt(agent)).toBe(
        'Recap everything you have found since the last summary',
      );
    });

    it('opens the list on a bare slash and arms the one you pick', () => {
      mountComposer();

      type('/');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByText('/explore')).toBeInTheDocument();
      expect(field().value).toBe('');
    });

    it('shows the armed command inline, and takes it back on Backspace', () => {
      mountComposer();

      type('/');
      fireEvent.keyDown(field(), { key: 'Enter' });

      const label = screen.getByText('/explore');

      expect(label).toHaveClass('absolute');
      // jsdom measures every element at zero width, so only the presence of an
      // indent can be asserted, never its size.
      expect(indent()).toBeGreaterThan(0);
      expect(
        screen.queryByLabelText('Remove the explore command'),
      ).not.toBeInTheDocument();

      fireEvent.keyDown(field(), { key: 'Backspace' });

      expect(screen.queryByText('/explore')).not.toBeInTheDocument();
      expect(indent()).toBe(0);
    });

    it('keeps the send at the foot of the field', () => {
      mountComposer();

      expect(
        screen.getByLabelText('Send to agent').closest('.items-end'),
      ).not.toBeNull();
    });

    it('names the row it is on, so the field can point at it', () => {
      mountComposer();

      type('/');

      const options = screen.getAllByRole('option');

      expect(field()).toHaveAttribute('aria-expanded', 'true');
      expect(field()).toHaveAttribute('aria-activedescendant', options[0].id);
      expect(options[0]).toHaveAttribute('aria-selected', 'true');

      fireEvent.keyDown(field(), { key: 'ArrowDown' });

      expect(field()).toHaveAttribute('aria-activedescendant', options[1].id);
      expect(options[1].parentElement).toHaveAttribute('role', 'listbox');
    });

    it('moves through the list with the arrow keys', () => {
      mountComposer();

      type('/');
      fireEvent.keyDown(field(), { key: 'ArrowDown' });
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(screen.getByText('/write')).toBeInTheDocument();
    });

    it('closes the list on Escape without dropping what was typed', () => {
      mountComposer();

      type('/exp');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(field(), { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(field().value).toBe('/exp');
    });

    it('spends no run on a command that only opens part of the workspace', () => {
      const agent = mountComposer();

      type('/activity');
      fireEvent.keyDown(field(), { key: 'Enter' });
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(agent.current.messages).toHaveLength(0);
      expect(agent.current.openContent.map(({ type: kind }) => kind)).toEqual([
        'activity',
      ]);
    });

    it('sends the armed command with whatever is typed after it', () => {
      const agent = mountComposer();

      type('/');
      fireEvent.keyDown(field(), { key: 'Enter' });
      type('allocators');
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(lastPrompt(agent)).toBe('Explore more around allocators');
    });

    it('takes the armed command back on backspace in an empty field', () => {
      mountComposer();

      type('/');
      fireEvent.keyDown(field(), { key: 'Enter' });
      fireEvent.keyDown(field(), { key: 'Backspace' });

      expect(screen.queryByText('/explore')).not.toBeInTheDocument();
    });

    it('drops a command straight in from the quick buttons', () => {
      mountComposer();

      fireEvent.click(screen.getByText('Write a post'));

      expect(screen.getByText('/write')).toBeInTheDocument();
    });
  });

  describe('attachments', () => {
    it('shows what the prompt is pointed at, and lets it be taken back', () => {
      const agent = mountComposer();

      act(() =>
        agent.current.attachContext({
          id: 'post:p1',
          kind: 'post',
          label: 'Zig 0.15',
        }),
      );

      expect(screen.getByText('Zig 0.15')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Remove Zig 0.15'));

      expect(agent.current.attachments).toHaveLength(0);
    });

    it('backspacing an empty field takes the last one added', () => {
      const agent = mountComposer();

      act(() =>
        agent.current.attachContext({
          id: 'post:p1',
          kind: 'post',
          label: 'First',
        }),
      );
      act(() =>
        agent.current.attachContext({
          id: 'post:p2',
          kind: 'post',
          label: 'Second',
        }),
      );
      fireEvent.keyDown(field(), { key: 'Backspace' });

      expect(agent.current.attachments.map(({ label }) => label)).toEqual([
        'First',
      ]);
    });

    it('sends them along with the prompt', () => {
      const agent = mountComposer();

      act(() =>
        agent.current.attachContext({
          id: 'post:p1',
          kind: 'post',
          label: 'Zig 0.15',
        }),
      );
      type('why this one');
      fireEvent.keyDown(field(), { key: 'Enter' });

      const sent = agent.current.messages.find(({ role }) => role === 'user');

      expect(sent?.attachments?.map(({ id }) => id)).toEqual(['post:p1']);
    });
  });

  describe('the draft', () => {
    it('takes text written from elsewhere on the screen', () => {
      const agent = mountComposer();

      act(() => agent.current.writeDraft('I marked that one down because '));

      expect(field().value).toBe('I marked that one down because ');
    });

    it('clears it as it takes it, so the same text can be written twice', () => {
      const agent = mountComposer();

      act(() => agent.current.writeDraft('because '));
      expect(agent.current.draft).toBeUndefined();

      type('');
      act(() => agent.current.writeDraft('because '));

      expect(field().value).toBe('because ');
    });
  });

  describe('while a run is in flight', () => {
    it('keeps the send button available so the next prompt can queue', () => {
      mountComposer();

      type('raise the bar');
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(screen.getByLabelText('Send to agent')).toBeInTheDocument();
    });

    it('queues the next prompt rather than refusing it', () => {
      const agent = mountComposer();

      type('first');
      fireEvent.keyDown(field(), { key: 'Enter' });
      type('second');
      fireEvent.keyDown(field(), { key: 'Enter' });

      expect(agent.current.queuedCommands.map(({ text }) => text)).toEqual([
        'second',
      ]);
    });
  });
});
