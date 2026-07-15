import React from 'react';
import type { RefObject } from 'react';
import { render } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { GivebackLiveActivityListener } from './GivebackLiveActivityListener';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import type { ContributionMilestone } from '../types';
import { APP_KEY_PREFIX } from '../../../lib/storage';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('../../../hooks/useSubscription', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

const LAST_MILESTONE_STORAGE_KEY = `${APP_KEY_PREFIX}:giveback:last-milestone`;

const milestone = (id: string, value: number): ContributionMilestone => ({
  id,
  value,
  title: null,
  reachedAt: '2026-07-14T11:02:21.000Z',
});

const renderListener = (
  reached: ContributionMilestone | null,
): { showPrompt: jest.Mock } => {
  mockUseQuery.mockReturnValue({
    data: reached
      ? { contributionLastReachedMilestone: reached }
      : { contributionLastReachedMilestone: null },
  } as unknown as ReturnType<typeof useQuery>);

  const showPrompt = jest.fn();
  const dock = {
    current: { showPrompt } as unknown as GivebackGiftDockHandle,
  } as RefObject<GivebackGiftDockHandle>;

  render(<GivebackLiveActivityListener dock={dock} />);
  return { showPrompt };
};

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

it('pops on first sight when the visitor has never seen a milestone', () => {
  const { showPrompt } = renderListener(milestone('m-500', 500));

  expect(showPrompt).toHaveBeenCalledTimes(1);
  expect(window.localStorage.getItem(LAST_MILESTONE_STORAGE_KEY)).toBe('m-500');
});

it('does not re-pop a milestone the visitor already saw', () => {
  window.localStorage.setItem(LAST_MILESTONE_STORAGE_KEY, 'm-500');

  const { showPrompt } = renderListener(milestone('m-500', 500));

  expect(showPrompt).not.toHaveBeenCalled();
});

it('pops when a new milestone is crossed since the last seen one', () => {
  window.localStorage.setItem(LAST_MILESTONE_STORAGE_KEY, 'm-100');

  const { showPrompt } = renderListener(milestone('m-500', 500));

  expect(showPrompt).toHaveBeenCalledTimes(1);
  expect(window.localStorage.getItem(LAST_MILESTONE_STORAGE_KEY)).toBe('m-500');
});

it('does nothing when no milestone has been reached', () => {
  const { showPrompt } = renderListener(null);

  expect(showPrompt).not.toHaveBeenCalled();
  expect(window.localStorage.getItem(LAST_MILESTONE_STORAGE_KEY)).toBeNull();
});
