import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentOnboardingEntry } from './AgentOnboardingEntry';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks/useViewSize';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockFlag = jest.mocked(useConditionalFeature);
const mockViewSize = jest.mocked(useViewSize);

beforeEach(() => {
  jest.clearAllMocks();
  mockViewSize.mockReturnValue(true);
  mockFlag.mockReturnValue({ value: true, isLoading: false });
});

describe('AgentOnboardingEntry', () => {
  it('links to agent onboarding when the experiment is on', () => {
    render(<AgentOnboardingEntry />);

    expect(
      screen.getByRole('link', { name: 'Let it set up daily.dev for you' }),
    ).toHaveAttribute('href', '/agents/onboarding');
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
