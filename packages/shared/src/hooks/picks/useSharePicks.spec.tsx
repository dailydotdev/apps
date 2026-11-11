import { renderHook } from '@testing-library/react';
import { useSharePicks } from './useSharePicks';
import { LazyModal } from '../../components/modals/common/types';
import { Origin } from '../../lib/log';
import type { Picks } from '../../graphql/picks';

const mockOpenModal = jest.fn();

jest.mock('../useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

const picks = { id: 'picks-1', items: [] } as unknown as Picks;

beforeEach(() => jest.clearAllMocks());

// No GrowthBook provider, so weekly_picks stays at its default (off).
it('should open the share sheet outside the weekly picks rollout', () => {
  const { result } = renderHook(() => useSharePicks());

  result.current.openShareSheet(picks, Origin.PicksPage);

  expect(mockOpenModal).toHaveBeenCalledWith({
    type: LazyModal.SharePicks,
    props: { picks, origin: Origin.PicksPage },
  });
});
