import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AgentOnboardingEntry } from './AgentOnboardingEntry';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks/useViewSize';
import { agentOnboardingPrompt } from '../prompt';

jest.mock('../../../components/CopyBlock', () => ({
  CopyBlock: ({ text }: { text: string }) => <pre>{text}</pre>,
}));
jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockFlag = jest.mocked(useConditionalFeature);
const mockViewSize = jest.mocked(useViewSize);

const renderEntry = (isActive = true) =>
  render(
    <AgentOnboardingEntry isActive={isActive}>
      <button type="button">Continue with Google</button>
    </AgentOnboardingEntry>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockViewSize.mockReturnValue(true);
  mockFlag.mockReturnValue({ value: true, isLoading: false });
});

describe('AgentOnboardingEntry', () => {
  it('starts on the agent prompt and swaps to the regular sign-up', () => {
    renderEntry();

    expect(screen.getByRole('tab', { name: 'Use your agent' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText(agentOnboardingPrompt)).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).not.toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Sign up' }));

    expect(screen.queryByText(agentOnboardingPrompt)).not.toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeVisible();
  });

  it('shows only the regular sign-up for the control group', () => {
    mockFlag.mockReturnValue({ value: false, isLoading: false });

    renderEntry();

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeVisible();
  });

  it('keeps small screens out of the experiment', () => {
    mockViewSize.mockReturnValue(false);

    renderEntry();

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(mockFlag).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('hides the choice once a sign-up form is open', () => {
    renderEntry(false);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(mockFlag).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });
});
