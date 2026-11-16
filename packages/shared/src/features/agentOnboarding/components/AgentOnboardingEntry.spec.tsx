import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentOnboardingEntry } from './AgentOnboardingEntry';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks/useViewSize';
import { agentOnboardingPrompt } from '../prompt';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockFlag = jest.mocked(useConditionalFeature);
const mockViewSize = jest.mocked(useViewSize);
const writeText = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockViewSize.mockReturnValue(true);
  mockFlag.mockReturnValue({ value: true, isLoading: false });
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});

const copyButton = () =>
  screen.getByRole('button', { name: 'Set up with your coding agent' });

describe('AgentOnboardingEntry', () => {
  it('copies the prompt and says what to do next', async () => {
    render(<AgentOnboardingEntry />);

    await userEvent.click(copyButton());

    expect(writeText).toHaveBeenCalledWith(agentOnboardingPrompt);
    expect(
      await screen.findByRole('button', { name: 'Prompt copied' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Paste it into your coding agent/),
    ).toBeInTheDocument();
  });

  it('shows the prompt when the clipboard is blocked', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    render(<AgentOnboardingEntry />);

    await userEvent.click(copyButton());

    expect(await screen.findByText(agentOnboardingPrompt)).toBeInTheDocument();
  });

  it('renders nothing for the control group', () => {
    mockFlag.mockReturnValue({ value: false, isLoading: false });

    const { container } = render(<AgentOnboardingEntry />);

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps small screens out of the experiment', () => {
    mockViewSize.mockReturnValue(false);

    const { container } = render(<AgentOnboardingEntry />);

    expect(container).toBeEmptyDOMElement();
    expect(mockFlag).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });
});
