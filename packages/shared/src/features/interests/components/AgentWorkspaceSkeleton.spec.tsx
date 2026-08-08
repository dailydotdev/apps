import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import { AgentWorkspaceSkeleton } from './AgentWorkspaceSkeleton';

beforeEach(() => mockDesktop());

describe('AgentWorkspaceSkeleton', () => {
  // Not a spinner and not an empty room: the shape of what is coming, so
  // nothing moves when it lands.
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

    // Placeholders have no accessible role by design — the region announces
    // itself as busy and the blocks inside it are decoration.
    expect(document.querySelectorAll('.agent-skeleton').length).toBeGreaterThan(
      8,
    );
  });
});
