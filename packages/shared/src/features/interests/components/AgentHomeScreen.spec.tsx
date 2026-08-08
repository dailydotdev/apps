import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import { AgentHomeScreen } from './AgentHomeScreen';
import { recentMockAgents } from '../mock';

const renderHome = (props: Partial<{ isPending: boolean }> = {}) =>
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
