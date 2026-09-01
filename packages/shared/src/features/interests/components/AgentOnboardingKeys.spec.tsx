import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { UserInterest } from '../../../graphql/interests';
import {
  UserInterestOnboardingStep,
  UserInterestStatus,
} from '../../../graphql/interests';
import type { AgentBlock, AgentMessage } from '../chat';
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

const questionBlock: AgentBlock = {
  type: 'question',
  questionId: 'q1',
  html: '<p>What do you want?</p>',
  input: 'chips',
  multi: true,
  choices: [
    { value: 'shipped', label: 'Things that shipped' },
    { value: 'deep', label: 'Deep dives' },
  ],
  selected: [],
};

const questionTurn: AgentMessage = {
  id: 'm2',
  role: 'agent',
  at: new Date().toISOString(),
  blocks: [questionBlock],
};

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

const renderStep = (
  step: UserInterestOnboardingStep,
  messages: AgentMessage[],
) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider
        id="a1"
        isDemo
        interest={{ ...interest, onboardingStep: step }}
        initialMessages={messages}
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
    renderStep(UserInterestOnboardingStep.Brief, [briefTurn]);

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(confirmBrief).toHaveBeenCalledWith(undefined);
  });

  it('submits the rewrite rather than the original when the editor is open', () => {
    renderStep(UserInterestOnboardingStep.Brief, [briefTurn]);

    fireEvent.click(screen.getByText('Edit it'));
    fireEvent.input(screen.getByLabelText('Edit the brief'), {
      target: { value: 'Only source-level teardowns' },
    });
    // Focus is outside the textarea, so this reaches the workspace handler.
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(confirmBrief).toHaveBeenCalledWith('Only source-level teardowns');
  });

  it('leaves a focused button to its own activation', () => {
    renderStep(UserInterestOnboardingStep.Brief, [briefTurn]);

    // Enter on a button is the button's default action; hijacking it here
    // would cancel the press instead of helping.
    fireEvent.keyDown(screen.getByText('Edit it'), { key: 'Enter' });

    expect(confirmBrief).not.toHaveBeenCalled();
  });

  it('closes the editor once the rewrite is saved', async () => {
    renderStep(UserInterestOnboardingStep.Brief, [briefTurn]);

    fireEvent.click(screen.getByText('Edit it'));
    fireEvent.input(screen.getByLabelText('Edit the brief'), {
      target: { value: 'Only source-level teardowns' },
    });
    fireEvent.click(screen.getByText('Save and continue'));

    // Left open, the card would keep a textarea with no buttons under it.
    await waitFor(() =>
      expect(screen.queryByLabelText('Edit the brief')).not.toBeInTheDocument(),
    );
  });

  it('drops focus from a chip picked with the pointer', () => {
    renderStep(UserInterestOnboardingStep.Questions, [questionTurn]);

    const chip = screen
      .getByText('Deep dives')
      .closest('button') as HTMLElement;
    // detail > 0 marks a real pointer press; keeping focus here would let the
    // next Enter re-fire the click and un-pick the chip.
    fireEvent.click(chip, { detail: 1 });

    expect(chip).not.toHaveFocus();
  });

  it('keeps focus on a chip toggled from the keyboard', () => {
    renderStep(UserInterestOnboardingStep.Questions, [questionTurn]);

    const chip = screen
      .getByText('Deep dives')
      .closest('button') as HTMLElement;
    chip.focus();
    fireEvent.click(chip, { detail: 0 });

    expect(chip).toHaveFocus();
  });
});
