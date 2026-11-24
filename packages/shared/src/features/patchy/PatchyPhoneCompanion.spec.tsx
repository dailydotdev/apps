import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LogEvent, TargetType } from '../../lib/log';
import { revealShell } from '../../components/shell/useShellScroll';
import {
  PatchyPhoneCompanion,
  usePatchyInHeader,
} from './PatchyPhoneCompanion';

const mockLogEvent = jest.fn();
let mockShellP = 0;
let mockIsReacting = false;

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1' } }),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));
jest.mock('../../hooks/streaks', () => ({
  useReadingStreak: () => ({ streak: { current: 5 }, isStreaksEnabled: true }),
}));
jest.mock('../../hooks/streaks/useStreakRingState', () => ({
  useStreakRingState: () => ({
    isLoading: false,
    streak: { lastViewAt: null },
    state: 'safe',
    hasReadToday: true,
    goalProgress: { ratio: 1 },
  }),
}));
jest.mock('../../components/shell/useShellScroll', () => ({
  useShellScroll: () => ({ p: mockShellP }),
  revealShell: jest.fn(),
}));
jest.mock('./usePatchyEnabled', () => ({
  usePatchyEnabled: ({ shouldEvaluate }: { shouldEvaluate: boolean }) =>
    shouldEvaluate,
}));
jest.mock('./usePatchyRail', () => ({
  usePatchyRail: () => ({
    face: mockIsReacting ? 'delighted' : 'happy',
    motion: null,
    motionKey: 'idle-0',
    emote: mockIsReacting ? 'hearts' : null,
    emoteCount: mockIsReacting ? 3 : 0,
    emoteKey: mockIsReacting ? 1 : 0,
    isReacting: mockIsReacting,
  }),
}));

const HeaderPill = () => {
  usePatchyInHeader();
  return null;
};

const renderShell = ({ withPill = true, isPhone = true } = {}) =>
  render(
    <PatchyPhoneCompanion isPhone={isPhone}>
      {withPill && <HeaderPill />}
    </PatchyPhoneCompanion>,
  );

const peek = () =>
  document.querySelector<HTMLElement>('[data-position]')?.dataset.position;

beforeEach(() => {
  jest.clearAllMocks();
  mockShellP = 0;
  mockIsReacting = false;
});

it('stays tucked while the header shows him in its pill', () => {
  renderShell();
  expect(peek()).toBe('tucked');

  mockIsReacting = true;
  renderShell();
  expect(peek()).toBe('tucked');
});

it('peeks from the top once the header scrolls away, and a tap brings it back', () => {
  mockShellP = 1;
  renderShell();
  expect(peek()).toBe('peek');

  fireEvent.click(screen.getByRole('button', { name: 'Show Patchy' }));
  expect(revealShell).toHaveBeenCalled();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.Patchy,
    extra: JSON.stringify({ origin: 'peek' }),
  });
});

it('drops in to react while the header is away', () => {
  mockShellP = 1;
  mockIsReacting = true;
  renderShell();
  expect(peek()).toBe('drop');
});

it('drops in to react on pages without his pill, and hides otherwise', () => {
  renderShell({ withPill: false });
  expect(peek()).toBe('tucked');

  mockIsReacting = true;
  renderShell({ withPill: false });
  expect(document.querySelectorAll('[data-position="drop"]')).toHaveLength(1);
});

it('is not there off phones', () => {
  renderShell({ isPhone: false });
  expect(peek()).toBeUndefined();
});
