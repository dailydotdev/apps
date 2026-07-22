import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { HotTake } from '../../../../graphql/user/userHotTake';
import { HotTakeItem } from './HotTakeItem';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import loggedUser from '../../../../../__tests__/fixture/loggedUser';
import { useEngagementBarV2 } from '../../../../hooks/useEngagementBarV2';
import { useHotTakeShareEnabled } from '../../../../hooks/useHotTakeShareEnabled';

jest.mock('../../../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

jest.mock('../../../../hooks/useHotTakeShareEnabled', () => ({
  useHotTakeShareEnabled: jest.fn(),
}));

const engagementBarMock = useEngagementBarV2 as jest.Mock;
const shareEnabledMock = useHotTakeShareEnabled as jest.Mock;

const item: HotTake = {
  id: 'take-1',
  emoji: '🔥',
  title: 'Small PRs or bust',
  subtitle: 'Review time is a feature',
  position: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  upvotes: 3,
  upvoted: false,
};

const shareLabel = 'Share "Small PRs or bust"';

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  engagementBarMock.mockReturnValue(false);
  shareEnabledMock.mockReturnValue(true);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

const renderItem = (
  props: Partial<Parameters<typeof HotTakeItem>[0]> = {},
): RenderResult =>
  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <HotTakeItem
        item={item}
        isOwner={false}
        ownerUsername="spicydev"
        onUpvoteClick={jest.fn()}
        {...props}
      />
    </TestBootProvider>,
  );

describe.each([
  ['V1', false],
  ['V2', true],
])('HotTakeItem %s share control', (_, isV2) => {
  beforeEach(() => engagementBarMock.mockReturnValue(isV2));

  it('renders exactly one share control next to the existing actions', () => {
    renderItem();

    expect(screen.getAllByLabelText(shareLabel)).toHaveLength(1);
    // The upvote affordance is untouched.
    expect(screen.getByLabelText(/upvote/i)).toBeInTheDocument();
  });

  it('renders no share control without an owner username', () => {
    renderItem({ ownerUsername: undefined });

    expect(screen.queryByLabelText(shareLabel)).not.toBeInTheDocument();
  });

  it('is byte-identical to the pre-share markup when the flag is off', () => {
    shareEnabledMock.mockReturnValue(false);
    const { container: flagOff } = renderItem();
    // Rendering without the new prop is the exact markup this PR branched off.
    const { container: baseline } = renderItem({ ownerUsername: undefined });

    expect(screen.queryAllByLabelText(shareLabel)).toHaveLength(0);
    expect(flagOff.innerHTML).toBe(baseline.innerHTML);
  });
});
