import React, { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

const Shell = ({
  withPill = true,
  isPhone = true,
}: {
  withPill?: boolean;
  isPhone?: boolean;
}) => (
  <PatchyPhoneCompanion isPhone={isPhone}>
    {withPill && <HeaderPill />}
  </PatchyPhoneCompanion>
);

const peek = () =>
  document.querySelector<HTMLElement>('[data-position]')?.dataset.position;

beforeEach(() => {
  jest.clearAllMocks();
  mockShellP = 0;
  mockIsReacting = false;
});

it('stays away while the header shows him in its pill, reacting or not', () => {
  const { rerender } = render(<Shell />);
  expect(peek()).toBeUndefined();

  mockIsReacting = true;
  rerender(<Shell />);
  expect(peek()).toBeUndefined();
});

it('peeks from the top once the header scrolls away, and a tap brings it back', () => {
  mockShellP = 1;
  render(<Shell />);
  expect(peek()).toBe('peek');

  fireEvent.click(screen.getByRole('button', { name: 'Show header' }));
  expect(revealShell).toHaveBeenCalled();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.Patchy,
    extra: JSON.stringify({ origin: 'peek' }),
  });
});

it('drops in to react while the header is away, out of reach of a tap', () => {
  mockShellP = 1;
  mockIsReacting = true;
  render(<Shell />);
  expect(peek()).toBe('drop');
  expect(
    screen.queryByRole('button', { name: 'Show header' }),
  ).not.toBeInTheDocument();
});

it('drops in to react on pages without his pill, and is gone otherwise', () => {
  const { rerender } = render(<Shell withPill={false} />);
  expect(peek()).toBeUndefined();

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(peek()).toBe('drop');
});

it('slides away after a reaction, then leaves the layout', () => {
  jest.useFakeTimers();
  mockIsReacting = true;
  const { rerender } = render(<Shell withPill={false} />);
  expect(peek()).toBe('drop');

  mockIsReacting = false;
  rerender(<Shell withPill={false} />);
  expect(peek()).toBe('tucked');
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(peek()).toBeUndefined();
  jest.useRealTimers();
});

it('turns on without remounting the shell under him', () => {
  const mounts = jest.fn();
  const ShellBlock = () => {
    useEffect(mounts, []);
    return null;
  };
  const { rerender } = render(
    <PatchyPhoneCompanion isPhone={false}>
      <ShellBlock />
    </PatchyPhoneCompanion>,
  );
  mockShellP = 1;
  mockIsReacting = true;
  rerender(
    <PatchyPhoneCompanion isPhone>
      <ShellBlock />
    </PatchyPhoneCompanion>,
  );

  expect(peek()).toBe('drop');
  expect(mounts).toHaveBeenCalledTimes(1);
});

it('is not there off phones', () => {
  mockShellP = 1;
  render(<Shell isPhone={false} />);
  expect(peek()).toBeUndefined();
});
