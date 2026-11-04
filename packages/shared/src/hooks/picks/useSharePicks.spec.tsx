import { renderHook } from '@testing-library/react';
import { useSharePicks } from './useSharePicks';
import { LazyModal } from '../../components/modals/common/types';
import { Origin } from '../../lib/log';
import type { Picks } from '../../graphql/picks';

const mockOpenModal = jest.fn();
let mockEnabled = true;

jest.mock('../useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));
jest.mock('../../components/GrowthBookProvider', () => ({
  useFeature: () => mockEnabled,
}));

const picks = { id: 'picks-1', items: [] } as unknown as Picks;

beforeEach(() => jest.clearAllMocks());

it('should open the share sheet when weekly picks is on', () => {
  mockEnabled = true;
  const { result } = renderHook(() => useSharePicks());

  result.current.openShareSheet(picks, Origin.PicksPage);

  expect(mockOpenModal).toHaveBeenCalledWith({
    type: LazyModal.SharePicks,
    props: { picks, origin: Origin.PicksPage },
  });
});

it('should do nothing when weekly picks is off', () => {
  mockEnabled = false;
  const { result } = renderHook(() => useSharePicks());

  result.current.openShareSheet(picks, Origin.PicksPage);

  expect(mockOpenModal).not.toHaveBeenCalled();
});
