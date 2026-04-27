import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';

const mockLogEvent = jest.fn();
const mockPauseFor = jest.fn();
const mockPauseUntilTomorrow = jest.fn();
const mockSetEnabled = jest.fn();
const mockSetSchedule = jest.fn();
const mockSetWindowsMode = jest.fn();
const mockOnDndSettings = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../../contexts/DndContext', () => ({
  useDndContext: () => ({
    setShowDnd: jest.fn(),
    onDndSettings: mockOnDndSettings,
    dndSettings: null,
  }),
}));

jest.mock('../../../lib/func', () => {
  const actual = jest.requireActual('../../../lib/func');
  return {
    ...actual,
    isExtension: false,
  };
});

const baseSchedule = {
  pauseUntil: null as number | null,
  windows: [] as Array<{ weekday: number; start: string; end: string }>,
  windowsMode: 'focus_during' as const,
  enabled: false,
};

let mockScheduleState = baseSchedule;

jest.mock('../store/focusSchedule.store', () => {
  const actual = jest.requireActual('../store/focusSchedule.store');
  return {
    ...actual,
    useFocusSchedule: () => ({
      schedule: mockScheduleState,
      setSchedule: mockSetSchedule,
      setEnabled: mockSetEnabled,
      setWindowsMode: mockSetWindowsMode,
      upsertWindow: jest.fn(),
      removeWindow: jest.fn(),
      pauseFor: mockPauseFor,
      pauseUntilTomorrow: mockPauseUntilTomorrow,
    }),
  };
});

// Imported AFTER the mocks above so the component picks up the mocked store.
// eslint-disable-next-line import/first, import/order
import { FocusSection } from './FocusSection';

describe('FocusSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScheduleState = { ...baseSchedule };
  });

  it('renders the take-a-break presets when no pause is active', () => {
    render(<FocusSection />);
    expect(screen.getByText(/Take a break/i)).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
    expect(screen.getByText('2 hours')).toBeInTheDocument();
    expect(screen.getByText('Until tomorrow')).toBeInTheDocument();
  });

  it('triggers a 30-minute pause when the 30 min preset is clicked', () => {
    render(<FocusSection />);
    fireEvent.click(screen.getByText('30 min'));
    expect(mockPauseFor).toHaveBeenCalledWith(30 * 60_000);
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        target_id: 'focus_pause_now',
        extra: expect.stringContaining('30m'),
      }),
    );
  });

  it('triggers an "until tomorrow" pause via the dedicated chip', () => {
    render(<FocusSection />);
    fireEvent.click(screen.getByText('Until tomorrow'));
    expect(mockPauseUntilTomorrow).toHaveBeenCalled();
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        target_id: 'focus_pause_now',
        extra: expect.stringContaining('until_tomorrow'),
      }),
    );
  });

  it('shows the active pause row and resumes when Resume is pressed', () => {
    mockScheduleState = {
      ...baseSchedule,
      pauseUntil: Date.now() + 30 * 60_000,
    };
    render(<FocusSection />);

    expect(screen.getByText(/Paused until/i)).toBeInTheDocument();
    expect(screen.queryByText('30 min')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(mockPauseFor).toHaveBeenCalledWith(null);
  });

  it('seeds weekdays 9-5 the first time the schedule toggle flips on', () => {
    render(<FocusSection />);
    const toggle = screen.getByLabelText(/Active hours/i, {
      selector: 'input',
    });
    act(() => {
      fireEvent.click(toggle);
    });
    expect(mockSetSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        windowsMode: 'focus_during',
        windows: expect.arrayContaining([
          expect.objectContaining({ weekday: 1, start: '09:00', end: '17:00' }),
          expect.objectContaining({ weekday: 5, start: '09:00', end: '17:00' }),
        ]),
      }),
    );
  });

  it('toggles the existing schedule off without re-seeding when windows already exist', () => {
    mockScheduleState = {
      ...baseSchedule,
      enabled: true,
      windows: [{ weekday: 1, start: '09:00', end: '17:00' }],
    };
    render(<FocusSection />);
    const toggle = screen.getByLabelText(/Active hours/i, {
      selector: 'input',
    });
    act(() => {
      fireEvent.click(toggle);
    });
    expect(mockSetEnabled).toHaveBeenCalledWith(false);
    expect(mockSetSchedule).not.toHaveBeenCalled();
  });
});
