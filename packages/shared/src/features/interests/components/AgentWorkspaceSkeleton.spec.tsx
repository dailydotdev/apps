import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import { AgentWorkspaceSkeleton } from './AgentWorkspaceSkeleton';

beforeEach(() => mockDesktop());

describe('AgentWorkspaceSkeleton', () => {
  it('says it is loading, for anyone listening rather than looking', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <AgentWorkspaceSkeleton />
      </TestBootProvider>,
    );

    expect(screen.getByLabelText('Loading the agent')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('stands the conversation up in the frame it will keep', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <AgentWorkspaceSkeleton />
      </TestBootProvider>,
    );

    // Placeholders carry no accessible role to query them by.
    expect(document.querySelectorAll('.agent-skeleton').length).toBeGreaterThan(
      8,
    );
  });
});
