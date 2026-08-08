import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  laptopQuery,
  mockMatchMedia,
} from '../../../../__tests__/helpers/media';
import { featureInterestAgent } from '../../../lib/featureManagement';
import { AgentFeedPrompt } from './AgentFeedPrompt';

const user = { id: 'u1' };
const tabletQuery = '(min-width: 656px)';

const renderPrompt = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featureInterestAgent.id]: { defaultValue: enabled } });

  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: user as never }}
      gb={gb}
    >
      <AgentFeedPrompt />
    </TestBootProvider>,
  );
};

const field = () => screen.queryByPlaceholderText(/Spawn an agent/i);

beforeEach(() => jest.clearAllMocks());

describe('AgentFeedPrompt', () => {
  // The floating bar and the pair on Explore are the same door. A phone gets
  // the pair, everything from tablet up gets the bar.
  it('docks over the feed from tablet up', () => {
    mockMatchMedia((query) => query === tabletQuery);
    renderPrompt();

    expect(field()).toBeInTheDocument();
  });

  it('is there on a desktop too', () => {
    mockMatchMedia((query) => query === tabletQuery || query === laptopQuery);
    renderPrompt();

    expect(field()).toBeInTheDocument();
  });

  it('stays away on a phone, where Explore carries the entry instead', () => {
    mockMatchMedia(() => false);
    const { container } = renderPrompt();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing at all with the flag off', () => {
    mockMatchMedia((query) => query === tabletQuery);
    const { container } = renderPrompt({ enabled: false });

    expect(container).toBeEmptyDOMElement();
  });
});
