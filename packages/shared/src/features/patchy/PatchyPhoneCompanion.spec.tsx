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

// The header's spots sit at a fixed offset; jsdom has no layout.
let spotOffsets: Record<string, number>;
const restingSpot = {
  offsetLeft: 300,
  offsetTop: 10,
  offsetWidth: 24,
  offsetHeight: 24,
};

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
  spotOffsets = { ...restingSpot };
  Object.keys(restingSpot).forEach((key) => {
    jest
      .spyOn(HTMLElement.prototype, key as 'offsetLeft', 'get')
      .mockImplementation(function offset(this: HTMLElement) {
        return this === document.body ? 0 : spotOffsets[key];
      });
  });
  jest
    .spyOn(HTMLElement.prototype, 'offsetParent', 'get')
    .mockImplementation(function parent(this: HTMLElement) {
      return this === document.body ? null : document.body;
    });
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

it('leaves with the header as it scrolls away, so he never sits over the page', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);

  expect(face()).toBeNull();
  expect(screen.getByTestId('pill')).toHaveAttribute('data-hidden', 'no');
});

it('drops in on his pill spot to react while the header is away, and a tap brings it back', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  rerender(<Shell />);
  mockIsReacting = true;
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

  mockIsReacting = false;
  rerender(<Shell />);
  expect(face()).toBeNull();
});

it('mid-reaction, hands back to the pill only once the header has slid back in', () => {
  const { rerender } = render(<Shell />);
  mockShellP = 1;
  mockIsReacting = true;
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

it('on a post, stands among the header actions and only floats to react while it is away', () => {
  mockIsReading = true;
  const { rerender } = render(<Shell withPill={false} />);
  const spot = () => screen.getByTestId('patchy-actions-spot');

  expect(face()).toBeNull();
  expect(spot()).not.toHaveClass('invisible');

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(face()).toBeNull();

  mockIsReacting = false;
  mockShellP = 1;
  rerender(<Shell withPill={false} />);
  expect(face()).toBeNull();

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(face()).toHaveAttribute('data-position', 'actions');
  expect(face()).toHaveStyle({ left: '300px', top: '10px' });
  expect(spot()).toHaveClass('invisible');
});

it('lands on his spot after the header actions around it moved it', () => {
  mockIsReading = true;
  const { rerender } = render(<Shell withPill={false} />);

  spotOffsets.offsetLeft = 150;
  mockShellP = 1;
  rerender(<Shell withPill={false} />);
  mockIsReacting = true;
  rerender(<Shell withPill={false} />);

  expect(face()).toHaveStyle({ left: '150px', top: '10px' });
});

it('elsewhere without a pill, reacts below the header without touching its actions', () => {
  const { rerender } = render(<Shell withPill={false} />);
  expect(face()).toBeNull();

  mockIsReacting = true;
  rerender(<Shell withPill={false} />);
  expect(face()).toHaveAttribute('data-position', 'below');
  expect(screen.queryByTestId('header-actions')).not.toBeInTheDocument();
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
  mockIsReacting = true;
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
