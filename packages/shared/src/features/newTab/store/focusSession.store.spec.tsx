import React from 'react';
import { act, render, screen } from '@testing-library/react';
import {
  getElapsedMs,
  getRemainingMs,
  isSessionActive,
  isSessionPaused,
  useFocusSession,
  useFocusSettings,
} from './focusSession.store';

const Probe = (): JSX.Element => {
  const { session, start, pause, resume, end } = useFocusSession();
  return (
    <div>
      <span data-testid="active">{String(isSessionActive(session))}</span>
      <span data-testid="paused">{String(isSessionPaused(session))}</span>
      <span data-testid="duration">{session.durationMinutes}</span>
      <button type="button" onClick={() => start(50)}>
        start
      </button>
      <button type="button" onClick={() => pause()}>
        pause
      </button>
      <button type="button" onClick={() => resume()}>
        resume
      </button>
      <button type="button" onClick={() => end()}>
        end
      </button>
    </div>
  );
};

const SettingsProbe = (): JSX.Element => {
  const { settings, setDefaultDuration, setEscapeFriction } =
    useFocusSettings();
  return (
    <div>
      <span data-testid="default">{settings.defaultDurationMinutes}</span>
      <span data-testid="friction">{String(settings.escapeFriction)}</span>
      <button type="button" onClick={() => setDefaultDuration(90)}>
        set-90
      </button>
      <button type="button" onClick={() => setEscapeFriction(false)}>
        disable-friction
      </button>
    </div>
  );
};

describe('focusSession.store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to an inactive session', () => {
    render(<Probe />);
    expect(screen.getByTestId('active')).toHaveTextContent('false');
    expect(screen.getByTestId('paused')).toHaveTextContent('false');
    expect(screen.getByTestId('duration')).toHaveTextContent('25');
  });

  it('starts, pauses, resumes, and ends a session', () => {
    render(<Probe />);
    act(() => {
      screen.getByText('start').click();
    });
    expect(screen.getByTestId('active')).toHaveTextContent('true');
    expect(screen.getByTestId('duration')).toHaveTextContent('50');

    act(() => {
      screen.getByText('pause').click();
    });
    expect(screen.getByTestId('paused')).toHaveTextContent('true');

    act(() => {
      screen.getByText('resume').click();
    });
    expect(screen.getByTestId('paused')).toHaveTextContent('false');
    expect(screen.getByTestId('active')).toHaveTextContent('true');

    act(() => {
      screen.getByText('end').click();
    });
    expect(screen.getByTestId('active')).toHaveTextContent('false');
  });

  it('computes elapsed and remaining time correctly', () => {
    const start = 1_000_000;
    expect(
      getElapsedMs(
        {
          startedAt: start,
          durationMinutes: 25,
          pausedAt: null,
          pausedElapsedMs: 0,
          completedAt: null,
        },
        start + 10_000,
      ),
    ).toBe(10_000);

    expect(
      getRemainingMs(
        {
          startedAt: start,
          durationMinutes: 25,
          pausedAt: null,
          pausedElapsedMs: 0,
          completedAt: null,
        },
        start + 25 * 60 * 1000 + 500,
      ),
    ).toBe(0);
  });
});

describe('focusSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists default duration and escape friction toggle', () => {
    render(<SettingsProbe />);
    expect(screen.getByTestId('default')).toHaveTextContent('25');
    expect(screen.getByTestId('friction')).toHaveTextContent('true');

    act(() => {
      screen.getByText('set-90').click();
    });
    expect(screen.getByTestId('default')).toHaveTextContent('90');

    act(() => {
      screen.getByText('disable-friction').click();
    });
    expect(screen.getByTestId('friction')).toHaveTextContent('false');
  });
});
