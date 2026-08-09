import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import { AgentHomeScreen } from './AgentHomeScreen';
import { recentMockAgents } from '../mock';

const renderHome = (
  props: Partial<{ isPending: boolean; initialQuery: string }> = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentHomeScreen
        agents={props.isPending ? [] : recentMockAgents()}
        onCreate={jest.fn()}
        {...props}
      />
    </TestBootProvider>,
  );

beforeEach(() => mockDesktop());

describe('AgentHomeScreen while the list is loading', () => {
  it('stands the rows up in the shape they become', () => {
    renderHome({ isPending: true });

    expect(screen.getByLabelText('Loading your agents')).toBeInTheDocument();
    // Placeholders carry no accessible role, by design.
    expect(document.querySelectorAll('.agent-skeleton').length).toBeGreaterThan(
      8,
    );
  });

  // Both of these were claims about agents that had not arrived yet.
  it('makes no claim about how many agents there are', () => {
    renderHome({ isPending: true });

    expect(screen.queryByText(/None watching/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Spawn your first agent'),
    ).not.toBeInTheDocument();
  });

  it('says what it knows once they land', () => {
    renderHome();

    expect(screen.getByText(/waiting for review/)).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Loading your agents'),
    ).not.toBeInTheDocument();
  });

  it('invites a first agent only when there are genuinely none', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <AgentHomeScreen agents={[]} onCreate={jest.fn()} />
      </TestBootProvider>,
    );

    expect(screen.getByText('Spawn your first agent')).toBeInTheDocument();
  });
});

/**
 * Two readings of the same row: a two-line card on a phone, one compact line
 * from tablet up. CSS decides which, so what is worth pinning here is that it
 * is CSS and not two copies of the row.
 */
describe('AgentHomeScreen rows at both readings', () => {
  it('renders each agent once, not once per reading', () => {
    const [first] = recentMockAgents();
    renderHome();

    expect(screen.getAllByText(first.query)).toHaveLength(1);
  });

  it('gives the news dot to the phone and the chevron to wider screens', () => {
    renderHome();

    const row = screen.getByText(recentMockAgents()[0].query).closest('a');
    const gutter = row?.firstElementChild;
    const chevron = row?.querySelector('svg');

    expect(gutter).toHaveClass('tablet:hidden', 'bg-brand-default');
    // SVG `className` is an SVGAnimatedString, not a string.
    expect(chevron).toHaveAttribute(
      'class',
      expect.stringContaining('tablet:block'),
    );
    expect(chevron).toHaveAttribute('class', expect.stringContaining('hidden'));
  });
});

/**
 * A shared agent link hands over the standing prompt. It lands in the field
 * rather than running: spawning off someone else's link would spend a run the
 * reader never asked to spend.
 */
describe('AgentHomeScreen given a shared prompt', () => {
  const field = () =>
    screen.getByLabelText(
      'What should the agent hunt for?',
    ) as HTMLTextAreaElement;

  it('puts it in the field, ready to send', () => {
    renderHome({ initialQuery: 'Rust in production' });

    expect(field().value).toBe('Rust in production');
    expect(screen.getByLabelText('Spawn the agent')).toBeEnabled();
  });

  it('leaves the field empty when nothing was handed over', () => {
    renderHome();

    expect(field().value).toBe('');
  });
});
