import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import NewStreakModal from './NewStreakModal';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { useShareCelebrations } from '../../../hooks/useShareCelebrations';

jest.mock('../../../hooks/useShareCelebrations', () => ({
  __esModule: true,
  useShareCelebrations: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useActions: () => ({
    completeAction: jest.fn(),
    checkHasCompleted: () => false,
    isActionsFetched: true,
  }),
}));

const useShareCelebrationsMock = useShareCelebrations as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useShareCelebrationsMock.mockReturnValue(false);
});

const renderModal = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <NewStreakModal
        isOpen
        currentStreak={10}
        maxStreak={20}
        onRequestClose={jest.fn()}
      />
    </TestBootProvider>,
  );

describe('NewStreakModal — share celebration', () => {
  it('renders the milestone with no share control when the flag is off', () => {
    renderModal();

    expect(screen.getByText('10 days streak')).toBeInTheDocument();
    expect(screen.queryByLabelText('Share streak')).not.toBeInTheDocument();
    expect(screen.queryByText('Share your streak')).not.toBeInTheDocument();
  });

  it('renders exactly one share control when the flag is on', () => {
    useShareCelebrationsMock.mockReturnValue(true);
    renderModal();

    expect(screen.getAllByLabelText('Share streak')).toHaveLength(1);
    expect(screen.getByText('Share your streak')).toBeInTheDocument();
  });
});
