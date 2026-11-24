import React, { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { LogEvent, TargetType } from '../../lib/log';
import { revealShell } from '../../components/shell/useShellScroll';
import {
  PatchyPhoneCompanion,
  usePatchyAnchor,
  usePatchyPhoneCompanion,
} from './PatchyPhoneCompanion';

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

// The header's spots measure as a fixed box; jsdom has no layout.
const spotBox = { left: 300, top: 10, width: 24, height: 24 } as DOMRect;

const HeaderPill = () => {
  const ref = usePatchyAnchor('pill');
  const companion = usePatchyPhoneCompanion();
  return (
    <span
      ref={ref}
      data-testid="pill"
      data-hidden={companion?.isFloating ? 'yes' : 'no'}
    />
  );
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

const face = () =>
  document.querySelector<HTMLElement>('button[data-position]') ?? null;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(spotBox);
  mockShellP = 0;
  mockIsReacting = false;
  mockIsReading = false;
});

afterEach(() => {
  jest.useRealTimers();
});

it('leaves him to the pill while the header is up, reacting or not', () => {
  const { rerender } = render(<Shell />);
  expect(face()).toBeNull();

  mockIsReacting = true;
  rerender(<Shell />);
  expect(face()).toBeNull();
  expect(screen.getByTestId('pill')).toHaveAttribute('data-hidden', 'no');
});

it('stays exactly on his pill spot as the header scrolls away, and a tap brings it back', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);

  expect(face()).toHaveAttribute('data-position', 'pill');
  expect(face()).toHaveStyle({ left: '300px', top: '10px' });
  expect(screen.getByTestId('pill')).toHaveAttribute('data-hidden', 'yes');

  fireEvent.click(screen.getByRole('button', { name: 'Show header' }));
  expect(revealShell).toHaveBeenCalled();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.Patchy,
    extra: JSON.stringify({ origin: 'peek' }),
  });
});

it('hands back to the pill only once the header has slid back in', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);

  mockShellP = 0;
  rerender(<Shell />);
  expect(face()).toHaveAttribute('data-position', 'pill');
  expect(
    screen.queryByRole('button', { name: 'Show header' }),
  ).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(220);
  });
  expect(face()).toBeNull();
  expect(screen.getByTestId('pill')).toHaveAttribute('data-hidden', 'no');
});

it('reacts where he stands instead of moving', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);
  mockIsReacting = true;
  rerender(<Shell />);

  expect(face()).toHaveAttribute('data-position', 'pill');
  expect(face()).toHaveStyle({ left: '300px' });
});

it('on a post, keeps a spot among the header actions and stays on it while scrolling', () => {
  mockIsReading = true;
  const { rerender } = render(<Shell withPill={false} />);

  expect(screen.getByTestId('header-actions')).toBeInTheDocument();
  expect(face()).toHaveAttribute('data-position', 'actions');
  expect(face()).toHaveStyle({ left: '300px', top: '10px' });

  mockShellP = 1;
  rerender(<Shell withPill={false} />);
  expect(face()).toHaveAttribute('data-position', 'actions');
  expect(face()).toHaveStyle({ left: '300px', top: '10px' });
});

it('elsewhere without a pill, shows up in the header only to react', () => {
  const { rerender } = render(<Shell withPill={false} />);
  expect(face()).toBeNull();
  expect(screen.queryByTestId('header-actions')).not.toBeInTheDocument();

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(face()).toHaveAttribute('data-position', 'actions');
  expect(
    screen.queryByRole('button', { name: 'Show header' }),
  ).not.toBeInTheDocument();
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
  rerender(
    <PatchyPhoneCompanion isPhone>
      <ShellBlock />
    </PatchyPhoneCompanion>,
  );

  expect(face()).toHaveAttribute('data-position', 'corner');
  expect(mounts).toHaveBeenCalledTimes(1);
});

it('is not there off phones', () => {
  mockShellP = 1;
  render(<Shell isPhone={false} />);
  expect(face()).toBeNull();
});
