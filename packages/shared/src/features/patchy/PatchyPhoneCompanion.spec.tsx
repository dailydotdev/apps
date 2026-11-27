import React, { useEffect } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LogEvent, TargetType } from '../../lib/log';
import { revealShell } from '../../components/shell/useShellScroll';
import { PatchyPhoneCompanion, usePatchyAnchor } from './PatchyPhoneCompanion';

const mockLogEvent = jest.fn();
let mockShellP = 0;
let mockIsReacting = false;
let mockIsReading = false;

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
jest.mock('../../components/shell/ShellPageContext', () => ({
  useShellPageConfig: () => null,
  ShellActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-actions">{children}</div>
  ),
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
    isReading: mockIsReading,
  }),
}));

const HeaderPill = () => {
  const ref = usePatchyAnchor('pill');
  return <span ref={ref} data-testid="pill" />;
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

const dock = () =>
  document.querySelector<HTMLElement>('[data-position="dock"]') ?? null;
const isDocked = () => dock()?.getAttribute('data-docked') === 'yes';
const below = () =>
  document.querySelector<HTMLElement>('[data-position="below"]') ?? null;

beforeEach(() => {
  jest.clearAllMocks();
  mockShellP = 0;
  mockIsReacting = false;
  mockIsReading = false;
});

it('leaves him to the pill while the header is up, reacting or not', () => {
  const { rerender } = render(<Shell />);
  expect(isDocked()).toBe(false);
  expect(dock()).toHaveAttribute('aria-hidden', 'true');

  mockIsReacting = true;
  rerender(<Shell />);
  expect(isDocked()).toBe(false);
  expect(below()).toBeNull();
});

it('waits in his dock the whole time the header is away, and a tap brings it back', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);

  expect(isDocked()).toBe(true);
  expect(below()).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Show header' }));
  expect(revealShell).toHaveBeenCalled();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.Patchy,
    extra: JSON.stringify({ origin: 'dock' }),
  });
});

it('reacts in his dock rather than over the page', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  mockIsReacting = true;
  rerender(<Shell />);

  expect(isDocked()).toBe(true);
  expect(below()).toBeNull();

  mockIsReacting = false;
  rerender(<Shell />);
  expect(isDocked()).toBe(true);
});

it('leaves the dock as the header comes back', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);
  mockShellP = 0.5;
  rerender(<Shell />);

  expect(isDocked()).toBe(false);
  expect(
    screen.queryByRole('button', { name: 'Show header' }),
  ).not.toBeInTheDocument();
});

it('on a post, stands among the header actions and docks while it is away', () => {
  mockIsReading = true;
  const { rerender } = render(<Shell withPill={false} />);
  const spot = () => screen.getByTestId('patchy-actions-spot');

  expect(spot()).toBeInTheDocument();
  expect(isDocked()).toBe(false);

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(below()).toBeNull();

  mockShellP = 1;
  rerender(<Shell withPill={false} />);
  expect(isDocked()).toBe(true);
});

it('elsewhere without a spot, reacts below the header without touching its actions, and docks once it is away', () => {
  const { rerender } = render(<Shell withPill={false} />);
  expect(below()).toBeNull();

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(below()).toBeInTheDocument();
  expect(screen.queryByTestId('header-actions')).not.toBeInTheDocument();
  expect(isDocked()).toBe(false);

  mockShellP = 1;
  rerender(<Shell withPill={false} />);
  expect(below()).toBeNull();
  expect(isDocked()).toBe(true);
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

  expect(isDocked()).toBe(true);
  expect(mounts).toHaveBeenCalledTimes(1);
});

it('is not there off phones', () => {
  mockShellP = 1;
  render(<Shell isPhone={false} />);
  expect(dock()).toBeNull();
});
