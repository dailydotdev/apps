import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { UserInterest } from '../../../graphql/interests';
import {
  UserInterestOnboardingStep,
  UserInterestStatus,
} from '../../../graphql/interests';
import type { AgentMessage } from '../chat';
import { AgentProvider } from '../AgentContext';
import { AgentWorkspace } from './AgentWorkspace';
import { useConfirmInterestBrief } from '../hooks/useConfirmInterestBrief';

jest.mock('../hooks/useConfirmInterestBrief');

const confirmBrief = jest.fn().mockResolvedValue(undefined);

const interest = {
  id: 'a1',
  query: 'zig internals',
  brief: 'Track zig runtime internals',
  status: UserInterestStatus.Onboarding,
  onboardingStep: UserInterestOnboardingStep.Brief,
} as UserInterest;

const briefTurn: AgentMessage = {
  id: 'm1',
  role: 'agent',
  at: new Date().toISOString(),
  blocks: [
    {
      type: 'brief',
      html: '<p>Track zig runtime internals</p>',
      brief: 'Track zig runtime internals',
    },
  ],
};

const renderBriefStep = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider
        id="a1"
        isDemo
        interest={interest}
        initialMessages={[briefTurn]}
      >
        <AgentWorkspace items={[]} onDelete={jest.fn()} isDeleting={false} />
      </AgentProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useConfirmInterestBrief).mockReturnValue({
    isConfirmingBrief: false,
    confirmBrief,
  } as never);
});

describe('onboarding Enter handling', () => {
  it('accepts the brief on Enter from the page', () => {
    renderBriefStep();

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(confirmBrief).toHaveBeenCalledWith(undefined);
  });

  it('submits the rewrite rather than the original when the editor is open', () => {
    renderBriefStep();

    fireEvent.click(screen.getByText('Edit it'));
    fireEvent.change(screen.getByLabelText('Edit the brief'), {
      target: { value: 'Only source-level teardowns' },
    });
    // Focus is outside the textarea, so this reaches the workspace handler.
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(confirmBrief).toHaveBeenCalledWith('Only source-level teardowns');
  });

  it('leaves a focused button to its own activation', () => {
    renderBriefStep();

    // Enter on a button is the button's default action; hijacking it here
    // would cancel the press instead of helping.
    fireEvent.keyDown(screen.getByText('Edit it'), { key: 'Enter' });

    expect(confirmBrief).not.toHaveBeenCalled();
  });
});
