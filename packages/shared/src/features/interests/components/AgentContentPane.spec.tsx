import React, { useEffect } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  laptopQuery,
  mockMatchMedia,
} from '../../../../__tests__/helpers/media';
import type { Post } from '../../../graphql/posts';
import basePost from '../../../../__tests__/fixture/post';
import type { AgentContentTarget } from '../AgentContext';
import { AgentProvider, useAgent } from '../AgentContext';
import { AgentContentPane } from './AgentContentPane';

const setViewport = mockMatchMedia;

// The shared fixture, not a hand-rolled object: the panel renders the real
// post page inside itself, and that reads far more of a post than a title.
const post = (id: string, title: string): Post =>
  ({ ...basePost, id, title } as Post);

const Opener = ({ targets }: { targets: AgentContentTarget[] }) => {
  const { openContentTarget } = useAgent();

  useEffect(() => {
    targets.forEach(openContentTarget);
    // Opening once on mount is the point; re-running would refocus the last tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const renderPane = (targets: AgentContentTarget[]) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[]}>
        <Opener targets={targets} />
        <AgentContentPane
          width={480}
          onWidthChange={(next) => next}
          onWidthCommit={jest.fn()}
          debugPanel={<div>Raw state</div>}
        />
      </AgentProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  setViewport((query) => query === laptopQuery);
});

describe('AgentContentPane tabs', () => {
  it('names each open tab', () => {
    renderPane([
      { type: 'activity' },
      { type: 'debug' },
      { type: 'post', post: post('p1', 'Zig 0.15') },
    ]);

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Activity',
      'Debug',
      'Zig 0.15',
    ]);
  });

  it('marks only the focused tab as selected', () => {
    renderPane([{ type: 'activity' }, { type: 'debug' }]);

    const [activity, debug] = screen.getAllByRole('tab');

    expect(debug).toHaveAttribute('aria-selected', 'true');
    expect(activity).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(activity);

    expect(activity).toHaveAttribute('aria-selected', 'true');
    expect(debug).toHaveAttribute('aria-selected', 'false');
  });

  it('shows the focused tab’s content, and only that', () => {
    renderPane([{ type: 'activity' }, { type: 'debug' }]);

    expect(screen.getByText('Raw state')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('tab')[0]);

    expect(screen.queryByText('Raw state')).not.toBeInTheDocument();
  });

  // A close that only appears under the pointer is one you have to go hunting
  // for, so every tab carries its own, focused or not.
  it('gives every tab a close, whether or not it is the active one', () => {
    renderPane([{ type: 'activity' }, { type: 'debug' }]);

    expect(screen.getByLabelText('Close Activity')).toBeInTheDocument();
    expect(screen.getByLabelText('Close Debug')).toBeInTheDocument();
  });

  it('closes one tab without closing the panel', () => {
    renderPane([{ type: 'activity' }, { type: 'debug' }]);

    fireEvent.click(screen.getByLabelText('Close Debug'));

    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(screen.getByLabelText('Agent content panel')).toBeInTheDocument();
  });

  it('closes the whole panel on the panel close', () => {
    renderPane([{ type: 'activity' }]);

    fireEvent.click(screen.getByLabelText('Close panel'));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('closes the active tab on Escape', () => {
    renderPane([{ type: 'activity' }, { type: 'debug' }]);

    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(screen.queryByLabelText('Close Debug')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Close Activity')).toBeInTheDocument();
  });

  it('offers the original only for a post, where there is one to open', () => {
    renderPane([{ type: 'post', post: post('p1', 'Zig 0.15') }]);

    expect(screen.getByLabelText('Open original')).toBeInTheDocument();
  });

  it('has no original to offer for the activity log', () => {
    renderPane([{ type: 'activity' }]);

    expect(screen.queryByLabelText('Open original')).not.toBeInTheDocument();
  });
});

describe('AgentContentPane on a laptop', () => {
  it('is a card in the workspace, with a handle to resize it', () => {
    renderPane([{ type: 'activity' }]);

    expect(screen.getByLabelText('Resize panel')).toBeInTheDocument();
    expect(screen.getByLabelText('Agent content panel')).toHaveStyle({
      width: '480px',
    });
  });
});

describe('AgentContentPane on a phone', () => {
  beforeEach(() => setViewport(() => false));

  it('arrives as a full-screen sheet rather than a sized card', () => {
    renderPane([{ type: 'activity' }]);

    const panel = screen.getByLabelText('Agent content panel');

    // An absence of an inline width, which `toHaveStyle` cannot express.
    expect(panel).not.toHaveAttribute('style');
    expect(panel).toHaveClass('inset-0');
  });

  // The sheet has to slide out before it goes: closing the content underneath
  // it first would leave nothing to animate.
  it('keeps the sheet up for the length of its exit', () => {
    renderPane([{ type: 'activity' }]);

    fireEvent.click(screen.getByLabelText('Close panel'));

    expect(screen.getByLabelText('Agent content panel')).toBeInTheDocument();
  });
});
