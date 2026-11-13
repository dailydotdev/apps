import React from 'react';
import { render } from '@testing-library/react';
import { StreakFreeFreezesUpsellPopup } from './StreakFreeFreezesUpsellPopup';
import { ActionType } from '../../graphql/actions';
import { LazyModal } from '../modals/common/types';
import AlertContext from '../../contexts/AlertContext';
import type { AlertContextData } from '../../contexts/AlertContext';

const mockOpenModal = jest.fn();
const mockCompleteAction = jest.fn();
let mockCompletedActions: ActionType[] = [];
let mockFreeFreezes: number | null = 0;
let mockIsFlagOn = true;
let mockHasAccessToCores = true;

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal, modal: undefined }),
}));

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    completeAction: mockCompleteAction,
    checkHasCompleted: (type: ActionType) =>
      mockCompletedActions.includes(type),
    isActionsFetched: true,
  }),
}));

jest.mock('../../hooks/streaks/useReadingStreak', () => ({
  useReadingStreak: () => ({
    streak: { current: 5, freezesAvailable: 0, freeFreezes: mockFreeFreezes },
    isStreaksEnabled: true,
  }),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({
    shouldEvaluate,
  }: {
    shouldEvaluate?: boolean;
  }) => ({
    value: shouldEvaluate !== false && mockIsFlagOn,
    isLoading: false,
  }),
}));

jest.mock('../../hooks/useCoresFeature', () => ({
  useHasAccessToCores: () => mockHasAccessToCores,
}));

const renderPopup = (showStreakMilestone = false) =>
  render(
    <AlertContext.Provider
      value={
        {
          alerts: { showStreakMilestone },
          loadedAlerts: true,
        } as AlertContextData
      }
    >
      <StreakFreeFreezesUpsellPopup />
    </AlertContext.Provider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockCompletedActions = [];
  mockFreeFreezes = 0;
  mockIsFlagOn = true;
  mockHasAccessToCores = true;
});

it('opens the upsell once the free freezes are used up and marks it seen', () => {
  renderPopup();

  expect(mockOpenModal).toHaveBeenCalledTimes(1);
  expect(mockOpenModal).toHaveBeenCalledWith({
    type: LazyModal.StreakFreeFreezesUpsell,
  });
  expect(mockCompleteAction).toHaveBeenCalledWith(
    ActionType.StreakFreeFreezesUpsell,
  );
});

it.each([
  [
    'it was already seen',
    () => {
      mockCompletedActions = [ActionType.StreakFreeFreezesUpsell];
    },
  ],
  [
    'free freezes are left',
    () => {
      mockFreeFreezes = 1;
    },
  ],
  [
    'the reader never got free freezes',
    () => {
      mockFreeFreezes = null;
    },
  ],
  [
    'the flag is off',
    () => {
      mockIsFlagOn = false;
    },
  ],
  [
    'the reader cannot buy freezes',
    () => {
      mockHasAccessToCores = false;
    },
  ],
])('does not open when %s', (_, arrange) => {
  arrange();

  renderPopup();

  expect(mockOpenModal).not.toHaveBeenCalled();
  expect(mockCompleteAction).not.toHaveBeenCalled();
});

it('waits for the milestone modal', () => {
  renderPopup(true);

  expect(mockOpenModal).not.toHaveBeenCalled();
});
