import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { StreakFreezeRow } from './StreakFreezeRow';
import { LazyModal } from '../../modals/common/types';

const mockOpenModal = jest.fn();
let mockFreezesAvailable = 0;
let mockIsFlagOn = false;
let mockHasAccessToCores = false;

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ isAuthReady: true, isLoggedIn: true }),
}));

jest.mock('../../../hooks/streaks/useReadingStreak', () => ({
  useReadingStreak: () => ({
    isStreaksEnabled: true,
    streak: { freezesAvailable: mockFreezesAvailable },
  }),
}));

jest.mock('../../../hooks/streaks/useStreakFreeze', () => ({
  useStreakFreeze: () => ({ freezesAvailable: mockFreezesAvailable }),
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({
    shouldEvaluate,
  }: {
    shouldEvaluate?: boolean;
  }) => ({
    value: shouldEvaluate !== false && mockIsFlagOn,
    isLoading: false,
  }),
}));

jest.mock('../../../hooks/useCoresFeature', () => ({
  useHasAccessToCores: () => mockHasAccessToCores,
}));

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockFreezesAvailable = 0;
  mockIsFlagOn = false;
  mockHasAccessToCores = false;
});

describe('StreakFreezeRow', () => {
  it('shows held freezes when the flag is off and there is no Cores access, without a way to buy', () => {
    mockFreezesAvailable = 2;

    render(<StreakFreezeRow />);

    expect(screen.getByText('2 streak freezes left')).toBeInTheDocument();
    expect(screen.queryByText('Buy more')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows held freezes in the panel without a buy button when there is no Cores access', () => {
    mockFreezesAvailable = 1;

    render(<StreakFreezeRow variant="panel" />);

    expect(screen.getByText('1 streak freeze left')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lets a reader with Cores access buy more while holding freezes and the flag off', () => {
    mockFreezesAvailable = 2;
    mockHasAccessToCores = true;

    render(<StreakFreezeRow />);

    fireEvent.click(screen.getByRole('button', { name: /Buy more/ }));
    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.StreakFreezePurchase,
    });
  });

  it('hides the row without freezes when the flag is off', () => {
    mockHasAccessToCores = true;

    const { container } = render(<StreakFreezeRow />);

    expect(container).toBeEmptyDOMElement();
  });

  it('hides the row without freezes and without Cores access even with the flag on', () => {
    mockIsFlagOn = true;

    const { container } = render(<StreakFreezeRow />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the buy row with the flag on and Cores access', () => {
    mockIsFlagOn = true;
    mockHasAccessToCores = true;

    render(<StreakFreezeRow />);

    expect(screen.getByText('Buy freezes')).toBeInTheDocument();
  });
});
